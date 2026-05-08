import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'pending' | 'failed' | 'info' | 'neutral';

const tones: Record<Tone, string> = {
  success: 'bg-emerald-50 text-success',
  pending: 'bg-amber-50 text-warning',
  failed: 'bg-red-50 text-danger',
  info: 'bg-blue-50 text-info',
  neutral: 'bg-surface-muted text-ink-secondary',
};

export const Badge = ({
  tone = 'neutral',
  className,
  ...p
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      tones[tone],
      className,
    )}
    {...p}
  />
);
