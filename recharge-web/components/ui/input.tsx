import { clsx } from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-extrabold text-navy-900">{label}</span> : null}
      <input
        className={clsx(
          'h-14 w-full rounded-2xl border bg-white px-4 text-base font-bold text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-wigope-orange focus:ring-4 focus:ring-orange-100',
          error ? 'border-red-300' : 'border-wigope-line',
          className
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm font-bold text-red-600">{error}</span> : null}
    </label>
  );
}
