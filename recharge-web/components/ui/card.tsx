import { clsx } from 'clsx';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={clsx('rounded-[28px] border border-wigope-line bg-white p-5 shadow-card', className)}>
      {children}
    </section>
  );
}
