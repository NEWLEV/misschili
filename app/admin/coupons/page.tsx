import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div className="flex justify-between items-center mb-(--space-6)">
        <h1 className="text-(--text-3xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>Coupons</h1>
        <Link href="/admin/coupons/new">
          <Button variant="primary">Add Coupon</Button>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--color-surface-hover) border-b border-(--color-border)">
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Code</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Discount</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Status</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Uses</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Expires</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary) text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-(--color-surface-hover) transition-colors">
                  <td className="p-(--space-4) font-mono font-semibold text-(--text-sm)">{coupon.code}</td>
                  <td className="p-(--space-4) text-(--text-sm)">
                    {coupon.type === 'PERCENTAGE' ? `${Number(coupon.value)}%` : `$${Number(coupon.value).toFixed(2)}`}
                  </td>
                  <td className="p-(--space-4)">
                    <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-(--space-4) text-(--text-sm)">
                    {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                  </td>
                  <td className="p-(--space-4) text-(--text-sm) text-(--color-text-muted)">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-(--space-4) text-right">
                    <Link href={`/admin/coupons/${coupon.id}`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-(--space-8) text-center text-(--color-text-muted)">
                    No coupons found.
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
