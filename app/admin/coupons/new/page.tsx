import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createCoupon } from '../actions';

export const dynamic = 'force-dynamic';

export default function NewCouponPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-6)]">
        <Link href="/admin/coupons" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          ← Back to Coupons
        </Link>
      </div>

      <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-6)]" style={{ fontFamily: 'var(--font-display)' }}>
        Add Coupon
      </h1>

      <form action={createCoupon} className="card p-[var(--space-6)] space-y-[var(--space-4)]">
        <Input label="Code" name="code" required placeholder="HOTSAUCE10" className="uppercase" />

        <div>
          <label className="block text-[var(--text-sm)] font-medium mb-1">Discount Type</label>
          <select name="type" defaultValue="PERCENTAGE" className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </div>

        <Input label="Value (% or $)" name="value" type="number" min="0" step="0.01" required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Min Order Amount ($, optional)" name="minOrderAmount" type="number" min="0" step="0.01" />
          <Input label="Max Total Uses (optional)" name="maxUses" type="number" min="1" />
        </div>

        <Input label="Max Uses Per Customer" name="maxUsesPerUser" type="number" min="1" defaultValue={1} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Starts At (optional)" name="startsAt" type="date" />
          <Input label="Expires At (optional)" name="expiresAt" type="date" />
        </div>

        <label className="flex items-center gap-2 text-[var(--text-sm)]">
          <input type="checkbox" name="isActive" defaultChecked />
          Active
        </label>

        <Button type="submit" variant="primary" size="lg" className="w-full">Create Coupon</Button>
      </form>
    </div>
  );
}
