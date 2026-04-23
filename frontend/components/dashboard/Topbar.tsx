'use client';

import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Topbar({ title, subtitle, right }: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const user = useAuth((s) => s.user);
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-900/[0.06]">
      <div className="h-16 px-6 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-slate-950 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12.5px] text-slate-500 truncate">{subtitle}</p>
          )}
        </div>

        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
          <input
            placeholder="Search projects, tasks, people…"
            className="h-9 w-72 pl-9 pr-3 rounded-md bg-slate-50 border border-slate-900/[0.06] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all"
          />
        </div>

        <button className="relative w-9 h-9 rounded-md border border-slate-900/[0.06] hover:bg-slate-50 flex items-center justify-center">
          <Bell className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
        </button>

        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[12.5px] font-medium text-slate-900 leading-tight">{user?.name}</span>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider">{user?.role}</span>
        </div>

        {right}
      </div>
    </div>
  );
}
