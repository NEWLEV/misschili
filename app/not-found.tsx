import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="section-container section-padding text-center max-w-lg mx-auto">
      <h1 className="text-(--text-3xl) font-bold mb-(--space-4)" style={{ fontFamily: 'var(--font-display)' }}>
        Page Not Found
      </h1>
      <p className="text-(--color-text-secondary) mb-(--space-6)">
        We couldn&apos;t find what you&apos;re looking for. It may have moved, or the link
        might be out of date.
      </p>
      <div className="flex gap-(--space-3) justify-center">
        <Link href="/products"><Button variant="primary">Shop Products</Button></Link>
        <Link href="/"><Button variant="outline">Go Home</Button></Link>
      </div>
    </div>
  );
}
