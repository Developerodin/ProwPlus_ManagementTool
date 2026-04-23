'use client';

import ProjectDetailView from '@/components/project/ProjectDetailView';

export default function TeamProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailView projectId={params.id} backHref="/team/projects" />;
}
