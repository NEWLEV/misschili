'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function NewsletterSignup() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, source: 'footer' }),
      });
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterStatus('error');
    }
  };

  if (newsletterStatus === 'success') {
    return (
      <div className="p-(--space-4) rounded-(--radius-lg) bg-[oklch(from_var(--color-success)_l_c_h_/_0.1)] border border-[oklch(from_var(--color-success)_l_c_h_/_0.2)]">
        <p className="text-(--color-success) font-medium">🌶️ You&apos;re in! Watch your inbox for some heat.</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleNewsletterSubmit} className="flex gap-(--space-3) max-w-md mx-auto">
        <input
          type="email"
          value={newsletterEmail}
          onChange={(e) => setNewsletterEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 h-12 px-(--space-4) rounded-(--radius-md) bg-(--color-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-primary) transition-colors"
        />
        <Button
          variant="primary"
          type="submit"
          isLoading={newsletterStatus === 'loading'}
        >
          Subscribe
        </Button>
      </form>
      {newsletterStatus === 'error' && (
        <p className="text-(--text-sm) text-(--color-danger) mt-(--space-3)">
          Something went wrong. Please try again.
        </p>
      )}
    </>
  );
}
