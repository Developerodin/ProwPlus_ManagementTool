'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, FolderKanban, CheckSquare, Activity, Settings, LogOut,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { useAuth, Role } from '@/lib/auth';
import { useRouter } from 'next/navigation';

type Item = { href: string; label: string; icon: any };

const NAVS: Record<Role, Item[]> = {
  admin: [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { href: '/admin/team', label: 'Team', icon: Users },
    { href: '/admin/clients', label: 'Clients', icon: Building2 },
    { href: '/admin/activity', label: 'Activity', icon: Activity },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ],
  team: [
    { href: '/team/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/team/projects', label: 'My Projects', icon: FolderKanban },
    { href: '/team/tasks', label: 'My Tasks', icon: CheckSquare },
  ],
  client: [
    { href: '/client/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/client/projects', label: 'My Projects', icon: FolderKanban },
  ],
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const items = NAVS[role];

  const onLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-900/[0.06] bg-white">
      <div className="h-16 px-6 flex items-center border-b border-slate-900/[0.06]">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {role === 'admin' ? 'Workspace' : role === 'team' ? 'Team' : 'Portal'}
        </p>
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'relative flex items-center gap-2.5 px-3 h-9 rounded-md text-[13.5px] font-medium transition-colors',
                active
                  ? 'bg-slate-900 text-white shadow-hair'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="w-[17px] h-[17px]" strokeWidth={active ? 2 : 1.75} />
              {it.label}
              {active && (
                <motion.span
                  layoutId="nav-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-900/[0.06] p-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[12.5px] font-semibold text-slate-700">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-slate-900 truncate">{user?.name}</p>
            <p className="text-[11.5px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-1 w-full flex items-center gap-2.5 px-3 h-9 rounded-md text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-[17px] h-[17px]" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
