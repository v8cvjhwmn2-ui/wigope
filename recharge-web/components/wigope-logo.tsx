import Image from 'next/image';

export function WigopeLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
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
