import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateCoupon } from '../actions';

export const dynamic = 'force-dynamic';

function toDateInputValue(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });

  if (!coupon) return notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-(--space-4) mb-(--space-6)">
        <Link href="/admin/coupons" className="text-(--color-text-muted) hover:text-(--color-text)">
          ← Back to Coupons
        </Link>
      </div>

      <h1 className="text-(--text-3xl) font-bold mb-(--space-6)" style={{ fontFamily: 'var(--font-display)' }}>
        Edit Coupon
      </h1>

      <form action={updateCoupon.bind(null, coupon.id)} className="card p-(--space-6) space-y-(--space-4)">
        <Input label="Code" name="code" required defaultValue={coupon.code} className="uppercase" />

        <div>
          <label className="block text-(--text-sm) font-medium mb-1">Discount Type</label>
          <select name="type" defaultValue={coupon.type} className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </div>

        <Input label="Value (% or $)" name="value" type="number" min="0" step="0.01" required defaultValue={Number(coupon.value)} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Min Order Amount ($, optional)" name="minOrderAmount" type="number" min="0" step="0.01" defaultValue={coupon.minOrderAmount ? Number(coupon.minOrderAmount) : undefined} />
          <Input label="Max Total Uses (optional)" name="maxUses" type="number" min="1" defaultValue={coupon.maxUses ?? undefined} />
        </div>

        <Input label="Max Uses Per Customer" name="maxUsesPerUser" type="number" min="1" defaultValue={coupon.maxUsesPerUser} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Starts At (optional)" name="startsAt" type="date" defaultValue={toDateInputValue(coupon.startsAt)} />
          <Input label="Expires At (optional)" name="expiresAt" type="date" defaultValue={toDateInputValue(coupon.expiresAt)} />
        </div>

        <label className="flex items-center gap-2 text-(--text-sm)">
          <input type="checkbox" name="isActive" defaultChecked={coupon.isActive} />
          Active
        </label>

        <p className="text-(--text-sm) text-(--color-text-muted)">
          Used {coupon.usedCount} time{coupon.usedCount !== 1 ? 's' : ''} so far.
        </p>

        <Button type="submit" variant="primary" size="lg" className="w-full">Save Changes</Button>
      </form>
    </div>
  );
}
