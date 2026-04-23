import clsx, { ClassValue } from 'clsx';

export const cn = (...args: ClassValue[]) => clsx(...args);

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

export const formatDate = (d?: string | Date, opts?: Intl.DateTimeFormatOptions) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, opts || {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const timeAgo = (d?: string | Date) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d ago`;
  return formatDate(d);
};

export const statusColor: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-indigo-50 text-indigo-700',
  testing: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700',
  'on-hold': 'bg-rose-50 text-rose-700',
  todo: 'bg-slate-100 text-slate-700',
  review: 'bg-violet-50 text-violet-700',
  done: 'bg-emerald-50 text-emerald-700',
  blocked: 'bg-rose-50 text-rose-700',
};

export const priorityColor: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-sky-50 text-sky-700',
  high: 'bg-amber-50 text-amber-700',
  critical: 'bg-rose-50 text-rose-700',
};
