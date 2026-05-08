import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, hero, ...p }: React.HTMLAttributes<HTMLDivElement> & { hero?: boolean }) => (
  <div
    className={cn(
      'border border-border-soft bg-surface-card',
      hero ? 'rounded-hero shadow-hero' : 'rounded-card shadow-card',
      className,
    )}
    {...p}
  />
);

export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 pt-5', className)} {...p} />
);

export const CardTitle = ({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('font-display text-lg font-semibold text-wigope-navy-900 tracking-tight', className)}
    {...p}
  />
);

export const CardDescription = ({ className, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('mt-1 text-sm text-ink-secondary', className)} {...p} />
);

export const CardContent = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5', className)} {...p} />
);

export const CardFooter = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center gap-2 px-5 pb-5', className)} {...p} />
);
