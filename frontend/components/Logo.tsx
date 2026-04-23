import Image from 'next/image';

import { cn } from '@/lib/utils';

interface Props {
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
  className?: string;
}

/**
 * Brand mark: prowplus icon from `/pp_icons.png` plus optional wordmark.
 */
export default function Logo({ variant = 'light', showWordmark = true, className }: Props) {
  const word = variant === 'light' ? 'text-slate-900' : 'text-white';

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-lg p-0.5',
          variant === 'dark' && 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]'
        )}
      >
        <Image
          src="/pp_icons.png"
          alt={showWordmark ? '' : 'prowplus'}
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          sizes="28px"
          priority
        />
      </span>
      {showWordmark && (
        <span className={cn('text-[15px] font-semibold tracking-tight', word)}>prowplus</span>
      )}
    </div>
  );
}
