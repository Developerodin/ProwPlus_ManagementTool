'use client';

import RoleGuard from '@/components/dashboard/RoleGuard';
import Sidebar from '@/components/dashboard/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="admin">
      <div className="min-h-screen bg-[#FAFAFA] flex">
        <Sidebar role="admin" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </RoleGuard>
  );
}
