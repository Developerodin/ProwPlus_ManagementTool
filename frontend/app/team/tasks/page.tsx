'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckSquare, Clock } from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/Badge';
import { api } from '@/lib/api';
import { cn, formatDate, priorityColor, statusColor } from '@/lib/utils';

export default function TeamTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get<{ tasks: any[] }>('/tasks/mine')
      .then((d) => setTasks(d.tasks))
      .finally(() => setLoading(false));
  }, []);

  const groups = [
    { key: 'open', label: 'Open', items: tasks.filter((t) => !['done'].includes(t.status)) },
    { key: 'done', label: 'Completed', items: tasks.filter((t) => t.status === 'done') },
  ];

  return (
    <>
      <Topbar title="My Tasks" subtitle="Everything assigned to you across projects." />
      <div className="p-6 lg:p-8 space-y-8">
        {loading ? (
          <div className="card-flat p-10 text-center text-[13px] text-slate-500">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="card-flat">
            <EmptyState icon={CheckSquare} title="No tasks" copy="Once you are assigned tasks, they will appear here." />
          </div>
        ) : groups.map((g) => (
          <section key={g.key}>
            <h2 className="text-[14px] font-semibold text-slate-950 mb-3">{g.label} <span className="text-slate-400 font-normal">({g.items.length})</span></h2>
            {g.items.length === 0 ? (
              <p className="text-[12.5px] text-slate-500">Nothing here.</p>
            ) : (
              <div className="card-flat overflow-hidden">
                <ul className="divide-y divide-slate-900/[0.06]">
                  {g.items.map((t) => (
                    <li key={t._id}>
                      <Link href={`/team/projects/${t.project?._id || t.project}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70">
                        <Badge className={cn(statusColor[t.status])}>{t.status}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-medium text-slate-950 truncate">{t.title}</p>
                          <p className="text-[11.5px] text-slate-500 truncate">{t.project?.name}</p>
                        </div>
                        <Badge className={cn('!h-5', priorityColor[t.priority])}>{t.priority}</Badge>
                        {t.dueDate && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3" /> {formatDate(t.dueDate, { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
