import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Account' };

export default function AccountPage() {
  return (
    <div className="section-container section-padding max-w-lg mx-auto text-center">
      <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-4)]" style={{ fontFamily: 'var(--font-display)' }}>My Account</h1>
      <p className="text-[var(--color-text-secondary)] mb-[var(--space-8)]">
        Sign in to view your orders, manage addresses, and track shipments.
      </p>
      <div className="card p-[var(--space-8)] space-y-[var(--space-4)]">
        <Link href="/api/auth/signin">
          <Button variant="primary" size="lg" className="w-full">Sign In</Button>
        </Link>
        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
          Don&apos;t have an account? One will be created after your first purchase.
        </p>
      </div>
    </div>
  );
}
