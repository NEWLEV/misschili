import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Miss Chili Hot Sauce collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="section-container section-padding max-w-3xl">
      <h1 className="text-(--text-4xl) font-bold mb-(--space-6)" style={{ fontFamily: 'var(--font-display)' }}>Privacy Policy</h1>
      <div className="prose prose-invert space-y-(--space-5) text-(--color-text-secondary)">
        <p><strong>Last updated:</strong> May 2026</p>
        <p>Miss Chili Hot Sauce, LLC (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates www.misschilipeppers.com. This page informs you of our policies regarding the collection, use, and disclosure of personal information.</p>
        <h2 className="text-(--text-xl) font-semibold text-(--color-text) mt-(--space-6)">Information We Collect</h2>
        <p>We collect information you provide when placing an order: name, email, shipping address, and payment details. Payment processing is handled securely by Stripe — we never store full card numbers.</p>
        <h2 className="text-(--text-xl) font-semibold text-(--color-text) mt-(--space-6)">How We Use Your Information</h2>
        <ul className="list-disc pl-(--space-6) space-y-(--space-2)">
          <li>To process and fulfill your orders</li>
          <li>To send order confirmations and shipping updates</li>
          <li>To send marketing emails (only if you opted in)</li>
          <li>To improve our website and products</li>
        </ul>
        <h2 className="text-(--text-xl) font-semibold text-(--color-text) mt-(--space-6)">Contact</h2>
        <p>Questions? Email us at <a href="mailto:misschilihotsauce@gmail.com" className="text-(--color-primary)">misschilihotsauce@gmail.com</a></p>
      </div>
    </div>
  );
}
