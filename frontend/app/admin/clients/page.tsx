'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Building2, Pencil, Power, Trash2, Mail, Phone } from 'lucide-react';
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

interface ClientUser {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export default function AdminClientsPage() {
  const [list, setList] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ClientUser | null>(null);
  const [confirm, setConfirm] = useState<ClientUser | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { users } = await api.get<{ users: ClientUser[] }>('/users?role=client');
      setList(users);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((u) =>
      [u.name, u.email, u.company].filter(Boolean).some((v) => v!.toLowerCase().includes(s))
    );
  }, [q, list]);

  const onCreated = (u: ClientUser) => {
    setList((prev) => [u, ...prev]);
    setCreateOpen(false);
  };
  const onEdited = (u: ClientUser) => {
    setList((prev) => prev.map((x) => (x._id === u._id ? u : x)));
    setEditing(null);
  };
  const onDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await api.del(`/users/${confirm._id}`);
      setList((prev) => prev.filter((x) => x._id !== confirm._id));
      toast.success('Client removed');
      setConfirm(null);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  const toggleActive = async (u: ClientUser) => {
    try {
      const { user } = await api.patch<{ user: ClientUser }>(`/users/${u._id}`, { isActive: !u.isActive });
      setList((prev) => prev.map((x) => (x._id === u._id ? user : x)));
      toast.success(user.isActive ? 'Re-activated' : 'Deactivated');
    } catch (e: any) { toast.error(e.message); }
  };

  const active = list.filter((u) => u.isActive).length;

  return (
    <>
      <Topbar
        title="Clients"
        subtitle={`${list.length} client${list.length === 1 ? '' : 's'} · ${active} active`}
        right={
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" strokeWidth={2} /> New client
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
              placeholder="Search by name, company or email…"
              className="w-full h-10 pl-9 pr-3 rounded-md bg-white border border-slate-900/[0.08] text-[13.5px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60"
            />
          </div>
        </div>

        {loading ? (
          <div className="card-flat px-6 py-16 text-center text-[13px] text-slate-500">Loading clients…</div>
        ) : filtered.length === 0 ? (
          <div className="card-flat">
            <EmptyState
              icon={Building2}
              title={list.length === 0 ? 'No clients yet' : 'No matches'}
              copy={list.length === 0
                ? 'Create a client account so they can log in to their portal and review their projects.'
                : 'Try a different search query.'}
              cta={list.length === 0 && (
                <button onClick={() => setCreateOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add client
                </button>
              )}
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="card p-5 flex flex-col"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={u.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14.5px] font-semibold text-slate-950 truncate">{u.name}</p>
                      {u.isActive ? <Badge tone="emerald">Active</Badge> : <Badge tone="slate">Inactive</Badge>}
                    </div>
                    <p className="text-[12.5px] text-slate-500 truncate">{u.company || 'No company'}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[12.5px] text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> <span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2 text-[12.5px] text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-900/[0.06] mt-4">
                  <span className="text-[11.5px] text-slate-400">Added {formatDate(u.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(u)} title="Edit" className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors">
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                    <button onClick={() => toggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'} className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors">
                      <Power className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                    <button onClick={() => setConfirm(u)} title="Delete" className="w-8 h-8 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add client"
        subtitle="They'll receive their own portal to view projects and approve work."
        size="lg"
      >
        <UserForm role="client" onSaved={onCreated} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit client"
        subtitle={editing?.email}
        size="lg"
      >
        {editing && (
          <UserForm
            role="client"
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
        title="Delete client?"
        message={`${confirm?.name} will lose portal access immediately. Projects they're assigned to will need to be reassigned. This cannot be undone.`}
        confirmLabel="Delete client"
        tone="danger"
        loading={busy}
      />
    </>
  );
}
