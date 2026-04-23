'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Users, Pencil, Power, Trash2, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import Topbar from '@/components/dashboard/Topbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import UserForm from '@/components/admin/UserForm';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface TeamUser {
  _id: string;
  name: string;
  email: string;
  designation?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export default function AdminTeamPage() {
  const [list, setList] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const [confirm, setConfirm] = useState<TeamUser | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { users } = await api.get<{ users: TeamUser[] }>('/users?role=team');
      setList(users);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((u) =>
      [u.name, u.email, u.designation].filter(Boolean).some((v) => v!.toLowerCase().includes(s))
    );
  }, [q, list]);

  const onCreated = (u: TeamUser) => {
    setList((prev) => [u, ...prev]);
    setCreateOpen(false);
  };
  const onEdited = (u: TeamUser) => {
    setList((prev) => prev.map((x) => (x._id === u._id ? u : x)));
    setEditing(null);
  };
  const onDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await api.del(`/users/${confirm._id}`);
      setList((prev) => prev.filter((x) => x._id !== confirm._id));
      toast.success('Team member removed');
      setConfirm(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const toggleActive = async (u: TeamUser) => {
    try {
      const { user } = await api.patch<{ user: TeamUser }>(`/users/${u._id}`, { isActive: !u.isActive });
      setList((prev) => prev.map((x) => (x._id === u._id ? user : x)));
      toast.success(user.isActive ? 'Re-activated' : 'Deactivated');
    } catch (e: any) { toast.error(e.message); }
  };

  const active = list.filter((u) => u.isActive).length;

  return (
    <>
      <Topbar
        title="Team"
        subtitle={`${list.length} member${list.length === 1 ? '' : 's'} · ${active} active`}
        right={
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" strokeWidth={2} /> New member
          </button>
        }
      />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email or role…"
              className="w-full h-10 pl-9 pr-3 rounded-md bg-white border border-slate-900/[0.08] text-[13.5px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60"
            />
          </div>
        </div>

        {loading ? (
          <div className="card-flat px-6 py-16 text-center text-[13px] text-slate-500">Loading team…</div>
        ) : filtered.length === 0 ? (
          <div className="card-flat">
            <EmptyState
              icon={Users}
              title={list.length === 0 ? 'No team members yet' : 'No matches'}
              copy={list.length === 0
                ? 'Add your first team member — they can sign in immediately with the credentials you set.'
                : 'Try a different search query.'}
              cta={list.length === 0 && (
                <button onClick={() => setCreateOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add team member
                </button>
              )}
            />
          </div>
        ) : (
          <div className="card-flat overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 bg-slate-50/60 border-b border-slate-900/[0.06]">
                    <th className="py-3 px-5 font-semibold">Member</th>
                    <th className="py-3 px-5 font-semibold">Contact</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold">Added</th>
                    <th className="py-3 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/[0.06]">
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.02 }}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size={36} />
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-medium text-slate-950 truncate">{u.name}</p>
                            <p className="text-[12px] text-slate-500 truncate">{u.designation || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        {u.isActive
                          ? <Badge tone="emerald">● Active</Badge>
                          : <Badge tone="slate">○ Inactive</Badge>}
                      </td>
                      <td className="py-3 px-5 text-[12.5px] text-slate-600">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <IconBtn onClick={() => setEditing(u)} icon={Pencil} label="Edit" />
                          <IconBtn
                            onClick={() => toggleActive(u)}
                            icon={Power}
                            label={u.isActive ? 'Deactivate' : 'Activate'}
                            tone={u.isActive ? 'default' : 'success'}
                          />
                          <IconBtn onClick={() => setConfirm(u)} icon={Trash2} label="Delete" tone="danger" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add team member"
        subtitle="They'll receive access to assigned projects after you create the account."
        size="lg"
      >
        <UserForm role="team" onSaved={onCreated} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit team member"
        subtitle={editing?.email}
        size="lg"
      >
        {editing && (
          <UserForm
            role="team"
            initial={editing}
            onSaved={onEdited}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        title="Delete team member?"
        message={`${confirm?.name} will lose access immediately. This cannot be undone. Existing assignments remain on projects but references will resolve to "Unknown".`}
        confirmLabel="Delete"
        tone="danger"
        loading={busy}
      />
    </>
  );
}

function IconBtn({
  icon: Icon, label, onClick, tone = 'default',
}: {
  icon: any;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger' | 'success';
}) {
  const toneCls = tone === 'danger'
    ? 'hover:bg-rose-50 hover:text-rose-600'
    : tone === 'success'
    ? 'hover:bg-emerald-50 hover:text-emerald-700'
    : 'hover:bg-slate-100 hover:text-slate-900';
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-8 h-8 rounded-md text-slate-500 flex items-center justify-center transition-colors ${toneCls}`}
    >
      <Icon className="w-4 h-4" strokeWidth={1.75} />
    </button>
  );
}
