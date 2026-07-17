'use client';

import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Only ever navigate to a same-origin, relative path after login — an
// unvalidated callbackUrl query param would otherwise let an attacker craft
// a login link that redirects a signed-in victim to an external site.
function safeCallbackUrl(raw: string | null): string {
  if (!raw) return '/account';
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')) return raw;
  return '/account';
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));

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
      <div className="card p-(--space-8) w-full max-w-md">
        <h1 className="text-(--text-3xl) font-bold mb-(--space-6) text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome Back
        </h1>

        {error && (
          <div role="alert" className="bg-(--color-danger)/10 text-(--color-danger) p-3 rounded-md mb-(--space-4) text-(--text-sm) text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-(--space-4)">
          <Input
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
          <Button type="submit" variant="primary" className="w-full h-12 text-(--text-base)">
            Sign In
          </Button>
        </form>

        <div className="mt-(--space-6) text-center text-(--text-sm) text-(--color-text-muted)">
          <p>Don&apos;t have an account?</p>
          <p className="mt-1">Accounts are created automatically upon your first purchase.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="section-container section-padding flex justify-center items-center min-h-[60vh]">
        <div className="text-(--text-lg)">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
