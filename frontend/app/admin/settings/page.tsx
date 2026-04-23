'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Topbar from '@/components/dashboard/Topbar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function AdminSettingsPage() {
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user?._id) return;
    setSaving(true);
    try {
      const payload: any = { name };
      if (password) payload.password = password;
      await api.patch(`/users/${user._id}`, payload);
      await refresh();
      toast.success('Settings saved');
      setPassword('');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your account." />
      <div className="p-6 lg:p-8 max-w-xl">
        <div className="card-flat p-6 space-y-5">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-950">Account</h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5">Your email is {user?.email} (can't be changed).</p>
          </div>

          <div className="space-y-1.5">
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="label">New password (leave blank to keep current)</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={saving} className="btn-primary h-10">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
