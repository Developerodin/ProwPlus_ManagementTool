'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatCard({
  label, value, icon: Icon, delta, tone = 'slate', delay = 0,
}: {
  label: string;
  value: string | number;
  icon: any;
  delta?: string;
  tone?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose';
  delay?: number;
}) {
  const toneMap: Record<string, string> = {
    slate: 'bg-slate-50 text-slate-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      className="p-6 rounded-xl bg-white hairline hover:border-slate-900/20 hover:shadow-card transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="mt-3 text-[32px] font-semibold tracking-[-0.02em] text-slate-950 leading-none">
            {value}
          </p>
          {delta && (
            <p className="mt-2 text-[12px] text-emerald-600 font-medium">{delta}</p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-md flex items-center justify-center', toneMap[tone])}>
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  );
}
