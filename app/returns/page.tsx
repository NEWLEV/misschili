import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Returns & Refunds' };

export default function ReturnsPage() {
  return (
    <div className="section-container section-padding max-w-3xl">
      <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-6)]" style={{ fontFamily: 'var(--font-display)' }}>Returns & Refunds</h1>
      <div className="space-y-[var(--space-5)] text-[var(--color-text-secondary)]">
        <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text)]">Return Policy</h2>
        <p>We accept returns within 30 days of delivery for <strong>unopened products</strong> in their original packaging.</p>
        <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text)] mt-[var(--space-6)]">How to Return</h2>
        <ol className="list-decimal pl-[var(--space-6)] space-y-[var(--space-2)]">
          <li>Email us at <a href="mailto:misschilihotsauce@gmail.com" className="text-[var(--color-primary)]">misschilihotsauce@gmail.com</a> with your order number</li>
          <li>We will provide a return shipping address</li>
          <li>Ship the product back in its original packaging</li>
          <li>Refund will be processed within 5-7 business days after we receive the return</li>
        </ol>
        <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text)] mt-[var(--space-6)]">Damaged Products</h2>
        <p>If your product arrives damaged or broken, contact us within 48 hours with photos. We will send a replacement at no charge.</p>
      </div>
    </div>
  );
}
