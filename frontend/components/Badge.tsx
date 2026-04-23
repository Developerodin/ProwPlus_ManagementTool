import { cn } from '@/lib/utils';

export default function Badge({
  children,
  className,
  tone = 'slate',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}) {
  const map: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  return (
    <span className={cn('badge', map[tone], className)}>{children}</span>
  );
}
