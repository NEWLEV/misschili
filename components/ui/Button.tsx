import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-semibold whitespace-nowrap',
      'rounded-[var(--radius-md)]',
      'transition-all duration-[var(--duration-normal)]',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.97]',
    ].join(' ');

    const variants: Record<string, string> = {
      primary: [
        'bg-[var(--color-primary)] text-white font-bold',
        'hover:bg-[var(--color-primary-hover)]',
        'shadow-[var(--shadow-sm)]',
        'hover:shadow-[var(--shadow-glow-primary)]',
        'tracking-wide',
      ].join(' '),
      secondary: [
        'bg-[var(--color-secondary)] text-[var(--color-secondary-text)]',
        'hover:bg-[var(--color-secondary-hover)]',
      ].join(' '),
      outline: [
        'border border-[var(--color-border-strong)] bg-transparent',
        'text-[var(--color-text)]',
        'hover:bg-[var(--color-surface-hover)]',
      ].join(' '),
      ghost: [
        'bg-transparent text-[var(--color-text-secondary)]',
        'hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]',
      ].join(' '),
      danger: [
        'bg-[var(--color-danger)] text-white',
        'hover:opacity-90',
      ].join(' '),
    };

    const sizes: Record<string, string> = {
      sm: 'h-9 px-3 text-[var(--text-sm)]',
      md: 'h-11 px-5 text-[var(--text-base)]',
      lg: 'h-13 px-7 text-[var(--text-lg)]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
