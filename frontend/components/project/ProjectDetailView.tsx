'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, Calendar, Flag, Users as UsersIcon, Building2, Edit3, Trash2,
  CheckCircle2, Activity as ActivityIcon, ClipboardList, Bug, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Topbar from '@/components/dashboard/Topbar';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectForm from '@/components/admin/ProjectForm';
import TaskCard, { TaskLite } from '@/components/project/TaskCard';
import TaskDrawer, { TaskFull } from '@/components/project/TaskDrawer';
import NewTaskModal from '@/components/project/NewTaskModal';
import { api } from '@/lib/api';
import { useAuth, Role } from '@/lib/auth';
import { cn, formatDate, priorityColor, statusColor, timeAgo } from '@/lib/utils';

interface Project {
  _id: string;
  name: string;
  description?: string;
  techStack?: string[];
  tags?: string[];
  status: string;
  priority: string;
  progress: number;
  startDate?: string;
  deadline?: string;
  budget?: number;
  client: { _id: string; name: string; company?: string; email?: string; phone?: string };
  teamMembers: { _id: string; name: string; email?: string; designation?: string }[];
  createdBy?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

const COLUMNS: { key: TaskLite['status']; label: string; tone: any }[] = [
  { key: 'todo' as any, label: 'To do', tone: 'slate' },
  { key: 'in-progress' as any, label: 'In progress', tone: 'indigo' },
  { key: 'review' as any, label: 'Review', tone: 'violet' },
  { key: 'done' as any, label: 'Done', tone: 'emerald' },
  { key: 'blocked' as any, label: 'Blocked', tone: 'rose' },
];

export default function ProjectDetailView({
  projectId, backHref,
}: { projectId: string; backHref: string }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTask, setOpenTask] = useState<TaskFull | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [tab, setTab] = useState<'board' | 'overview' | 'activity'>('board');
  const [activity, setActivity] = useState<any[]>([]);

  const canEditProject = user?.role === 'admin';
  const canDeleteProject = user?.role === 'admin';
  const canCreateTask = user?.role === 'admin' || user?.role === 'team';

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        api.get<{ project: Project }>(`/projects/${projectId}`),
        api.get<{ tasks: TaskFull[] }>(`/projects/${projectId}/tasks`),
      ]);
      setProject(pRes.project);
      setTasks(tRes.tasks);
    } catch (e: any) { toast.error(e.message); router.push(backHref); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [projectId]);

  useEffect(() => {
    if (tab !== 'activity' || activity.length) return;
    (async () => {
      try {
        const res = await api.get<{ activity: any[] }>(`/projects/activity`);
        setActivity(res.activity.filter((a) => a.project?._id === projectId || a.project === projectId));
      } catch {}
    })();
  }, [tab, projectId, activity.length]);

  const byStatus = useMemo(() => {
    const m: Record<string, TaskFull[]> = { todo: [], 'in-progress': [], review: [], done: [], blocked: [] };
    tasks.forEach((t) => { (m[t.status] ||= []).push(t); });
    return m;
  }, [tasks]);

  const onTaskChanged = (t: TaskFull) => {
    setTasks((prev) => prev.map((x) => (x._id === t._id ? { ...x, ...t } : x)));
    // refresh project progress
    (async () => {
      try {
        const { project: p } = await api.get<{ project: Project }>(`/projects/${projectId}`);
        setProject(p);
      } catch {}
    })();
  };
  const onTaskCreated = (t: TaskFull) => {
    setTasks((prev) => [t, ...prev]);
    (async () => {
      try {
        const { project: p } = await api.get<{ project: Project }>(`/projects/${projectId}`);
        setProject(p);
      } catch {}
    })();
  };
  const onTaskDeleted = (id: string) => {
    setTasks((prev) => prev.filter((x) => x._id !== id));
    (async () => {
      try {
        const { project: p } = await api.get<{ project: Project }>(`/projects/${projectId}`);
        setProject(p);
      } catch {}
    })();
  };

  const deleteProject = async () => {
    try {
      await api.del(`/projects/${projectId}`);
      toast.success('Project deleted');
      router.push(backHref);
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading || !project) {
    return (
      <>
        <Topbar title="Loading project…" />
        <div className="p-8 text-[13px] text-slate-500">Fetching project details…</div>
      </>
    );
  }

  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)
    : null;

  const taskStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    bugs: tasks.filter((t) => t.type === 'bug').length,
    pendingApproval: tasks.filter((t) => t.status === 'done' && !t.clientApproved).length,
  };

  return (
    <>
      <Topbar
        title={project.name}
        subtitle={`${project.client?.company || project.client?.name} · updated ${timeAgo(project.updatedAt)}`}
        right={
          <div className="flex items-center gap-2">
            <Link href={backHref} className="btn-secondary h-9">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            {canEditProject && (
              <button onClick={() => setEditOpen(true)} className="btn-secondary h-9">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {canCreateTask && (
              <button onClick={() => setNewTaskOpen(true)} className="btn-primary h-9">
                <Plus className="w-3.5 h-3.5" /> New task
              </button>
            )}
          </div>
        }
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Hero card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-950 text-white p-8"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse at 20% 30%, black 40%, transparent 75%)',
            }}
          />
          <div
            aria-hidden
            className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 60%)' }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge tone="slate" className={cn('!bg-white/10 !text-white border border-white/10', statusColor[project.status].replace('bg-', '!bg-').replace('text-', '!text-'))}>
                  {project.status}
                </Badge>
                <Badge className={cn('!bg-white/10 !text-white border border-white/10', priorityColor[project.priority].replace('bg-', '!bg-').replace('text-', '!text-'))}>
                  <Flag className="w-3 h-3" /> {project.priority}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.05]">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-3 text-[15px] text-slate-300 leading-relaxed max-w-xl">
                  {project.description}
                </p>
              )}

              {project.techStack && project.techStack.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {project.techStack.map((t) => (
                    <span key={t} className="px-2.5 h-6 rounded-md bg-white/5 border border-white/10 text-[11.5px] font-medium text-slate-200 inline-flex items-center">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 min-w-[280px]">
              <InfoPill label="Deadline" value={project.deadline ? formatDate(project.deadline) : '—'} sub={daysLeft != null ? (daysLeft >= 0 ? `${daysLeft}d left` : `${Math.abs(daysLeft)}d overdue`) : undefined} />
              <InfoPill label="Started" value={project.startDate ? formatDate(project.startDate) : '—'} />
              <InfoPill label="Tasks" value={`${taskStats.done}/${taskStats.total}`} sub={`${taskStats.bugs} bugs`} />
              <InfoPill label="Progress" value={`${project.progress}%`} />
            </div>
          </div>

          <div className="relative z-10 mt-8">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-indigo-400 rounded-full"
              />
            </div>
          </div>
        </motion.section>

        {/* People row */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="card-flat p-5">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">
              <Building2 className="w-3 h-3 inline mr-1" /> Client
            </p>
            <div className="flex items-center gap-3">
              <Avatar name={project.client?.name} size={44} />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-950 truncate">{project.client?.name}</p>
                <p className="text-[12.5px] text-slate-500 truncate">
                  {project.client?.company || project.client?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="card-flat p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <UsersIcon className="w-3 h-3 inline mr-1" /> Team
              </p>
              <span className="text-[11.5px] text-slate-500">{project.teamMembers.length} member{project.teamMembers.length === 1 ? '' : 's'}</span>
            </div>
            {project.teamMembers.length === 0 ? (
              <p className="text-[12.5px] text-slate-500">No team members assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {project.teamMembers.map((m) => (
                  <div key={m._id} className="inline-flex items-center gap-2 px-2.5 h-8 rounded-full bg-slate-50 border border-slate-900/[0.06]">
                    <Avatar name={m.name} size={20} />
                    <span className="text-[12.5px] font-medium text-slate-800">{m.name}</span>
                    {m.designation && <span className="text-[11px] text-slate-400">· {m.designation}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-white border border-slate-900/[0.06] w-fit">
          {[
            { k: 'board', label: 'Task board', icon: ClipboardList },
            { k: 'overview', label: 'Overview', icon: CheckCircle2 },
            { k: 'activity', label: 'Activity', icon: ActivityIcon },
          ].map((t) => {
            const Icon = t.icon;
            const on = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k as any)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 h-8 rounded-md text-[12.5px] font-medium transition-colors',
                  on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'board' && (
          <section>
            {tasks.length === 0 ? (
              <div className="card-flat">
                <EmptyState
                  icon={ClipboardList}
                  title="No tasks yet"
                  copy={canCreateTask
                    ? 'Break the work into tasks, bugs, and features. Assign them to team members and track progress.'
                    : 'Tasks will appear here once the team gets started.'}
                  cta={canCreateTask && (
                    <button onClick={() => setNewTaskOpen(true)} className="btn-primary">
                      <Plus className="w-4 h-4" /> Create first task
                    </button>
                  )}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {COLUMNS.map((col) => {
                  const items = byStatus[col.key] || [];
                  return (
                    <div key={col.key} className="rounded-xl bg-[#FAFAFA] border border-slate-900/[0.06] p-3 min-h-[180px]">
                      <div className="flex items-center justify-between px-1 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge tone={col.tone}>{col.label}</Badge>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{items.length}</span>
                      </div>
                      <div className="space-y-2">
                        {items.map((t) => (
                          <TaskCard
                            key={t._id}
                            task={t as any}
                            onClick={() => setOpenTask(t)}
                          />
                        ))}
                        {items.length === 0 && (
                          <p className="text-[11.5px] text-slate-400 text-center py-6">Nothing here</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === 'overview' && (
          <section className="grid lg:grid-cols-3 gap-5">
            <OverviewCard label="Total tasks" value={taskStats.total} icon={ClipboardList} />
            <OverviewCard label="Completed" value={taskStats.done} icon={CheckCircle2} tone="emerald" />
            <OverviewCard label="Open bugs" value={taskStats.bugs} icon={Bug} tone="rose" />
            <OverviewCard label="Awaiting client approval" value={taskStats.pendingApproval} icon={Sparkles} tone="amber" />

            <div className="lg:col-span-2 card-flat p-6">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">Recent tasks</p>
              <ul className="divide-y divide-slate-900/[0.06] -mx-2">
                {tasks.slice(0, 6).map((t) => (
                  <li key={t._id}>
                    <button
                      onClick={() => setOpenTask(t)}
                      className="w-full text-left px-2 py-2.5 rounded-md hover:bg-slate-50/70 flex items-center gap-3"
                    >
                      <Badge className={cn('!h-5', statusColor[t.status])}>{t.status}</Badge>
                      <span className="text-[13px] text-slate-800 flex-1 truncate">{t.title}</span>
                      <span className="text-[11px] text-slate-400">{timeAgo(t.updatedAt)}</span>
                    </button>
                  </li>
                ))}
                {tasks.length === 0 && <p className="text-[12.5px] text-slate-500 px-2 py-4">No tasks yet.</p>}
              </ul>
            </div>
          </section>
        )}

        {tab === 'activity' && (
          <section className="card-flat p-6">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-4">Timeline</p>
            {activity.length === 0 ? (
              <p className="text-[13px] text-slate-500">No activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {activity.map((a) => (
                  <li key={a._id} className="flex gap-3">
                    <Avatar name={a.user?.name} size={30} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-800 leading-snug">
                        <span className="font-medium text-slate-950">{a.user?.name}</span>{' '}
                        <span className="text-slate-600">{a.action.replace(/\./g, ' ')}</span>
                        {a.details?.title && <span className="text-slate-500"> — {a.details.title}</span>}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {canDeleteProject && (
          <div className="pt-4">
            <button onClick={() => setConfirmDel(true)} className="text-[12.5px] text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Delete project permanently
            </button>
          </div>
        )}
      </div>

      {/* Task drawer */}
      <TaskDrawer
        task={openTask}
        teamOptions={project.teamMembers}
        open={!!openTask}
        onClose={() => setOpenTask(null)}
        onSaved={onTaskChanged}
        onDeleted={onTaskDeleted}
      />

      {/* New task */}
      <NewTaskModal
        projectId={projectId}
        teamOptions={project.teamMembers}
        open={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onCreated={onTaskCreated}
      />

      {/* Edit project */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project" size="xl">
        <ProjectForm
          initial={{
            _id: project._id,
            name: project.name,
            description: project.description,
            techStack: project.techStack || [],
            tags: project.tags || [],
            client: project.client._id,
            teamMembers: project.teamMembers.map((m) => m._id),
            startDate: project.startDate,
            deadline: project.deadline,
            status: project.status,
            priority: project.priority,
            budget: project.budget,
          }}
          onSaved={(p) => { setProject(p); setEditOpen(false); }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={deleteProject}
        title="Delete project?"
        message={`"${project.name}" and all its tasks, comments, and activity will be deleted. This cannot be undone.`}
        confirmLabel="Delete project"
      />
    </>
  );
}

function InfoPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.14em] text-slate-400 font-semibold">{label}</p>
      <p className="mt-1 text-[20px] font-semibold tracking-[-0.01em] leading-none">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

function OverviewCard({
  label, value, icon: Icon, tone = 'slate',
}: { label: string; value: number; icon: any; tone?: 'slate' | 'emerald' | 'rose' | 'amber' }) {
  const tones: any = {
    slate: 'bg-slate-50 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="card-flat p-5 flex items-start justify-between">
      <div>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-slate-950 leading-none">{value}</p>
      </div>
      <div className={cn('w-9 h-9 rounded-md flex items-center justify-center', tones[tone])}>
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
    </div>
  );
}
