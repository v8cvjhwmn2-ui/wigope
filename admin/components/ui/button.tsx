import * as React from 'react';
import { cn } from '@/lib/utils';

// Wigope-themed shadcn-style button. Tokens come from tailwind.config.ts — never hardcode.
type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-card font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wigope-orange-600/40';

const variants: Record<Variant, string> = {
  primary: 'bg-grad-orange text-white shadow-hero hover:brightness-105',
  secondary:
    'border border-wigope-orange-600 bg-white text-wigope-orange-600 hover:bg-wigope-orange-50',
  tertiary: 'text-wigope-orange-600 hover:bg-wigope-orange-50',
  destructive: 'bg-danger text-white hover:bg-red-600',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
