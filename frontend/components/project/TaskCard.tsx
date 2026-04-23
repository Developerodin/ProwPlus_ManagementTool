'use client';

import { Bug, Sparkles, Wrench, CheckCircle2, MessageSquare, Clock, Check } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { cn, formatDate, priorityColor, statusColor } from '@/lib/utils';

export interface TaskLite {
  _id: string;
  title: string;
  description?: string;
  type: 'task' | 'bug' | 'feature' | 'improvement';
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  clientApproved?: boolean;
  assignedTo?: { _id: string; name: string; avatar?: string; role?: string }[];
  commentsCount?: number;
  subtasks?: { title: string; done: boolean }[];
}

const typeIcon = (t: string) => {
  if (t === 'bug') return Bug;
  if (t === 'feature') return Sparkles;
  if (t === 'improvement') return Wrench;
  return CheckCircle2;
};
const typeTone: Record<string, any> = {
  bug: 'rose', feature: 'indigo', improvement: 'amber', task: 'slate',
};

export default function TaskCard({
  task, onClick,
}: { task: TaskLite; onClick?: () => void }) {
  const Icon = typeIcon(task.type);
  const subtaskDone = task.subtasks?.filter((s) => s.done).length || 0;
  const subtaskTotal = task.subtasks?.length || 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-white border border-slate-900/[0.06] hover:border-slate-900/20 hover:shadow-hair transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge tone={typeTone[task.type]} className="capitalize">
          <Icon className="w-3 h-3" strokeWidth={2} />
          {task.type}
        </Badge>
        <Badge className={cn(priorityColor[task.priority], '!h-5 !text-[10px] uppercase tracking-wider')}>
          {task.priority}
        </Badge>
      </div>

      <p className="text-[13.5px] font-medium text-slate-950 leading-snug line-clamp-2">
        {task.title}
      </p>

      {subtaskTotal > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full"
              style={{ width: `${Math.round((subtaskDone / subtaskTotal) * 100)}%` }}
            />
          </div>
          <span className="text-[10.5px] text-slate-500">{subtaskDone}/{subtaskTotal}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {(task.assignedTo || []).slice(0, 3).map((u) => (
              <Avatar key={u._id} name={u.name} size={20} className="ring-2 ring-white" />
            ))}
          </div>
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-500">
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {formatDate(task.dueDate, { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.commentsCount ? (
            <span className="inline-flex items-center gap-0.5 text-[10.5px] text-slate-500">
              <MessageSquare className="w-3 h-3" strokeWidth={1.75} />
              {task.commentsCount}
            </span>
          ) : null}
          {task.clientApproved && (
            <span className="inline-flex items-center gap-0.5 text-[10.5px] text-emerald-700 font-medium">
              <Check className="w-3 h-3" strokeWidth={2.5} />
              Client ok
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
