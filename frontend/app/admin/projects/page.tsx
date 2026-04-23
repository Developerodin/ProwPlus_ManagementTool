'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, FolderKanban, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

import Topbar from '@/components/dashboard/Topbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ProjectCard, { ProjectCardData } from '@/components/ProjectCard';
import ProjectForm from '@/components/admin/ProjectForm';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const STATUSES = ['all', 'planning', 'in-progress', 'testing', 'completed', 'on-hold'];

export default function AdminProjectsPage() {
  const [list, setList] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { projects } = await api.get<{ projects: ProjectCardData[] }>('/projects');
      setList(projects);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return list
      .filter((p) => status === 'all' || p.status === status)
      .filter((p) => !q.trim() || p.name.toLowerCase().includes(q.toLowerCase()));
  }, [list, q, status]);

  const onCreated = (p: ProjectCardData) => {
    setList((prev) => [p, ...prev]);
    setCreateOpen(false);
  };

  return (
    <>
      <Topbar
        title="Projects"
        subtitle={`${list.length} total · ${list.filter((p) => p.status === 'in-progress').length} in progress`}
        right={
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" strokeWidth={2} /> New project
          </button>
        }
      />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects…"
              className="w-full h-10 pl-9 pr-3 rounded-md bg-white border border-slate-900/[0.08] text-[13.5px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-md bg-white border border-slate-900/[0.06] overflow-x-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'px-3 h-8 rounded-md text-[12px] font-medium whitespace-nowrap transition-colors',
                  status === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="card-flat px-6 py-16 text-center text-[13px] text-slate-500">Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div className="card-flat">
            <EmptyState
              icon={FolderKanban}
              title={list.length === 0 ? 'No projects yet' : 'No matches'}
              copy={list.length === 0
                ? 'Create a project, assign a client and team, and start tracking tasks, bugs, and progress in one place.'
                : 'Try a different filter or search term.'}
              cta={list.length === 0 && (
                <button onClick={() => setCreateOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Create project
                </button>
              )}
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
              <ProjectCard key={p._id} project={p} href={`/admin/projects/${p._id}`} delay={i * 0.03} />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create project"
        subtitle="Set scope, assign a client and team, and pick a timeline."
        size="xl"
      >
        <ProjectForm onSaved={onCreated} onCancel={() => setCreateOpen(false)} />
      </Modal>
    </>
  );
}
