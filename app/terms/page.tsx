import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="section-container section-padding max-w-3xl">
      <h1 className="text-(--text-4xl) font-bold mb-(--space-6)" style={{ fontFamily: 'var(--font-display)' }}>Terms of Service</h1>
      <div className="space-y-(--space-5) text-(--color-text-secondary)">
        <p><strong>Last updated:</strong> May 2026</p>
        <p>By using www.misschilipeppers.com, you agree to these terms. Please read them carefully.</p>
        <h2 className="text-(--text-xl) font-semibold text-(--color-text) mt-(--space-6)">Products & Pricing</h2>
        <p>All prices are listed in USD. We reserve the right to modify prices at any time. Products are subject to availability.</p>
        <h2 className="text-(--text-xl) font-semibold text-(--color-text) mt-(--space-6)">Orders</h2>
        <p>By placing an order, you confirm that all information provided is accurate. We reserve the right to cancel orders in case of pricing errors or suspected fraud.</p>
        <h2 className="text-(--text-xl) font-semibold text-(--color-text) mt-(--space-6)">Limitation of Liability</h2>
        <p>Miss Chili Hot Sauce, LLC is not liable for any allergic reactions. Please read ingredient labels carefully. Our products contain peppers, garlic, and other spices.</p>
        <p>Contact: <a href="mailto:misschilihotsauce@gmail.com" className="text-(--color-primary)">misschilihotsauce@gmail.com</a></p>
      </div>
    </div>
  );
}
