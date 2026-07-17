import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber, formatPrice } from '@/lib/utils';
import { sendOrderConfirmation, sendAdminOrderAlert, sendLowStockAlert } from '@/lib/email';
import { logger } from '@/lib/logger';
import type Stripe from 'stripe';

interface OrderItemMeta {
  id: string;
  qty: number;
}

interface ContactMeta {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface AddressMeta {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error({ err }, '[Stripe Webhook] Signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      if (session.payment_status !== 'paid') break;

      // Idempotency: Stripe redelivers events (retries, duplicate delivery).
      // Check explicitly instead of relying on a unique-constraint throw so a
      // replay is a clean no-op rather than an error we'd otherwise swallow.
      const existingPayment = await prisma.payment.findUnique({
        where: { stripeSessionId: session.id },
        select: { id: true },
      });
      if (existingPayment) {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }

      try {
        const metadata = session.metadata || {};
        const orderItems = JSON.parse(metadata.orderItems || '[]') as OrderItemMeta[];
        const shippingAddress = JSON.parse(metadata.shippingAddress || '{}') as AddressMeta;
        const contactInfo = JSON.parse(metadata.contactInfo || '{}') as ContactMeta;
        const orderNumber = generateOrderNumber();
        const userId = metadata.userId || null;
        const couponId = metadata.couponId || null;
        const discountAmount = Number(metadata.discountAmount || 0);
        const shippingCost = Number(metadata.shippingCost || 0);
        const taxAmount = Number(metadata.taxAmount || 0);

        const products = await prisma.product.findMany({
          where: { id: { in: orderItems.map((i) => i.id) } },
          include: { images: { where: { isFeatured: true }, take: 1 }, inventory: true },
        });

        type ProductWithRelations = typeof products[number];

        const totalAmount = (session.amount_total || 0) / 100;

        // Order creation, coupon-usage recording, and inventory decrement all
        // happen in one transaction — previously these were separate,
        // unguarded writes, so a crash partway through could leave an order
        // with no inventory decrement or no coupon-usage record.
        const order = await prisma.$transaction(async (tx) => {
          const created = await tx.order.create({
            data: {
              orderNumber,
              userId,
              guestEmail: session.customer_email || contactInfo.email || null,
              status: 'CONFIRMED',
              subtotal: (session.amount_subtotal || 0) / 100 - taxAmount,
              shippingCost,
              taxAmount,
              discountAmount,
              couponId,
              total: totalAmount,
              items: {
                create: orderItems.map((item) => {
                  const product: ProductWithRelations | undefined = products.find(
                    (p: ProductWithRelations) => p.id === item.id
                  );
                  return {
                    productId: product?.id,
                    productName: product?.name || 'Unknown Product',
                    productSku: product?.sku || 'N/A',
                    quantity: item.qty,
                    unitPrice: product?.salePrice ? Number(product.salePrice) : Number(product?.basePrice || 0),
                    totalPrice: (product?.salePrice ? Number(product.salePrice) : Number(product?.basePrice || 0)) * item.qty,
                    imageUrl: product?.images[0]?.url || null,
                  };
                }),
              },
              shippingAddress: {
                create: {
                  firstName: contactInfo.firstName || '',
                  lastName: contactInfo.lastName || '',
                  address1: shippingAddress.address1 || '',
                  address2: shippingAddress.address2 || null,
                  city: shippingAddress.city || '',
                  state: shippingAddress.state || '',
                  zipCode: shippingAddress.zipCode || '',
                  country: shippingAddress.country || 'US',
                  phone: contactInfo.phone || null,
                },
              },
              payment: {
                create: {
                  stripeSessionId: session.id,
                  stripePaymentIntentId: (session.payment_intent as string) || null,
                  amount: totalAmount,
                  currency: 'usd',
                  status: 'SUCCEEDED',
                  method: 'card',
                },
              },
            },
            include: { items: true },
          });

          // Record coupon usage
          if (couponId) {
            await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
            if (userId) {
              await tx.couponUsage.create({ data: { userId, couponId, orderId: created.id } });
            }
          }

          // Decrement inventory, floor-guarded at zero so a race between two
          // concurrent fulfillments can never drive stock negative. Payment
          // has already succeeded at this point, so the order is fulfilled
          // regardless — a clamp to zero means the item was oversold and is
          // flagged below for manual review rather than silently hidden.
          for (const item of orderItems) {
            const product: ProductWithRelations | undefined = products.find(
              (p: ProductWithRelations) => p.id === item.id
            );
            if (!product?.inventory) continue;

            await tx.$executeRaw`
              UPDATE Inventory
              SET quantity = GREATEST(quantity - ${item.qty}, 0)
              WHERE productId = ${product.id}
            `;
          }

          return created;
        });

        // Post-transaction: read back final inventory levels for alerting.
        // This runs after commit so it can't roll back the order/payment/
        // inventory write above if an email fails.
        for (const item of orderItems) {
          const product = products.find((p) => p.id === item.id);
          if (!product?.inventory) continue;

          const updatedInventory = await prisma.inventory.findUnique({ where: { id: product.inventory.id } });
          if (!updatedInventory) continue;

          const wasOversold = product.inventory.quantity - item.qty < 0 && updatedInventory.quantity === 0;
          if (wasOversold) {
            logger.error(
              { sku: product.sku, stockBefore: product.inventory.quantity, needed: item.qty, orderNumber: order.orderNumber },
              '[Stripe Webhook] Oversold — clamped to 0, needs manual reconciliation'
            );
          }
          if (updatedInventory.quantity <= updatedInventory.lowStockThreshold) {
            await sendLowStockAlert({
              productName: product.name,
              sku: product.sku,
              currentStock: updatedInventory.quantity,
              threshold: updatedInventory.lowStockThreshold,
            });
          }
        }

        // Send order confirmation email
        const customerEmail = session.customer_email || contactInfo.email;
        if (customerEmail) {
          await sendOrderConfirmation(customerEmail, {
            customerName: `${contactInfo.firstName || ''} ${contactInfo.lastName || ''}`.trim() || 'Valued Customer',
            orderNumber,
            items: (order.items as Array<{ productName: string; quantity: number; totalPrice: number | { toNumber(): number } }>)
              .map((orderItem) => ({
                name: orderItem.productName,
                quantity: orderItem.quantity,
                price: formatPrice(Number(orderItem.totalPrice)),
              })),
            subtotal: formatPrice(Number(order.subtotal)),
            shipping: formatPrice(Number(order.shippingCost)),
            tax: formatPrice(Number(order.taxAmount)),
            total: formatPrice(Number(order.total)),
            shippingAddress: `${shippingAddress.address1 || ''}\n${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}`,
          });
        }

        await sendAdminOrderAlert({
          orderNumber,
          customerEmail: customerEmail || 'Unknown',
          total: formatPrice(totalAmount),
          itemCount: orderItems.reduce((sum, item) => sum + item.qty, 0),
        });
      } catch (error) {
        logger.error({ err: error }, '[Stripe Webhook] Order creation failed');
        // Return a non-2xx status so Stripe retries this event per its
        // standard backoff schedule instead of treating a transient failure
        // (DB blip, etc.) as handled and never trying again. The idempotency
        // check above makes a subsequent retry safe.
        return NextResponse.json({ error: 'Order processing failed' }, { status: 500 });
      }
      break;
    }

    case 'charge.refunded': {
      // Keeps the DB in sync with Stripe's actual refund state regardless of
      // how the refund was issued (admin action below, or directly in the
      // Stripe Dashboard) — Stripe remains the source of truth.
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
      if (!paymentIntentId) break;

      try {
        const payment = await prisma.payment.findUnique({
          where: { stripePaymentIntentId: paymentIntentId },
          include: { order: true },
        });
        if (!payment) break;

        const isFullyRefunded = charge.amount_refunded >= charge.amount;
        if (isFullyRefunded && payment.status !== 'REFUNDED') {
          await prisma.$transaction([
            prisma.payment.update({ where: { id: payment.id }, data: { status: 'REFUNDED' } }),
            prisma.order.update({ where: { id: payment.orderId }, data: { status: 'REFUNDED' } }),
          ]);
        }
      } catch (error) {
        logger.error({ err: error }, '[Stripe Webhook] Refund sync failed');
        return NextResponse.json({ error: 'Refund sync failed' }, { status: 500 });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
