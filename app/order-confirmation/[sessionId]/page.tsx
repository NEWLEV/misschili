import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

function minutesSince(unixSeconds: number): number {
  return (Date.now() / 1000 - unixSeconds) / 60;
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const order = await prisma.order.findFirst({
    where: { payment: { stripeSessionId: sessionId } },
    include: { items: true, shippingAddress: true, payment: true },
  });

  // Stripe redirects here immediately after payment, but the order is only
  // created once our webhook processes the event asynchronously — it may
  // not exist yet. Ask Stripe directly (source of truth) rather than
  // assuming success indefinitely if the webhook never lands.
  if (!order) {
    let paymentConfirmed = false;
    let sessionCreatedAt: number | null = null;
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentConfirmed = session.payment_status === 'paid';
      sessionCreatedAt = session.created;
    } catch {
      // Unknown/invalid session ID — fall through to the generic message
      // below rather than exposing Stripe error details to the customer.
    }

    if (!paymentConfirmed) {
      return (
        <div className="section-container section-padding text-center max-w-lg mx-auto">
          <h1 className="text-(--text-3xl) font-bold mb-(--space-4)" style={{ fontFamily: 'var(--font-display)' }}>
            We Couldn&apos;t Confirm This Payment
          </h1>
          <p className="text-(--color-text-secondary) mb-(--space-6)">
            This order wasn&apos;t completed, or the payment link has expired. If you were
            charged and don&apos;t see a confirmation email shortly, contact us at{' '}
            <a href={`mailto:${process.env.ADMIN_EMAIL || 'misschilihotsauce@gmail.com'}`} className="underline">
              {process.env.ADMIN_EMAIL || 'misschilihotsauce@gmail.com'}
            </a>{' '}
            and we&apos;ll sort it out.
          </p>
          <Link href="/cart"><Button variant="primary">Return to Cart</Button></Link>
        </div>
      );
    }

    const minutesSincePayment = sessionCreatedAt ? minutesSince(sessionCreatedAt) : 0;

    return (
      <div className="section-container section-padding text-center max-w-lg mx-auto">
        <h1 className="text-(--text-3xl) font-bold mb-(--space-4)" style={{ fontFamily: 'var(--font-display)' }}>
          Thank You for Your Order! 🌶️
        </h1>
        <p className="text-(--color-text-secondary) mb-(--space-6)">
          Your payment was successful and your order is being processed. A confirmation
          email with your order details is on its way — it may take a minute to arrive.
        </p>
        {minutesSincePayment > 5 && (
          <p className="text-(--text-sm) text-(--color-text-muted) mb-(--space-6)">
            Still not seeing it after a few minutes? Email{' '}
            <a href={`mailto:${process.env.ADMIN_EMAIL || 'misschilihotsauce@gmail.com'}`} className="underline">
              {process.env.ADMIN_EMAIL || 'misschilihotsauce@gmail.com'}
            </a>{' '}
            with this reference: <span className="font-mono">{sessionId}</span>
          </p>
        )}
        <Link href="/products"><Button variant="primary">Keep Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="section-container section-padding max-w-2xl mx-auto">
      <div className="text-center mb-(--space-8)">
        <h1 className="text-(--text-3xl) font-bold mb-(--space-3)" style={{ fontFamily: 'var(--font-display)' }}>
          Thank You for Your Order! 🌶️
        </h1>
        <p className="text-(--color-text-secondary)">
          Order <span className="font-semibold text-(--color-text)">{order.orderNumber}</span> is confirmed.
          A receipt has been emailed to you.
        </p>
      </div>

      <div className="card p-(--space-6) mb-(--space-6)">
        <h2 className="text-(--text-lg) font-semibold mb-(--space-4)">Order Summary</h2>
        <div className="divide-y divide-(--color-border)">
          {order.items.map((item) => (
            <div key={item.id} className="py-(--space-3) flex justify-between">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-(--text-sm) text-(--color-text-muted)">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatPrice(Number(item.totalPrice))}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-(--color-border) mt-(--space-4) pt-(--space-4) space-y-(--space-2) text-(--text-sm)">
          <div className="flex justify-between"><span className="text-(--color-text-muted)">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
          <div className="flex justify-between"><span className="text-(--color-text-muted)">Shipping</span><span>{Number(order.shippingCost) === 0 ? 'Free' : formatPrice(Number(order.shippingCost))}</span></div>
          <div className="flex justify-between"><span className="text-(--color-text-muted)">Tax</span><span>{formatPrice(Number(order.taxAmount))}</span></div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-(--color-success)"><span>Discount</span><span>−{formatPrice(Number(order.discountAmount))}</span></div>
          )}
          <div className="flex justify-between font-bold text-(--text-base) pt-(--space-2) border-t border-(--color-border)">
            <span>Total</span><span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="card p-(--space-6) mb-(--space-6)">
          <h2 className="text-(--text-lg) font-semibold mb-(--space-3)">Shipping To</h2>
          <div className="text-(--text-sm) text-(--color-text-secondary) space-y-1">
            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
            <p>{order.shippingAddress.address1}</p>
            {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <Link href="/products"><Button variant="primary" size="lg">Keep Shopping</Button></Link>
      </div>
    </div>
  );
}
