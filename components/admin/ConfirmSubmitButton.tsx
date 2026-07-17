'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';

interface ConfirmSubmitButtonProps {
  action: () => Promise<{ success: boolean; error?: string } | void>;
  confirmMessage: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  className?: string;
  onDone?: (result: { success: boolean; error?: string } | void) => void;
}

// Wraps a Server Action with a confirmation prompt and a disabled/pending
// state, so destructive or financial admin actions (refund, cancel, delete)
// can't be double-submitted and always ask before running.
export function ConfirmSubmitButton({
  action,
  confirmMessage,
  children,
  variant = 'outline',
  className,
  onDone,
}: ConfirmSubmitButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (isPending) return;
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result && 'success' in result && !result.success) {
        setError(result.error || 'Action failed');
      }
      onDone?.(result);
    });
  };

  return (
    <div>
      <Button type="button" variant={variant} isLoading={isPending} disabled={isPending} onClick={handleClick} className={className}>
        {children}
      </Button>
      {error && <p className="text-(--text-xs) text-(--color-danger) mt-(--space-2)">{error}</p>}
    </div>
  );
}
