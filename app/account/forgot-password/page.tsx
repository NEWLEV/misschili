'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPasswordSchema } from '@/lib/validations';
import Link from 'next/link';

const GENERIC_MESSAGE = "If an account exists for that email, we've sent instructions to reset your password.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    await fetch('/api/account/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    // Always show the same result regardless of the response — the
    // API itself never reveals whether the email is registered either.
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="section-container section-padding flex justify-center items-center min-h-[60vh]">
      <div className="card p-[var(--space-8)] w-full max-w-md">
        <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-6)] text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Forgot Password
        </h1>

        {submitted ? (
          <p className="text-[var(--text-sm)] text-center">{GENERIC_MESSAGE}</p>
        ) : (
          <>
            {error && (
              <div className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] p-3 rounded-[var(--radius-md)] mb-[var(--space-4)] text-[var(--text-sm)] text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-[var(--space-4)]">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              <Button variant="primary" type="submit" size="lg" className="w-full" isLoading={isLoading}>Send Reset Link</Button>
            </form>
          </>
        )}

        <div className="mt-[var(--space-6)] text-center text-[var(--text-sm)] text-[var(--color-text-muted)]">
          <p><Link href="/account/login" className="text-[var(--color-primary)]">Back to sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
