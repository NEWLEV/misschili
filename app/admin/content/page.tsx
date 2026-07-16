import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateSiteSettings } from '../settings/actions';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const settings = await prisma.siteSetting.findMany();
  const get = (key: string, fallback = '') => settings.find((s) => s.key === key)?.value ?? fallback;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-6)]" style={{ fontFamily: 'var(--font-display)' }}>
        Content
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-[var(--space-6)]">
        Edit the copy shown on the homepage hero section and store contact info.
      </p>

      <form action={async (formData) => {
        'use server';
        await updateSiteSettings('/admin/content', formData);
      }} className="card p-[var(--space-6)] space-y-[var(--space-4)]">
        <Input label="Store Name" name="store_name" defaultValue={get('store_name', 'Miss Chili Hot Sauce')} />
        <Input label="Hero Headline" name="hero_headline" defaultValue={get('hero_headline', 'Ghost Pepper Heat. Miami Soul.')} />
        <div>
          <label className="block text-[var(--text-sm)] font-medium mb-1">Hero Subtext</label>
          <textarea name="hero_subtext" rows={3} defaultValue={get('hero_subtext', 'Born in a backyard garden. Popularized by the sailing club. Two small-batch sauces that bring bold flavor and real heat to everything they touch.')} className="w-full p-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]"></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Hero CTA Button Text" name="hero_cta_text" defaultValue={get('hero_cta_text', 'Shop Our Sauces')} />
          <Input label="Hero CTA Link" name="hero_cta_url" defaultValue={get('hero_cta_url', '/products')} />
        </div>
        <Input label="Contact Email" name="contact_email" type="email" defaultValue={get('contact_email', 'misschilihotsauce@gmail.com')} />
        <Input label="Instagram URL" name="instagram" type="url" defaultValue={get('instagram', 'https://www.instagram.com/misschilimiami')} />

        <Button type="submit" variant="primary" size="lg" className="w-full">Save Content</Button>
      </form>
    </div>
  );
}
