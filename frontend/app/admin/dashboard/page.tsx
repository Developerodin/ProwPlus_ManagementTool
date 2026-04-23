'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FolderKanban, Users, Building2, Activity as ActivityIcon,
  ArrowRight, Plus, Calendar, CheckCircle2,
} from 'lucide-react';

import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { api } from '@/lib/api';
import { cn, formatDate, statusColor, timeAgo } from '@/lib/utils';

interface ProjectStats { total: number; active: number; completed: number; onHold: number }
interface UserStats { teamCount: number; clientCount: number; adminCount: number }
interface Project {
  _id: string; name: string; status: string; progress: number; deadline?: string;
  client: { _id: string; name: string; company?: string };
  teamMembers: { _id: string; name: string }[];
}
interface ActivityItem {
  _id: string; action: string; createdAt: string; details: any;
  user: { name: string; role: string };
  project?: { name: string };
}

export default function AdminDashboardPage() {
  const [proj, setProj] = useState<ProjectStats | null>(null);
  const [users, setUsers] = useState<UserStats | null>(null);
  const [recent, setRecent] = useState<Project[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, u, pr, a] = await Promise.all([
          api.get<ProjectStats>('/projects/stats'),
          api.get<UserStats>('/users/stats'),
          api.get<{ projects: Project[] }>('/projects'),
          api.get<{ activity: ActivityItem[] }>('/projects/activity'),
        ]);
        setProj(p);
        setUsers(u);
        setRecent(pr.projects.slice(0, 5));
        setActivity(a.activity.slice(0, 8));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Topbar
        title="Overview"
        subtitle="Your portfolio at a glance — projects, team, and client activity."
        right={
          <Link href="/admin/projects/new" className="btn-primary">
            <Plus className="w-4 h-4" strokeWidth={2} />
            New project
          </Link>
        }
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Total projects"
            value={proj?.total ?? '—'}
            icon={FolderKanban}
            tone="indigo"
            delta={proj ? `${proj.active} active` : undefined}
            delay={0}
          />
          <StatCard
            label="Team members"
            value={users?.teamCount ?? '—'}
            icon={Users}
            tone="slate"
            delay={0.05}
          />
          <StatCard
            label="Clients"
            value={users?.clientCount ?? '—'}
            icon={Building2}
            tone="emerald"
            delay={0.1}
          />
          <StatCard
            label="Completed"
            value={proj?.completed ?? '—'}
            icon={CheckCircle2}
            tone="emerald"
            delay={0.15}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent projects */}
          <section className="lg:col-span-2 card-flat p-0 overflow-hidden">
            <header className="flex items-center justify-between px-6 py-5 border-b border-slate-900/[0.06]">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight text-slate-950">
                  Recent projects
                </h2>
                <p className="text-[12.5px] text-slate-500">Latest additions and ongoing work</p>
              </div>
              <Link
                href="/admin/projects"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-700 hover:text-indigo-600 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </header>

            {loading && (
              <div className="px-6 py-10 text-[13px] text-slate-500">Loading…</div>
            )}
            {!loading && recent.length === 0 && (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                copy="Create your first project to start assigning team members and tracking progress."
                cta={<Link href="/admin/projects/new" className="btn-primary">
                  <Plus className="w-4 h-4" /> New project
                </Link>}
              />
            )}

            {!loading && recent.length > 0 && (
              <ul className="divide-y divide-slate-900/[0.06]">
                {recent.map((p, i) => (
                  <motion.li
                    key={p._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    className="px-6 py-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <Link href={`/admin/projects/${p._id}`} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center text-[12.5px] font-semibold">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-medium text-slate-950 truncate">{p.name}</p>
                          <Badge tone="slate" className={cn(statusColor[p.status])}>
                            {p.status}
                          </Badge>
                        </div>
                        <p className="text-[12.5px] text-slate-500 truncate">
                          {p.client?.company || p.client?.name || '—'}
                          {p.deadline && <> · due {formatDate(p.deadline)}</>}
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-slate-500">Progress</span>
                          <span className="text-[11px] font-medium text-slate-700">{p.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900 rounded-full transition-all"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex -space-x-1.5">
                        {(p.teamMembers || []).slice(0, 3).map((m) => (
                          <Avatar key={m._id} name={m.name} size={26} className="ring-2 ring-white" />
                        ))}
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>

          {/* Activity feed */}
          <section className="card-flat p-0 overflow-hidden">
            <header className="flex items-center justify-between px-6 py-5 border-b border-slate-900/[0.06]">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight text-slate-950">Activity</h2>
                <p className="text-[12.5px] text-slate-500">Live feed across all projects</p>
              </div>
              <ActivityIcon className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
            </header>
            {loading && (
              <div className="px-6 py-10 text-[13px] text-slate-500">Loading…</div>
            )}
            {!loading && activity.length === 0 && (
              <div className="px-6 py-10 text-[13px] text-slate-500">
                Activity will show up here as your team works.
              </div>
            )}
            {!loading && activity.length > 0 && (
              <ul className="px-3 py-3 max-h-[480px] overflow-y-auto">
                {activity.map((a) => (
                  <li key={a._id} className="px-3 py-2.5 rounded-md hover:bg-slate-50/70">
                    <div className="flex items-start gap-3">
                      <Avatar name={a.user?.name} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-slate-800 leading-snug">
                          <span className="font-medium text-slate-950">{a.user?.name}</span>{' '}
                          {humanAction(a.action)}
                          {a.project?.name && (
                            <span className="text-slate-500"> · {a.project.name}</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-slate-500">{timeAgo(a.createdAt)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Quick actions */}
        <section>
          <div className="mb-4">
            <div className="eyebrow mb-2">
              <span className="w-6 h-px bg-indigo-600" /> Quick actions
            </div>
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-slate-950">
              What do you want to do today?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 border-l border-t border-slate-900/[0.06] rounded-xl overflow-hidden bg-white">
            <QuickAction
              href="/admin/projects/new"
              icon={FolderKanban}
              title="Create project"
              copy="Set scope, assign client and team, pick a deadline."
            />
            <QuickAction
              href="/admin/team/new"
              icon={Users}
              title="Add team member"
              copy="Issue login credentials and assign designation."
            />
            <QuickAction
              href="/admin/clients/new"
              icon={Building2}
              title="Add client"
              copy="Create a client account so they can view their projects."
            />
            <QuickAction
              href="/admin/activity"
              icon={ActivityIcon}
              title="Audit activity"
              copy="Review what's changed across projects today."
            />
          </div>
        </section>
      </div>
    </>
  );
}

function EmptyState({
  icon: Icon, title, copy, cta,
}: { icon: any; title: string; copy: string; cta?: React.ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto w-11 h-11 rounded-md bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-slate-600" strokeWidth={1.75} />
      </div>
      <p className="text-[14px] font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-[12.5px] text-slate-500 max-w-sm mx-auto">{copy}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}

function QuickAction({
  href, icon: Icon, title, copy,
}: { href: string; icon: any; title: string; copy: string }) {
  return (
    <Link
      href={href}
      className="group p-6 border-r border-b border-slate-900/[0.06] hover:bg-slate-50/70 transition-colors"
    >
      <Icon className="w-5 h-5 text-slate-900 mb-4" strokeWidth={1.75} />
      <h3 className="text-[14px] font-semibold tracking-tight text-slate-950 mb-1.5">{title}</h3>
      <p className="text-[12.5px] text-slate-600 leading-relaxed">{copy}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
        Start <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function humanAction(action: string) {
  const map: Record<string, string> = {
    'project.created': 'created a new project',
    'project.status.changed': 'updated project status',
    'task.created': 'added a task',
    'task.status.changed': 'changed task status',
    'task.comment.added': 'left a comment',
    'task.approved': 'approved a task',
  };
  return map[action] || action.replace(/\./g, ' ');
}
