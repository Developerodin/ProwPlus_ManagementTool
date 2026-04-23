'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/Avatar';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const TYPES = ['task', 'bug', 'feature', 'improvement'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function NewTaskModal({
  projectId, teamOptions, open, onClose, onCreated,
}: {
  projectId: string;
  teamOptions: { _id: string; name: string; designation?: string }[];
  open: boolean;
  onClose: () => void;
  onCreated: (t: any) => void;
}) {
  const [values, setValues] = useState({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    dueDate: '',
    assignedTo: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => setValues((s) => ({
    ...s,
    assignedTo: s.assignedTo.includes(id) ? s.assignedTo.filter((x) => x !== id) : [...s.assignedTo, id],
  }));

  const submit = async () => {
    if (!values.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const { task } = await api.post<{ task: any }>(`/projects/${projectId}/tasks`, values);
      toast.success('Task created');
      onCreated(task);
      setValues({ title: '', description: '', type: 'task', priority: 'medium', dueDate: '', assignedTo: [] });
      onClose();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New task"
      subtitle="Create a task, bug report, or feature request."
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary h-9">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-primary h-9">
            {loading ? 'Creating…' : 'Create task'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="label">Title</label>
          <input
            className="input"
            autoFocus
            value={values.title}
            onChange={(e) => setValues((s) => ({ ...s, title: e.target.value }))}
            placeholder="Short, specific summary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="label">Description</label>
          <textarea
            rows={4}
            className="w-full rounded-md bg-white border border-slate-900/[0.08] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 resize-y"
            value={values.description}
            onChange={(e) => setValues((s) => ({ ...s, description: e.target.value }))}
            placeholder="Acceptance criteria, steps to reproduce, links…"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="label">Type</label>
            <select className="input" value={values.type} onChange={(e) => setValues((s) => ({ ...s, type: e.target.value }))}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label">Priority</label>
            <select className="input" value={values.priority} onChange={(e) => setValues((s) => ({ ...s, priority: e.target.value }))}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label">Due date</label>
            <input
              type="date"
              className="input"
              value={values.dueDate}
              onChange={(e) => setValues((s) => ({ ...s, dueDate: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="label block mb-1.5">Assign to</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {teamOptions.length === 0 && (
              <p className="text-[12.5px] text-slate-500">No team members assigned to this project yet.</p>
            )}
            {teamOptions.map((m) => {
              const on = values.assignedTo.includes(m._id);
              return (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => toggle(m._id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-2.5 h-8 rounded-full text-[12px] font-medium transition-all border',
                    on ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-900/10 hover:border-slate-900/30'
                  )}
                >
                  <Avatar name={m.name} size={18} />
                  {m.name}
                  {on && <Check className="w-3 h-3" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
