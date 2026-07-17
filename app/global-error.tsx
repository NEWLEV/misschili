'use client';

import { useEffect } from 'react';

// global-error replaces the root layout when active, so it must define its
// own <html>/<body> and can't rely on styles/providers from layout.tsx —
// this only fires when the root layout itself throws.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[Root Layout Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#1a1210', color: '#ede8e3' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Something Went Wrong</h1>
          <p style={{ color: '#b8a080', marginBottom: '1.5rem', maxWidth: '32rem' }}>
            The page failed to load. Nothing was charged and no changes were lost.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{ padding: '0.75rem 1.75rem', background: '#e84c3d', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
