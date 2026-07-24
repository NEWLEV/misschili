import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateSiteSettings } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  const get = (key: string, fallback = '') => settings.find((s) => s.key === key)?.value ?? fallback;
  const updateSettings = updateSiteSettings.bind(null, '/admin/settings');

  return (
    <div className="max-w-2xl mx-auto space-y-(--space-6)">
      <h1 className="text-(--text-3xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>
        Settings
      </h1>

      <form action={updateSettings} className="space-y-(--space-6)">
        <div className="card p-(--space-6) space-y-(--space-4)">
          <h2 className="text-(--text-lg) font-semibold">Store Info</h2>
          <Input label="Store Name" name="store_name" required defaultValue={get('store_name', 'Miss Chili Hot Sauce')} />
          <Input label="Contact Email" name="contact_email" type="email" required defaultValue={get('contact_email')} />
          <Input label="Instagram URL" name="instagram" type="url" placeholder="https://www.instagram.com/yourhandle" defaultValue={get('instagram')} />
        </div>

        <div className="card p-(--space-6) space-y-(--space-4)">
          <h2 className="text-(--text-lg) font-semibold">Homepage Hero</h2>
          <Input label="Headline" name="hero_headline" required defaultValue={get('hero_headline')} />
          <div>
            <label className="block text-(--text-sm) font-medium mb-1">Subtext</label>
            <textarea
              name="hero_subtext"
              rows={2}
              defaultValue={get('hero_subtext')}
              className="w-full p-3 rounded-md bg-(--color-bg) border border-(--color-border)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Button Text" name="hero_cta_text" defaultValue={get('hero_cta_text', 'Shop Our Sauces')} />
            <Input label="Button Link" name="hero_cta_url" required placeholder="/products" defaultValue={get('hero_cta_url', '/products')} />
          </div>
        </div>

        <div className="card p-(--space-6) space-y-(--space-4)">
          <h2 className="text-(--text-lg) font-semibold">Shipping &amp; Tax</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Free Shipping Threshold ($)" name="free_shipping_threshold" type="number" min="0" step="0.01" required defaultValue={get('free_shipping_threshold', '50')} />
            <Input label="Flat Shipping Rate ($)" name="flat_shipping_rate" type="number" min="0" step="0.01" required defaultValue={get('flat_shipping_rate', '7.99')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tax Rate" name="tax_rate" type="number" min="0" max="1" step="0.001" required helperText="Decimal, e.g. 0.07 for 7%" defaultValue={get('tax_rate', '0.07')} />
            <Input label="Currency" name="currency" required maxLength={3} helperText="3-letter code, e.g. USD" defaultValue={get('currency', 'USD')} />
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">Save Settings</Button>
      </form>
    </div>
  );
}
