'use client';

import RoleGuard from '@/components/dashboard/RoleGuard';
import Sidebar from '@/components/dashboard/Sidebar';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="team">
      <div className="min-h-screen bg-[#FAFAFA] flex">
        <Sidebar role="team" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </RoleGuard>
  );
}
