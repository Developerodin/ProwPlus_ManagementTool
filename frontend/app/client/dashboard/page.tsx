'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, CheckCircle2, Sparkles, Clock, ArrowRight } from 'lucide-react';

import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import ProjectCard, { ProjectCardData } from '@/components/ProjectCard';
import EmptyState from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ClientDashboardPage() {
  const user = useAuth((s) => s.user);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ projects: ProjectCardData[] }>('/projects')
      .then((d) => setProjects(d.projects))
      .finally(() => setLoading(false));
  }, []);

  const active = projects.filter((p) => ['planning', 'in-progress', 'testing'].includes(p.status)).length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;

  return (
    <>
      <Topbar
        title={`Welcome, ${user?.name?.split(' ')[0] || ''}`}
        subtitle="Track your projects, review progress, and sign off on delivered work."
      />

      <div className="p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Your projects" value={projects.length} icon={FolderKanban} tone="indigo" />
          <StatCard label="Active" value={active} icon={Sparkles} tone="amber" delay={0.05} />
          <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="emerald" delay={0.1} />
          <StatCard label="Avg progress" value={`${avgProgress}%`} icon={Clock} tone="slate" delay={0.15} />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow mb-1"><span className="w-6 h-px bg-indigo-600" /> Your portfolio</div>
              <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-slate-950">Projects we are building for you</h2>
            </div>
            <Link href="/client/projects" className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-700 hover:text-indigo-600">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="card-flat p-10 text-center text-[13px] text-slate-500">Loading…</div>
          ) : projects.length === 0 ? (
            <div className="card-flat">
              <EmptyState icon={FolderKanban} title="No projects yet" copy="Your projects will appear here once they are set up." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.slice(0, 6).map((p, i) => (
                <ProjectCard key={p._id} project={p} href={`/client/projects/${p._id}`} delay={i * 0.03} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
