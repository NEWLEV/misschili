'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPasswordSchema } from '@/lib/validations';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    const res = await fetch('/api/account/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, ...parsed.data }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'This reset link is invalid or has expired.');
      setIsLoading(false);
      return;
    }

    setSuccess(true);
  };

  if (!token || !email) {
    return <p className="text-(--text-sm) text-center">This reset link is invalid or has expired.</p>;
  }

  if (success) {
    return (
      <div className="text-center space-y-(--space-4)">
        <p className="text-(--text-sm)">Your password has been reset.</p>
        <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/account/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-(--color-danger)/10 text-(--color-danger) p-3 rounded-(--radius-md) mb-(--space-4) text-(--text-sm) text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-(--space-4)">
        <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
        <Button variant="primary" type="submit" size="lg" className="w-full" isLoading={isLoading}>Reset Password</Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="section-container section-padding flex justify-center items-center min-h-[60vh]">
      <div className="card p-(--space-8) w-full max-w-md">
        <h1 className="text-(--text-3xl) font-bold mb-(--space-6) text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Reset Password
        </h1>
        <Suspense fallback={<div className="text-(--text-sm) text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
        <div className="mt-(--space-6) text-center text-(--text-sm) text-(--color-text-muted)">
          <p><Link href="/account/login" className="text-(--color-primary)">Back to sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
