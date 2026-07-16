import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Orders' };
export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/account/login?callbackUrl=/account/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="section-container section-padding max-w-3xl mx-auto">
      <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-8)]" style={{ fontFamily: 'var(--font-display)' }}>
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="card p-[var(--space-8)] text-center">
          <p className="text-[var(--color-text-secondary)]">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-[var(--space-4)]">
          {orders.map((order) => (
            <div key={order.id} className="card p-[var(--space-6)]">
              <div className="flex justify-between items-start mb-[var(--space-4)]">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                  {order.status}
                </span>
              </div>
              <div className="divide-y divide-[var(--color-border)] mb-[var(--space-4)]">
                {order.items.map((item) => (
                  <div key={item.id} className="py-[var(--space-2)] flex justify-between text-[var(--text-sm)]">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="tabular-nums">{formatPrice(Number(item.totalPrice))}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-[var(--space-3)] border-t border-[var(--color-border)] font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
