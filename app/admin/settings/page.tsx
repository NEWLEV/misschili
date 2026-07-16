import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateSiteSettings } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  const get = (key: string, fallback = '') => settings.find((s) => s.key === key)?.value ?? fallback;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-6)]" style={{ fontFamily: 'var(--font-display)' }}>
        Settings
      </h1>

      <form action={async (formData) => {
        'use server';
        await updateSiteSettings('/admin/settings', formData);
      }} className="card p-[var(--space-6)] space-y-[var(--space-4)]">
        <Input label="Free Shipping Threshold ($)" name="free_shipping_threshold" type="number" min="0" step="0.01" defaultValue={get('free_shipping_threshold', '50')} />
        <Input label="Tax Rate (e.g. 0.07 for 7%)" name="tax_rate" type="number" min="0" step="0.001" defaultValue={get('tax_rate', '0.07')} />
        <Input label="Currency" name="currency" defaultValue={get('currency', 'USD')} />

        <Button type="submit" variant="primary" size="lg" className="w-full">Save Settings</Button>
      </form>
    </div>
  );
}
