'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, CheckSquare, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import ProjectCard, { ProjectCardData } from '@/components/ProjectCard';
import Badge from '@/components/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn, formatDate, priorityColor, statusColor, timeAgo } from '@/lib/utils';

export default function TeamDashboardPage() {
  const user = useAuth((s) => s.user);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([
          api.get<{ projects: ProjectCardData[] }>('/projects'),
          api.get<{ tasks: any[] }>('/tasks/mine'),
        ]);
        setProjects(p.projects);
        setTasks(t.tasks);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openTasks = tasks.filter((t) => t.status !== 'done');
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const overdue = openTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date()).length;

  return (
    <>
      <Topbar
        title={`Hi ${user?.name?.split(' ')[0] || ''}, here is your day`}
        subtitle="Projects you are on and tasks that need you."
      />

      <div className="p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Assigned projects" value={projects.length} icon={FolderKanban} tone="indigo" />
          <StatCard label="Open tasks" value={openTasks.length} icon={CheckSquare} tone="slate" delay={0.05} />
          <StatCard label="Overdue" value={overdue} icon={AlertTriangle} tone="rose" delay={0.1} />
          <StatCard label="Completed" value={doneCount} icon={CheckSquare} tone="emerald" delay={0.15} />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow mb-1"><span className="w-6 h-px bg-indigo-600" /> My projects</div>
              <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-slate-950">Active work</h2>
            </div>
            <Link href="/team/projects" className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-700 hover:text-indigo-600">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="card-flat p-10 text-center text-[13px] text-slate-500">Loading…</div>
          ) : projects.length === 0 ? (
            <div className="card-flat">
              <EmptyState icon={FolderKanban} title="No projects assigned yet" copy="Once the admin adds you to a project, it will show up here." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.slice(0, 6).map((p, i) => (
                <ProjectCard key={p._id} project={p} href={`/team/projects/${p._id}`} delay={i * 0.03} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <div className="eyebrow mb-1"><span className="w-6 h-px bg-indigo-600" /> My tasks</div>
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-slate-950">What to do next</h2>
          </div>
          {loading ? (
            <div className="card-flat p-10 text-center text-[13px] text-slate-500">Loading…</div>
          ) : openTasks.length === 0 ? (
            <div className="card-flat">
              <EmptyState icon={CheckSquare} title="Inbox zero" copy="You have no open tasks right now. Nice." />
            </div>
          ) : (
            <div className="card-flat overflow-hidden">
              <ul className="divide-y divide-slate-900/[0.06]">
                {openTasks.slice(0, 10).map((t) => (
                  <li key={t._id}>
                    <Link href={`/team/projects/${t.project?._id || t.project}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70">
                      <Badge className={cn(statusColor[t.status])}>{t.status}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium text-slate-950 truncate">{t.title}</p>
                        <p className="text-[11.5px] text-slate-500 truncate">{t.project?.name}</p>
                      </div>
                      <Badge className={cn('!h-5', priorityColor[t.priority])}>{t.priority}</Badge>
                      {t.dueDate && (
                        <span className={cn(
                          'inline-flex items-center gap-1 text-[11px]',
                          new Date(t.dueDate) < new Date() ? 'text-rose-600 font-medium' : 'text-slate-500'
                        )}>
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
      </div>
    </>
  );
}
