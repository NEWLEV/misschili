'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// unstable_retry (not `reset`) is this Next.js version's error-boundary
// recovery callback — see node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md.
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[App Error Boundary]', error);
  }, [error]);

  return (
    <div className="section-container section-padding text-center max-w-lg mx-auto">
      <h1 className="text-(--text-3xl) font-bold mb-(--space-4)" style={{ fontFamily: 'var(--font-display)' }}>
        Something Went Wrong
      </h1>
      <p className="text-(--color-text-secondary) mb-(--space-6)">
        Sorry about that — something broke on our end. Nothing was charged and no changes
        were lost. Try again, or head back home.
      </p>
      <div className="flex gap-(--space-3) justify-center">
        <Button variant="primary" onClick={() => unstable_retry()}>Try Again</Button>
        <Link href="/"><Button variant="outline">Go Home</Button></Link>
      </div>
    </div>
  );
}
