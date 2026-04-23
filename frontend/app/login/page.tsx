'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Users, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

import Logo from '@/components/Logo';
import { useAuth, dashboardPathFor } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      router.push(dashboardPathFor(user.role));
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-slate-950 text-white p-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at 30% 40%, black 40%, transparent 75%)',
          }}
        />
        <div
          aria-hidden
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 60%)' }}
        />

        <div className="relative z-10">
          <Logo variant="dark" />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300 mb-5">
            <span className="w-6 h-px bg-indigo-300" /> Project Management
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.1]">
            One workspace for teams, clients, and every moving part.
          </h2>
          <p className="mt-5 text-[15px] text-slate-300 leading-relaxed">
            Track projects end-to-end. Assign tasks, log bugs, collect client sign-off — without
            the spreadsheet chaos.
          </p>

          <ul className="mt-10 space-y-4 text-[14px] text-slate-300">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-indigo-300" strokeWidth={1.75} />
              </div>
              Role-aware access — admin, team, and client all see the right things
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-300" strokeWidth={1.75} />
              </div>
              Client approvals, task threads, and real-time progress in one place
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-indigo-300" strokeWidth={1.75} />
              </div>
              Built for agencies juggling multiple clients and parallel builds
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          © {new Date().getFullYear()} prowplus · All rights reserved
        </p>
      </aside>

      {/* Form column */}
      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-10">
            <Logo />
          </div>

          <div className="eyebrow mb-5">
            <span className="w-6 h-px bg-indigo-600" /> Sign in
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">
            Welcome back.
          </h1>
          <p className="mt-2 text-[14px] text-slate-500">
            Use the credentials provided to you. Admins, team members, and clients all sign in here.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">Password</label>
                <span className="text-[11.5px] text-slate-400">Contact admin to reset</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full btn-primary h-11"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && (
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          <div className="divider my-10" />

          <p className="text-[12.5px] text-slate-500 leading-relaxed">
            Your login works based on the role your admin assigned. You'll land on the right
            dashboard automatically.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
