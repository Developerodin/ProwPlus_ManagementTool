import { cn } from '@/lib/utils';

export default function EmptyState({
  icon: Icon, title, copy, cta, className,
}: {
  icon: any;
  title: string;
  copy?: string;
  cta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-6 py-16 text-center', className)}>
      <div className="mx-auto w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center mb-5">
        <Icon className="w-5 h-5 text-slate-600" strokeWidth={1.75} />
      </div>
      <p className="text-[15px] font-semibold text-slate-950">{title}</p>
      {copy && <p className="mt-1.5 text-[13px] text-slate-500 max-w-md mx-auto leading-relaxed">{copy}</p>}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
