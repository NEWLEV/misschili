'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', { email, password, redirect: false });

    if (result?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-[var(--space-4)]" style={{ background: 'var(--color-bg-alt)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-[var(--space-8)]">
          <Image src="/images/logos/MissChili_Logos_MissChili.png" alt="Miss Chili" width={60} height={82} className="mx-auto mb-[var(--space-4)] h-[72px] w-auto" />
          <h1 className="text-[var(--text-2xl)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>Admin Login</h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-1">Miss Chili Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-[var(--space-6)] space-y-[var(--space-4)]">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="text-[var(--text-sm)] text-[var(--color-danger)]">{error}</p>}
          <Button variant="primary" type="submit" size="lg" className="w-full" isLoading={isLoading}>Sign In</Button>
        </form>
      </div>
    </div>
  );
}
