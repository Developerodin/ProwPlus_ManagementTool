'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Role, dashboardPathFor } from '@/lib/auth';

export default function RoleGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      let u = user;
      if (!u) u = await refresh();
      if (!alive) return;
      if (!u) {
        router.replace('/login');
        return;
      }
      if (u.role !== role) {
        router.replace(dashboardPathFor(u.role));
        return;
      }
      setReady(true);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Loading your workspace…
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
