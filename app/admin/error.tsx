'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function AdminError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto text-center py-(--space-12)">
      <h1 className="text-(--text-2xl) font-bold mb-(--space-3)" style={{ fontFamily: 'var(--font-display)' }}>
        Something went wrong
      </h1>
      <p className="text-(--color-text-secondary) mb-(--space-6)">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button variant="primary" onClick={() => unstable_retry()}>Try Again</Button>
    </div>
  );
}
