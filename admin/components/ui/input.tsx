import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-11 rounded-chip border border-border-soft bg-surface-muted px-3.5 text-sm',
            'text-ink-primary placeholder:text-ink-tertiary',
            'focus:border-wigope-orange-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-wigope-orange-600/15',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className,
          )}
          {...props}
        />
        {(hint || error) && (
          <span className={cn('text-xs', error ? 'text-danger' : 'text-ink-tertiary')}>
            {error ?? hint}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
