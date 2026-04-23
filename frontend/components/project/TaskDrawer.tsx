'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Send, Trash2, Calendar, CheckCircle2, Shield, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn, formatDate, timeAgo, priorityColor, statusColor } from '@/lib/utils';

export interface TaskFull {
  _id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  clientApproved?: boolean;
  clientApprovedAt?: string;
  assignedTo?: { _id: string; name: string; role?: string; avatar?: string }[];
  createdBy?: { _id: string; name: string; role?: string };
  subtasks?: { _id?: string; title: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  author: { _id: string; name: string; role: string };
}

const STATUSES = ['todo', 'in-progress', 'review', 'done', 'blocked'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function TaskDrawer({
  task: initial, teamOptions, open, onClose, onSaved, onDeleted,
}: {
  task: TaskFull | null;
  teamOptions: { _id: string; name: string; designation?: string }[];
  open: boolean;
  onClose: () => void;
  onSaved: (t: TaskFull) => void;
  onDeleted?: (id: string) => void;
}) {
  const user = useAuth((s) => s.user);
  const [task, setTask] = useState<TaskFull | null>(initial);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTask(initial); }, [initial]);

  useEffect(() => {
    if (!open || !task?._id) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { comments } = await api.get<{ comments: Comment[] }>(`/tasks/${task._id}/comments`);
        if (alive) setComments(comments);
      } catch (e: any) { toast.error(e.message); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [open, task?._id]);

  if (!task) return null;

  const isAdmin = user?.role === 'admin';
  const isTeam = user?.role === 'team';
  const isClient = user?.role === 'client';
  const canEdit = isAdmin || isTeam;
  const canDelete = isAdmin || isTeam;

  const patch = async (body: any) => {
    setSaving(true);
    try {
      const { task: t } = await api.patch<{ task: TaskFull }>(`/tasks/${task._id}`, body);
      setTask(t);
      onSaved(t);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const updateStatus = (status: string) => patch({ status });

  const toggleSubtask = (idx: number) => {
    if (!canEdit) return;
    const subs = (task.subtasks || []).map((s, i) => (i === idx ? { ...s, done: !s.done } : s));
    patch({ subtasks: subs });
  };
  const addSubtask = () => {
    const title = newSubtask.trim();
    if (!title) return;
    const subs = [...(task.subtasks || []), { title, done: false }];
    patch({ subtasks: subs });
    setNewSubtask('');
  };
  const removeSubtask = (idx: number) => {
    const subs = (task.subtasks || []).filter((_, i) => i !== idx);
    patch({ subtasks: subs });
  };

  const toggleAssignee = (id: string) => {
    const cur = (task.assignedTo || []).map((x) => x._id);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    patch({ assignedTo: next });
  };

  const del = async () => {
    if (!canDelete) return;
    if (!confirm('Delete this task permanently?')) return;
    try {
      await api.del(`/tasks/${task._id}`);
      toast.success('Task deleted');
      onDeleted?.(task._id);
      onClose();
    } catch (e: any) { toast.error(e.message); }
  };

  const approve = async () => {
    try {
      const { task: t } = await api.post<{ task: TaskFull }>(`/tasks/${task._id}/approve`);
      setTask(t);
      onSaved(t);
      toast.success('Approved — client sign-off recorded');
    } catch (e: any) { toast.error(e.message); }
  };

  const send = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const { comment } = await api.post<{ comment: Comment }>(`/tasks/${task._id}/comments`, {
        content: newComment.trim(),
      });
      setComments((c) => [...c, comment]);
      setNewComment('');
    } catch (e: any) { toast.error(e.message); }
    finally { setSending(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-pop flex flex-col"
          >
            <header className="flex items-start gap-3 px-6 py-5 border-b border-slate-900/[0.06]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge className={cn(statusColor[task.status])}>{task.status}</Badge>
                  <Badge className={cn(priorityColor[task.priority])}>{task.priority}</Badge>
                  <Badge tone="slate">{task.type}</Badge>
                  {task.clientApproved && (
                    <Badge tone="emerald"><Shield className="w-3 h-3" /> Client approved</Badge>
                  )}
                </div>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-slate-950 leading-snug">
                  {task.title}
                </h2>
                <p className="mt-1 text-[11.5px] text-slate-500">
                  Created {timeAgo(task.createdAt)} by {task.createdBy?.name || 'unknown'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500"
                aria-label="Close"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {/* Controls */}
              <section className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-slate-900/[0.06]">
                <div>
                  <label className="label block mb-1.5">Status</label>
                  <select
                    disabled={!canEdit || saving}
                    value={task.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="input"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label block mb-1.5">Priority</label>
                  <select
                    disabled={!canEdit || saving}
                    value={task.priority}
                    onChange={(e) => patch({ priority: e.target.value })}
                    className="input"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label block mb-1.5">Due date</label>
                  <input
                    type="date"
                    disabled={!canEdit || saving}
                    value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''}
                    onChange={(e) => patch({ dueDate: e.target.value || null })}
                    className="input"
                  />
                </div>
              </section>

              {task.description && (
                <section className="px-6 py-5 border-b border-slate-900/[0.06]">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">Description</p>
                  <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                </section>
              )}

              {/* Assignees */}
              <section className="px-6 py-5 border-b border-slate-900/[0.06]">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">Assigned to</p>
                <div className="flex flex-wrap gap-2">
                  {teamOptions.map((m) => {
                    const on = (task.assignedTo || []).some((x) => x._id === m._id);
                    return (
                      <button
                        key={m._id}
                        disabled={!canEdit}
                        onClick={() => toggleAssignee(m._id)}
                        className={cn(
                          'inline-flex items-center gap-2 px-2.5 h-8 rounded-full text-[12px] font-medium transition-all border',
                          on
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-900/10 hover:border-slate-900/30',
                          !canEdit && 'cursor-not-allowed opacity-70'
                        )}
                      >
                        <Avatar name={m.name} size={18} className="!ring-0" />
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Subtasks */}
              <section className="px-6 py-5 border-b border-slate-900/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">Subtasks</p>
                  {task.subtasks?.length ? (
                    <span className="text-[11px] text-slate-500">
                      {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} done
                    </span>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  {(task.subtasks || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <button
                        onClick={() => toggleSubtask(i)}
                        disabled={!canEdit}
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0',
                          s.done ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 hover:border-slate-500'
                        )}
                      >
                        {s.done && <Check className="w-3 h-3" strokeWidth={2.5} />}
                      </button>
                      <span className={cn('text-[13px] flex-1', s.done ? 'line-through text-slate-400' : 'text-slate-700')}>
                        {s.title}
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => removeSubtask(i)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {canEdit && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                      placeholder="Add a subtask and press Enter"
                      className="flex-1 h-9 px-3 rounded-md bg-white border border-slate-900/[0.08] text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60"
                    />
                    <button onClick={addSubtask} className="btn-sm bg-slate-900 text-white hover:bg-slate-800">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                )}
              </section>

              {/* Comments */}
              <section className="px-6 py-5">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">
                  Comments {comments.length > 0 && <span className="text-slate-400">({comments.length})</span>}
                </p>

                {loading ? (
                  <p className="text-[12.5px] text-slate-500">Loading…</p>
                ) : comments.length === 0 ? (
                  <p className="text-[12.5px] text-slate-500">No comments yet. Be the first to chime in.</p>
                ) : (
                  <ul className="space-y-4">
                    {comments.map((c) => (
                      <li key={c._id} className="flex gap-3">
                        <Avatar name={c.author?.name} size={32} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-slate-950">{c.author?.name}</span>
                            <span className="text-[10.5px] uppercase tracking-wider text-slate-400">{c.author?.role}</span>
                            <span className="text-[11px] text-slate-400">· {timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Footer actions */}
            <footer className="border-t border-slate-900/[0.06] bg-white">
              <div className="px-6 py-3 flex gap-2">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isClient ? 'Leave feedback for the team…' : 'Write a comment…'}
                  className="flex-1 rounded-md bg-white border border-slate-900/[0.08] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 resize-none"
                />
                <button onClick={send} disabled={sending || !newComment.trim()} className="btn-primary h-10 shrink-0">
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>

              <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/[0.06] bg-slate-50/60">
                <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
                </div>
                <div className="flex items-center gap-2">
                  {isClient && task.status === 'done' && !task.clientApproved && (
                    <button onClick={approve} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-emerald-600 text-white text-[13px] font-medium hover:bg-emerald-700">
                      <CheckCircle2 className="w-4 h-4" /> Approve completion
                    </button>
                  )}
                  {task.clientApproved && (
                    <span className="inline-flex items-center gap-1 text-[12px] text-emerald-700 font-medium">
                      <Shield className="w-3.5 h-3.5" /> Approved {timeAgo(task.clientApprovedAt)}
                    </span>
                  )}
                  {canDelete && (
                    <button onClick={del} className="inline-flex items-center gap-1 h-9 px-3 rounded-md text-rose-600 text-[13px] font-medium hover:bg-rose-50">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
