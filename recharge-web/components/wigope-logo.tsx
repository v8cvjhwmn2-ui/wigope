import Image from 'next/image';
import { clsx } from 'clsx';

export function WigopeLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <Image
        src={compact ? '/assets/icons/wigope_logo_mark.png' : '/assets/icons/wigope_logo.png'}
        alt="Wigope"
        width={compact ? 38 : 112}
        height={compact ? 38 : 42}
        priority
        className="object-contain"
      />
    </div>
  );
}
