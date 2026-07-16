import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber, formatPrice } from '@/lib/utils';
import { sendOrderConfirmation, sendAdminOrderAlert, sendLowStockAlert } from '@/lib/email';

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
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      if (session.payment_status !== 'paid') break;

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

        const order = await prisma.order.create({
          data: {
            orderNumber,
            userId,
            guestEmail: session.customer_email || contactInfo.email || null,
            status: 'CONFIRMED',
            subtotal: (session.amount_subtotal || 0) / 100,
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
          await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
          if (userId) {
            await prisma.couponUsage.create({ data: { userId, couponId, orderId: order.id } });
          }
        }

        // Update inventory
        for (const item of orderItems) {
          const product: ProductWithRelations | undefined = products.find(
            (p: ProductWithRelations) => p.id === item.id
          );
          if (product?.inventory) {
            await prisma.inventory.update({
              where: { id: product.inventory.id },
              data: { quantity: { decrement: item.qty } },
            });

            const updatedInventory = await prisma.inventory.findUnique({
              where: { id: product.inventory.id },
            });
            if (updatedInventory && updatedInventory.quantity <= updatedInventory.lowStockThreshold) {
              await sendLowStockAlert({
                productName: product.name,
                sku: product.sku,
                currentStock: updatedInventory.quantity,
                threshold: updatedInventory.lowStockThreshold,
              });
            }
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
        console.error('[Stripe Webhook] Order creation failed:', error);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
