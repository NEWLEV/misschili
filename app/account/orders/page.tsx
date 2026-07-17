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
      <h1 className="text-(--text-4xl) font-bold mb-(--space-8)" style={{ fontFamily: 'var(--font-display)' }}>
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="card p-(--space-8) text-center">
          <p className="text-(--color-text-secondary)">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-(--space-4)">
          {orders.map((order) => (
            <div key={order.id} className="card p-(--space-6)">
              <div className="flex justify-between items-start mb-(--space-4)">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-(--text-sm) text-(--color-text-muted)">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                  {order.status}
                </span>
              </div>
              <div className="divide-y divide-(--color-border) mb-(--space-4)">
                {order.items.map((item) => (
                  <div key={item.id} className="py-(--space-2) flex justify-between text-(--text-sm)">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="tabular-nums">{formatPrice(Number(item.totalPrice))}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-(--space-3) border-t border-(--color-border) font-semibold">
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
