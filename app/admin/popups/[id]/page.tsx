import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updatePopup } from '../actions';

export const dynamic = 'force-dynamic';

function toDateInputValue(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export default async function EditPopupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const popup = await prisma.popup.findUnique({ where: { id } });

  if (!popup) return notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-(--space-4) mb-(--space-6)">
        <Link href="/admin/popups" className="text-(--color-text-muted) hover:text-(--color-text)">
          ← Back to Popups
        </Link>
      </div>

      <h1 className="text-(--text-3xl) font-bold mb-(--space-6)" style={{ fontFamily: 'var(--font-display)' }}>
        Edit Popup
      </h1>

      <form action={updatePopup.bind(null, popup.id)} className="card p-(--space-6) space-y-(--space-4)">
        <div>
          <label className="block text-(--text-sm) font-medium mb-1">Type</label>
          <select name="type" defaultValue={popup.type} className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)">
            <option value="NEWSLETTER">Newsletter</option>
            <option value="EXIT_INTENT">Exit Intent</option>
            <option value="PROMOTION">Promotion</option>
            <option value="COOKIE_CONSENT">Cookie Consent</option>
            <option value="CART_ABANDONMENT">Cart Abandonment</option>
          </select>
        </div>

        <Input label="Title" name="title" required defaultValue={popup.title} />

        <div>
          <label className="block text-(--text-sm) font-medium mb-1">Message</label>
          <textarea name="message" required rows={3} defaultValue={popup.message} className="w-full p-3 rounded-md bg-(--color-bg) border border-(--color-border)"></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="CTA Button Text (optional)" name="ctaText" defaultValue={popup.ctaText || ''} />
          <Input label="CTA URL (optional)" name="ctaUrl" type="url" defaultValue={popup.ctaUrl || ''} />
        </div>

        <Input label="Discount Code (optional)" name="discountCode" className="uppercase" defaultValue={popup.discountCode || ''} />

        <div>
          <label className="block text-(--text-sm) font-medium mb-1">Frequency</label>
          <select name="frequency" defaultValue={popup.frequency} className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)">
            <option value="ONCE">Once</option>
            <option value="SESSION">Once per session</option>
            <option value="DAILY">Once per day</option>
            <option value="EVERY_VISIT">Every visit</option>
          </select>
        </div>

        <Input label="Target Page" name="targetPage" defaultValue={popup.targetPage || 'all'} helperText="'all', 'home', 'product', or 'cart'" />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date (optional)" name="startDate" type="date" defaultValue={toDateInputValue(popup.startDate)} />
          <Input label="End Date (optional)" name="endDate" type="date" defaultValue={toDateInputValue(popup.endDate)} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-(--text-sm)">
            <input type="checkbox" name="isActive" defaultChecked={popup.isActive} />
            Active
          </label>
          <p className="text-(--text-xs) text-(--color-text-muted) mt-1">
            Only one popup can be active at a time. Activating this one will deactivate any other active popup.
          </p>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">Save Changes</Button>
      </form>
    </div>
  );
}
