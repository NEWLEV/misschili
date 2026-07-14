import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Shipping Policy' };

export default function ShippingPolicyPage() {
  return (
    <div className="section-container section-padding max-w-3xl">
      <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-6)]" style={{ fontFamily: 'var(--font-display)' }}>Shipping Policy</h1>
      <div className="space-y-[var(--space-5)] text-[var(--color-text-secondary)]">
        <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text)]">Domestic Shipping</h2>
        <p>We ship to all 50 U.S. states. Orders are processed within 1-2 business days.</p>
        <ul className="list-disc pl-[var(--space-6)] space-y-[var(--space-2)]">
          <li><strong>Standard Shipping:</strong> 3-7 business days — $7.99</li>
          <li><strong>Free Shipping:</strong> On orders over $50</li>
        </ul>
        <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text)] mt-[var(--space-6)]">Order Tracking</h2>
        <p>Once your order ships, you will receive an email with tracking information. You can also check your order status in your account dashboard.</p>
        <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text)] mt-[var(--space-6)]">Damaged Shipments</h2>
        <p>If your order arrives damaged, please contact us within 48 hours at <a href="mailto:misschilihotsauce@gmail.com" className="text-[var(--color-primary)]">misschilihotsauce@gmail.com</a> with photos for a replacement.</p>
      </div>
    </div>
  );
}
