'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="section-container section-padding flex justify-center items-center min-h-[60vh]">
      <div className="card p-[var(--space-8)] w-full max-w-md">
        <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-6)] text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome Back
        </h1>
        
        {error && (
          <div className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] p-3 rounded-[var(--radius-md)] mb-[var(--space-4)] text-[var(--text-sm)] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[var(--space-4)]">
          <div>
            <label className="block text-[var(--text-sm)] font-medium mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none transition-colors" 
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[var(--text-sm)] font-medium mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none transition-colors" 
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full h-12 text-[var(--text-base)]">
            Sign In
          </Button>
        </form>

        <div className="mt-[var(--space-6)] text-center text-[var(--text-sm)] text-[var(--color-text-muted)]">
          <p>Don&apos;t have an account?</p>
          <p className="mt-1">Accounts are created automatically upon your first purchase.</p>
        </div>
      </div>
    </div>
  );
}
