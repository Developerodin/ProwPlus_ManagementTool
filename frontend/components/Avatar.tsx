import { cn, initials } from '@/lib/utils';

interface Props {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

export default function Avatar({ name, src, size = 32, className }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        style={{ width: size, height: size }}
        className={cn('rounded-full object-cover hairline', className)}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={cn(
        'rounded-full flex items-center justify-center font-semibold bg-slate-100 text-slate-700 hairline',
        className
      )}
    >
      {initials(name) || '?'}
    </div>
  );
}
