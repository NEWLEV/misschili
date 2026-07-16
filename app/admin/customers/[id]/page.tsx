import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: 'desc' } },
      reviews: true,
    },
  });

  if (!customer) return notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-6)]">
        <Link href="/admin/customers" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          ← Back to Customers
        </Link>
      </div>

      <div className="mb-[var(--space-8)]">
        <h1 className="text-[var(--text-3xl)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {customer.name || 'Unnamed Customer'}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">{customer.email}</p>
        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-1">
          Joined {new Date(customer.createdAt).toLocaleDateString()} · {customer.reviews.length} review{customer.reviews.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-6)]">
        <div className="lg:col-span-2 space-y-[var(--space-6)]">
          <div className="card p-[var(--space-6)]">
            <h2 className="text-[var(--text-lg)] font-semibold mb-[var(--space-4)]">Orders</h2>
            <div className="divide-y divide-[var(--color-border)]">
              {customer.orders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="py-[var(--space-3)] flex justify-between hover:text-[var(--color-primary)] transition-colors">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                      {order.status}
                    </span>
                    <p className="font-semibold mt-1">{formatPrice(Number(order.total))}</p>
                  </div>
                </Link>
              ))}
              {customer.orders.length === 0 && (
                <p className="py-[var(--space-4)] text-[var(--color-text-muted)] text-[var(--text-sm)]">No orders yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-[var(--space-6)]">
          <div className="card p-[var(--space-5)]">
            <h2 className="text-[var(--text-base)] font-semibold mb-[var(--space-3)]">Addresses</h2>
            {customer.addresses.length > 0 ? (
              <div className="space-y-[var(--space-4)]">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="text-[var(--text-sm)] text-[var(--color-text-secondary)] space-y-1">
                    <p className="font-medium text-[var(--color-text)]">{address.firstName} {address.lastName}</p>
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">No addresses on file.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
