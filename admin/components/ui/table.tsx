import * as React from 'react';
import { cn } from '@/lib/utils';

export const Table = ({ className, ...p }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-x-auto rounded-card border border-border-soft bg-surface-card shadow-card">
    <table className={cn('w-full text-left text-sm', className)} {...p} />
  </div>
);

export const THead = (p: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="bg-surface-muted text-xs uppercase tracking-wider text-ink-tertiary" {...p} />
);

export const TBody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className="divide-y divide-border-soft" {...p} />
);

export const TR = (p: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...p} />;

export const TH = ({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('px-4 py-3 font-semibold', className)} {...p} />
);

export const TD = ({ className, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 text-ink-primary', className)} {...p} />
);
