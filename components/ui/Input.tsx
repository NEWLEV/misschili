import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-(--space-1)">
        {label && (
          <label
            htmlFor={inputId}
            className="text-(--text-sm) font-medium text-(--color-text-secondary)"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 px-(--space-4) rounded-(--radius-md)',
            'bg-(--color-surface) text-(--color-text)',
            'border border-(--color-border)',
            'placeholder:text-(--color-text-muted)',
            'transition-all duration-(--duration-fast)',
            'focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)',
            error && 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-(--text-xs) text-(--color-danger)" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-(--text-xs) text-(--color-text-muted)">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
export type { InputProps };
