'use client';

import { useEffect, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import ProjectCard, { ProjectCardData } from '@/components/ProjectCard';
import EmptyState from '@/components/ui/EmptyState';
import { api } from '@/lib/api';

export default function TeamProjectsPage() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get<{ projects: ProjectCardData[] }>('/projects')
      .then((d) => setProjects(d.projects))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="My Projects" subtitle="Everything you are assigned to." />
      <div className="p-6 lg:p-8">
        {loading ? (
          <div className="card-flat p-10 text-center text-[13px] text-slate-500">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="card-flat">
            <EmptyState icon={FolderKanban} title="No projects yet" copy="Ask your admin to assign you to a project." />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <ProjectCard key={p._id} project={p} href={`/team/projects/${p._id}`} delay={i * 0.03} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
