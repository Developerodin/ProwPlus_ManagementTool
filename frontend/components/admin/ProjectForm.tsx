'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import TagInput from '@/components/ui/TagInput';
import Avatar from '@/components/Avatar';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface UserLite { _id: string; name: string; email: string; company?: string; designation?: string }

export interface ProjectFormValues {
  _id?: string;
  name: string;
  description?: string;
  techStack: string[];
  tags: string[];
  client: string;
  teamMembers: string[];
  startDate?: string;
  deadline?: string;
  status?: string;
  priority?: string;
  budget?: number;
}

const STATUSES = ['planning', 'in-progress', 'testing', 'completed', 'on-hold'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const toInput = (d?: string | Date) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function ProjectForm({
  initial, onSaved, onCancel,
}: {
  initial?: Partial<ProjectFormValues>;
  onSaved: (p: any) => void;
  onCancel?: () => void;
}) {
  const isEdit = !!initial?._id;
  const [values, setValues] = useState<ProjectFormValues>({
    name: initial?.name || '',
    description: initial?.description || '',
    techStack: initial?.techStack || [],
    tags: initial?.tags || [],
    client: (initial?.client as any) || '',
    teamMembers: initial?.teamMembers || [],
    startDate: toInput(initial?.startDate as any),
    deadline: toInput(initial?.deadline as any),
    status: initial?.status || 'planning',
    priority: initial?.priority || 'medium',
    budget: initial?.budget || 0,
  });
  const [clients, setClients] = useState<UserLite[]>([]);
  const [team, setTeam] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, t] = await Promise.all([
        api.get<{ users: UserLite[] }>('/users?role=client'),
        api.get<{ users: UserLite[] }>('/users?role=team'),
      ]);
      setClients(c.users);
      setTeam(t.users);
    })().catch((e) => toast.error(e.message));
  }, []);

  const set = <K extends keyof ProjectFormValues>(k: K, v: ProjectFormValues[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const toggleMember = (id: string) => {
    setValues((s) => ({
      ...s,
      teamMembers: s.teamMembers.includes(id)
        ? s.teamMembers.filter((x) => x !== id)
        : [...s.teamMembers, id],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) return toast.error('Project name required');
    if (!values.client) return toast.error('Pick a client');
    setLoading(true);
    try {
      const payload = { ...values, budget: Number(values.budget || 0) };
      const res = isEdit
        ? await api.patch<{ project: any }>(`/projects/${initial!._id}`, payload)
        : await api.post<{ project: any }>('/projects', payload);
      toast.success(isEdit ? 'Project updated' : 'Project created');
      onSaved(res.project);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="label">Project name</label>
          <input
            className="input"
            required
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Acme Growth Dashboard"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="label">Description</label>
          <textarea
            rows={3}
            className="w-full rounded-md bg-white border border-slate-900/[0.08] px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all resize-y"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What are we building, for whom, and why?"
          />
        </div>

        <div className="space-y-1.5">
          <label className="label">Client</label>
          <select
            className="input"
            required
            value={values.client}
            onChange={(e) => set('client', e.target.value)}
          >
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}{c.company ? ` — ${c.company}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="label">Status</label>
            <select
              className="input"
              value={values.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label">Priority</label>
            <select
              className="input"
              value={values.priority}
              onChange={(e) => set('priority', e.target.value)}
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="label">Start date</label>
          <input
            type="date"
            className="input"
            value={values.startDate || ''}
            onChange={(e) => set('startDate', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="label">Deadline</label>
          <input
            type="date"
            className="input"
            value={values.deadline || ''}
            onChange={(e) => set('deadline', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="label">Budget (optional)</label>
          <input
            type="number"
            min={0}
            className="input"
            value={values.budget || 0}
            onChange={(e) => set('budget', Number(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="label">Tech stack</label>
          <TagInput value={values.techStack} onChange={(v) => set('techStack', v)} placeholder="Next.js, MongoDB…" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="label">Tags</label>
          <TagInput value={values.tags} onChange={(v) => set('tags', v)} placeholder="internal, Q2, pilot…" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Team members</label>
          <span className="text-[11.5px] text-slate-500">{values.teamMembers.length} selected</span>
        </div>
        {team.length === 0 ? (
          <p className="text-[12.5px] text-slate-500 py-3">Add team members first on the Team page.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto rounded-md border border-slate-900/[0.06] p-2 bg-slate-50/40">
            {team.map((m) => {
              const selected = values.teamMembers.includes(m._id);
              return (
                <button
                  type="button"
                  key={m._id}
                  onClick={() => toggleMember(m._id)}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-md text-left transition-all',
                    selected ? 'bg-white border border-slate-900 shadow-hair' : 'bg-white border border-slate-900/[0.06] hover:border-slate-900/20'
                  )}
                >
                  <Avatar name={m.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-950 truncate">{m.name}</p>
                    <p className="text-[11.5px] text-slate-500 truncate">{m.designation || m.email}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900/[0.06]">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary h-10">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary h-10">
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  );
}
