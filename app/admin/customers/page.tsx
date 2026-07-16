import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-[var(--space-6)]">
        <h1 className="text-[var(--text-3xl)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>Customers</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Name</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Email</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Orders</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Joined</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="p-[var(--space-4)] font-semibold text-[var(--text-sm)]">{customer.name || '—'}</td>
                  <td className="p-[var(--space-4)] text-[var(--text-sm)]">{customer.email}</td>
                  <td className="p-[var(--space-4)] text-[var(--text-sm)]">{customer._count.orders}</td>
                  <td className="p-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-[var(--space-4)] text-right">
                    <Link href={`/admin/customers/${customer.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-[var(--space-8)] text-center text-[var(--color-text-muted)]">
                    No customers found.
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
