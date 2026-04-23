'use client';

import Link from 'next/link';
import { Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { formatDate, priorityColor, statusColor, cn } from '@/lib/utils';

export interface ProjectCardData {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  deadline?: string;
  techStack?: string[];
  client?: { _id: string; name: string; company?: string } | null;
  teamMembers?: { _id: string; name: string }[];
}

export default function ProjectCard({
  project, href, delay = 0,
}: {
  project: ProjectCardData;
  href: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={href}
        className="group block p-6 rounded-xl bg-white hairline hover:border-slate-900/20 hover:shadow-card transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-md bg-slate-900 text-white flex items-center justify-center text-[13px] font-semibold shrink-0">
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge tone="slate" className={cn(statusColor[project.status])}>
              {project.status}
            </Badge>
            <Badge tone="slate" className={cn('!h-5 !text-[10.5px] uppercase tracking-wider', priorityColor[project.priority])}>
              {project.priority}
            </Badge>
          </div>
        </div>

        <h3 className="text-[15.5px] font-semibold tracking-tight text-slate-950 group-hover:text-indigo-600 transition-colors truncate">
          {project.name}
        </h3>
        <p className="mt-1.5 text-[12.5px] text-slate-600 line-clamp-2 min-h-[2.5em]">
          {project.description || 'No description yet — add context so teammates know what you are shipping.'}
        </p>

        {(project.techStack && project.techStack.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 4).map((t) => (
              <span key={t} className="px-2 h-5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-medium inline-flex items-center">
                {t}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="text-[11px] text-slate-400 self-center">+{project.techStack.length - 4}</span>
            )}
          </div>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11.5px] text-slate-500 mb-1.5">
            <span>Progress</span>
            <span className="font-medium text-slate-700">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-900/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
            <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
            <div className="flex -space-x-1.5">
              {(project.teamMembers || []).slice(0, 4).map((m) => (
                <Avatar key={m._id} name={m.name} size={22} className="ring-2 ring-white" />
              ))}
            </div>
            {(!project.teamMembers || project.teamMembers.length === 0) && <span>No one assigned</span>}
          </div>
          <div className="flex items-center gap-1 text-[11.5px] text-slate-500">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
            {project.deadline ? formatDate(project.deadline) : 'No deadline'}
          </div>
        </div>

        {project.client && (
          <div className="mt-3 text-[11.5px] text-slate-500">
            Client: <span className="font-medium text-slate-700">{project.client.company || project.client.name}</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
