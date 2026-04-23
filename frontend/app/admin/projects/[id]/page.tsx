'use client';

import ProjectDetailView from '@/components/project/ProjectDetailView';

export default function AdminProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailView projectId={params.id} backHref="/admin/projects" />;
}
