import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-[var(--space-6)]">
        <h1 className="text-[var(--text-3xl)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>Orders</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Order #</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Date</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Customer</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Status</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Total</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="p-[var(--space-4)] text-[var(--text-sm)] font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="p-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                    {order.createdAt.toLocaleDateString()}
                  </td>
                  <td className="p-[var(--space-4)] text-[var(--text-sm)]">
                    {order.guestEmail || order.user?.email || 'Unknown'}
                  </td>
                  <td className="p-[var(--space-4)]">
                    <span className={`badge ${
                      order.status === 'DELIVERED' ? 'badge-success' :
                      order.status === 'CANCELLED' ? 'badge-danger' :
                      'badge-warning'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-[var(--space-4)] text-[var(--text-sm)] tabular-nums">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="p-[var(--space-4)] text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-[var(--space-8)] text-center text-[var(--color-text-muted)]">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
