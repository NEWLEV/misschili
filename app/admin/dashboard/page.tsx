import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch KPI data
  const [ordersMtd, customersMtd, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  const revenue = Number(ordersMtd._sum.total || 0);
  const orderCount = ordersMtd._count;
  const aov = orderCount > 0 ? revenue / orderCount : 0;

  return (
    <div>
      <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-6)]" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-4)] mb-[var(--space-8)]">
        <div className="card p-[var(--space-5)]">
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-wider)] mb-[var(--space-2)]">Revenue (MTD)</p>
          <p className="text-[var(--text-2xl)] font-bold tabular-nums" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatPrice(revenue)}</p>
        </div>
        <div className="card p-[var(--space-5)]">
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-wider)] mb-[var(--space-2)]">Orders (MTD)</p>
          <p className="text-[var(--text-2xl)] font-bold tabular-nums" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{orderCount}</p>
        </div>
        <div className="card p-[var(--space-5)]">
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-wider)] mb-[var(--space-2)]">Avg Order Value</p>
          <p className="text-[var(--text-2xl)] font-bold tabular-nums" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{formatPrice(aov)}</p>
        </div>
        <div className="card p-[var(--space-5)]">
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-wider)] mb-[var(--space-2)]">New Customers (MTD)</p>
          <p className="text-[var(--text-2xl)] font-bold tabular-nums" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{customersMtd}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-[var(--space-5)] border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-[var(--text-lg)] font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-[var(--text-sm)] text-[var(--color-primary)] hover:underline">View All</Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-[var(--space-8)] text-center text-[var(--color-text-muted)]">
            <p className="text-4xl mb-[var(--space-3)]">📦</p>
            <p>No orders yet. They will appear here once customers start ordering.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[var(--text-sm)]">
              <thead className="bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-[var(--space-4)] py-[var(--space-3)] font-medium">Order Number</th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)] font-medium">Customer</th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)] font-medium">Date</th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)] font-medium">Status</th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)] font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-[var(--color-primary)] hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">{order.user?.name || order.guestEmail || 'Guest'}</td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-muted)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <span className={`badge ${order.status === 'PENDING' ? 'badge-outline' : order.status === 'DELIVERED' ? 'badge-success' : 'badge-primary'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-right font-medium tabular-nums">{formatPrice(Number(order.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
