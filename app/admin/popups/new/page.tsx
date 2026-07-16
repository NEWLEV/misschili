import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createPopup } from '../actions';

export const dynamic = 'force-dynamic';

export default function NewPopupPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-6)]">
        <Link href="/admin/popups" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          ← Back to Popups
        </Link>
      </div>

      <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-6)]" style={{ fontFamily: 'var(--font-display)' }}>
        Add Popup
      </h1>

      <form action={createPopup} className="card p-[var(--space-6)] space-y-[var(--space-4)]">
        <div>
          <label className="block text-[var(--text-sm)] font-medium mb-1">Type</label>
          <select name="type" defaultValue="PROMOTION" className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]">
            <option value="NEWSLETTER">Newsletter</option>
            <option value="EXIT_INTENT">Exit Intent</option>
            <option value="PROMOTION">Promotion</option>
            <option value="COOKIE_CONSENT">Cookie Consent</option>
            <option value="CART_ABANDONMENT">Cart Abandonment</option>
          </select>
        </div>

        <Input label="Title" name="title" required />

        <div>
          <label className="block text-[var(--text-sm)] font-medium mb-1">Message</label>
          <textarea name="message" required rows={3} className="w-full p-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]"></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="CTA Button Text (optional)" name="ctaText" />
          <Input label="CTA URL (optional)" name="ctaUrl" type="url" />
        </div>

        <Input label="Discount Code (optional)" name="discountCode" className="uppercase" />

        <div>
          <label className="block text-[var(--text-sm)] font-medium mb-1">Frequency</label>
          <select name="frequency" defaultValue="ONCE" className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]">
            <option value="ONCE">Once</option>
            <option value="SESSION">Once per session</option>
            <option value="DAILY">Once per day</option>
            <option value="EVERY_VISIT">Every visit</option>
          </select>
        </div>

        <Input label="Target Page" name="targetPage" defaultValue="all" helperText="'all', 'home', 'product', or 'cart'" />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date (optional)" name="startDate" type="date" />
          <Input label="End Date (optional)" name="endDate" type="date" />
        </div>

        <div>
          <label className="flex items-center gap-2 text-[var(--text-sm)]">
            <input type="checkbox" name="isActive" />
            Active
          </label>
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-1">
            Only one popup can be active at a time. Activating this one will deactivate any other active popup.
          </p>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">Create Popup</Button>
      </form>
    </div>
  );
}
