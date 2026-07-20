'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@prisma/client';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { orderStatusSchema } from '@/lib/validations';
import { stripe } from '@/lib/stripe';
import { sendShippingNotification } from '@/lib/email';
import { writeAuditLog } from '@/lib/audit-log';
import { logger } from '@/lib/logger';

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminNotes?: string,
  trackingNumber?: string,
  trackingUrl?: string
) {
  const session = await requireAdminRole(ROLE_GROUPS.ORDER_WRITE);

  // Refunds must go through refundOrder() below, which actually calls
  // Stripe — this path only ever changes an internal fulfillment label, and
  // must never silently mark an order refunded without moving any money.
  if (newStatus === 'REFUNDED') {
    return { success: false, error: 'Use "Issue Refund" to refund an order — this only updates status.' };
  }

  const parsed = orderStatusSchema.safeParse({ status: newStatus, adminNotes, trackingNumber, trackingUrl });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, adminNotes: true, trackingNumber: true, trackingUrl: true, orderNumber: true, guestEmail: true, user: { select: { email: true, name: true } } },
    });
    if (!existing) {
      return { success: false, error: 'Order not found' };
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: parsed.data.status,
        ...(parsed.data.adminNotes !== undefined && { adminNotes: parsed.data.adminNotes }),
        ...(parsed.data.trackingNumber !== undefined && { trackingNumber: parsed.data.trackingNumber || null }),
        ...(parsed.data.trackingUrl !== undefined && { trackingUrl: parsed.data.trackingUrl || null }),
      },
    });

    await writeAuditLog({
      session,
      action: 'order.updated',
      targetType: 'Order',
      targetId: orderId,
      before: { status: existing.status, adminNotes: existing.adminNotes, trackingNumber: existing.trackingNumber, trackingUrl: existing.trackingUrl },
      after: { status: order.status, adminNotes: order.adminNotes, trackingNumber: order.trackingNumber, trackingUrl: order.trackingUrl },
    });

    // Notify the customer the first time a tracking number is attached to a
    // shipped order, rather than on every subsequent edit to the order.
    const justShippedWithTracking =
      parsed.data.status === 'SHIPPED' &&
      !!parsed.data.trackingNumber &&
      existing.trackingNumber !== parsed.data.trackingNumber;

    if (justShippedWithTracking) {
      const recipientEmail = existing.user?.email || existing.guestEmail;
      if (recipientEmail) {
        await sendShippingNotification(recipientEmail, {
          customerName: existing.user?.name || 'Valued Customer',
          orderNumber: existing.orderNumber,
          trackingNumber: parsed.data.trackingNumber!,
          trackingUrl: parsed.data.trackingUrl || undefined,
        });
      }
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    return { success: true, order };
  } catch (error) {
    logger.error({ err: error, orderId }, 'Error updating order');
    return { success: false, error: 'Failed to update order' };
  }
}

export async function refundOrder(orderId: string): Promise<void> {
  const session = await requireAdminRole(ROLE_GROUPS.REFUND_WRITE);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order?.payment) {
    return;
  }
  if (!order.payment.stripePaymentIntentId) {
    return;
  }
  if (order.payment.status === 'REFUNDED') {
    return;
  }
  if (order.payment.status !== 'SUCCEEDED') {
    return;
  }

  try {
    // Idempotency key tied to the order — retrying this action (e.g. a
    // double-click) can never issue two refunds for the same order.
    await stripe.refunds.create(
      { payment_intent: order.payment.stripePaymentIntentId },
      { idempotencyKey: `refund-${order.id}` }
    );

    // Reflect the refund immediately rather than waiting on the async
    // charge.refunded webhook — that webhook still runs and idempotently
    // confirms the same end state, acting as a safety net if this update
    // fails after the Stripe call already succeeded.
    await prisma.$transaction([
      prisma.payment.update({ where: { id: order.payment.id }, data: { status: 'REFUNDED' } }),
      prisma.order.update({ where: { id: order.id }, data: { status: 'REFUNDED' } }),
    ]);

    await writeAuditLog({
      session,
      action: 'order.refunded',
      targetType: 'Order',
      targetId: orderId,
      before: { paymentStatus: 'SUCCEEDED', orderStatus: order.status },
      after: { paymentStatus: 'REFUNDED', orderStatus: 'REFUNDED', amount: Number(order.total) },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
  } catch (error) {
    logger.error({ err: error, orderId }, 'Error issuing refund');
  }
}

export async function updateOrderStatusFromForm(orderId: string, formData: FormData): Promise<void> {
  await updateOrderStatus(
    orderId,
    formData.get('status') as OrderStatus,
    formData.get('adminNotes') as string,
    formData.get('trackingNumber') as string,
    formData.get('trackingUrl') as string
  );
}
