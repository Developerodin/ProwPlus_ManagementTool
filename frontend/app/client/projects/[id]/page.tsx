'use client';

import ProjectDetailView from '@/components/project/ProjectDetailView';

export default function ClientProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailView projectId={params.id} backHref="/client/projects" />;
}
