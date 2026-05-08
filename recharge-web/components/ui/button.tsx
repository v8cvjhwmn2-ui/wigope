import { clsx } from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
};

export function Button({ className, variant = 'primary', loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-wigope-orange text-white shadow-lg shadow-orange-500/20 hover:bg-wigope-orangeDark',
        variant === 'secondary' && 'border border-wigope-line bg-white text-navy-900 hover:border-orange-200 hover:bg-orange-50',
        variant === 'ghost' && 'text-navy-700 hover:bg-slate-100',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
      {children}
    </button>
  );
}
