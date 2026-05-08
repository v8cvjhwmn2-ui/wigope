import * as React from 'react';
import { Button } from './button';

export function EmptyState({
  title,
  scriptTagline,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  scriptTagline: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-grad-orange-soft text-wigope-orange-600">
        {icon ?? <span className="font-display text-3xl">✨</span>}
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold text-wigope-navy-900">{title}</h3>
      <p className="mt-2 max-w-md font-script text-2xl text-ink-secondary">{scriptTagline}</p>
      {actionLabel && onAction && (
        <Button variant="primary" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
