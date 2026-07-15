'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema } from '@/lib/validations';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    const res = await fetch('/api/account/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.');
      setIsLoading(false);
      return;
    }

    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      router.push('/account/login');
      return;
    }
    router.push('/account');
    router.refresh();
  };

  return (
    <div className="section-container section-padding flex justify-center items-center min-h-[60vh]">
      <div className="card p-[var(--space-8)] w-full max-w-md">
        <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-6)] text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Create Account
        </h1>

        {error && (
          <div className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] p-3 rounded-[var(--radius-md)] mb-[var(--space-4)] text-[var(--text-sm)] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[var(--space-4)]">
          <Input label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          <Button variant="primary" type="submit" size="lg" className="w-full" isLoading={isLoading}>Create Account</Button>
        </form>

        <div className="mt-[var(--space-6)] text-center text-[var(--text-sm)] text-[var(--color-text-muted)]">
          <p>Already have an account? <Link href="/account/login" className="text-[var(--color-primary)]">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
