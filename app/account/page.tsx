import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { auth } from '@/lib/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Account' };

export default async function AccountPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/account/orders');
  }

  return (
    <div className="section-container section-padding max-w-lg mx-auto text-center">
      <h1 className="text-(--text-4xl) font-bold mb-(--space-4)" style={{ fontFamily: 'var(--font-display)' }}>My Account</h1>
      <p className="text-(--color-text-secondary) mb-(--space-8)">
        Sign in to view your orders, manage addresses, and track shipments.
      </p>
      <div className="card p-(--space-8) space-y-(--space-4)">
        <Link href="/account/login">
          <Button variant="primary" size="lg" className="w-full">Sign In</Button>
        </Link>
        <p className="text-(--text-sm) text-(--color-text-muted)">
          Don&apos;t have an account? <Link href="/account/signup" className="text-(--color-primary)">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
