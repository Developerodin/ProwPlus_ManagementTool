'use client';

import { useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Role } from '@/lib/auth';

export interface UserFormValues {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  designation?: string;
  company?: string;
  phone?: string;
  isActive?: boolean;
}

const genPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let s = '';
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

export default function UserForm({
  role, initial, onSaved, onCancel,
}: {
  role: Extract<Role, 'team' | 'client'>;
  initial?: UserFormValues;
  onSaved: (u: any) => void;
  onCancel?: () => void;
}) {
  const isEdit = !!initial?._id;
  const [values, setValues] = useState<UserFormValues>({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    designation: initial?.designation || '',
    company: initial?.company || '',
    phone: initial?.phone || '',
    isActive: initial?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof UserFormValues) => (v: any) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const payload: any = {
          name: values.name,
          designation: values.designation,
          company: values.company,
          phone: values.phone,
          isActive: values.isActive,
        };
        if (values.password) payload.password = values.password;
        const { user } = await api.patch<{ user: any }>(`/users/${initial!._id}`, payload);
        toast.success('Updated');
        onSaved(user);
      } else {
        if (!values.password) {
          toast.error('Set a password (or generate one)');
          setLoading(false);
          return;
        }
        const { user } = await api.post<{ user: any }>('/users', { ...values, role });
        toast.success(`${role === 'team' ? 'Team member' : 'Client'} created`);
        onSaved(user);
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="label">Full name</label>
          <input
            className="input"
            required
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
            placeholder={role === 'team' ? 'e.g. Ananya Sharma' : 'e.g. Rahul Mehta'}
          />
        </div>

        <div className="space-y-1.5">
          <label className="label">Email address</label>
          <input
            className="input"
            type="email"
            required
            disabled={isEdit}
            value={values.email}
            onChange={(e) => set('email')(e.target.value)}
            placeholder="person@company.com"
          />
          {isEdit && <p className="text-[11.5px] text-slate-400">Email can't be changed.</p>}
        </div>

        {role === 'team' ? (
          <div className="space-y-1.5">
            <label className="label">Designation</label>
            <input
              className="input"
              value={values.designation || ''}
              onChange={(e) => set('designation')(e.target.value)}
              placeholder="Senior Engineer"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="label">Company</label>
            <input
              className="input"
              value={values.company || ''}
              onChange={(e) => set('company')(e.target.value)}
              placeholder="Acme Inc."
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="label">Phone</label>
          <input
            className="input"
            value={values.phone || ''}
            onChange={(e) => set('phone')(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="label">{isEdit ? 'New password (leave blank to keep current)' : 'Password'}</label>
          <button
            type="button"
            onClick={() => {
              const pw = genPassword();
              set('password')(pw);
              navigator.clipboard?.writeText(pw);
              toast.success('Generated and copied');
            }}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate
          </button>
        </div>
        <div className="relative">
          <input
            className="input pr-10"
            type={showPw ? 'text' : 'password'}
            value={values.password || ''}
            onChange={(e) => set('password')(e.target.value)}
            placeholder={isEdit ? '••••••••' : 'At least 6 characters'}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100"
          >
            {showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
        {!isEdit && (
          <p className="text-[11.5px] text-slate-500">
            Share these credentials with the {role}. They can sign in at <span className="font-medium text-slate-700">/login</span>.
          </p>
        )}
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-[13px] text-slate-700">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            checked={!!values.isActive}
            onChange={(e) => set('isActive')(e.target.checked)}
          />
          Active — allow this account to sign in
        </label>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary h-10">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary h-10">
          {loading ? 'Saving…' : isEdit ? 'Save changes' : `Create ${role === 'team' ? 'team member' : 'client'}`}
        </button>
      </div>
    </form>
  );
}
