'use client';

import { useEffect, useState } from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';

export default function AdminActivityPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ activity: any[] }>('/projects/activity')
      .then((d) => setList(d.activity))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Activity" subtitle="Everything happening across your workspace." />
      <div className="p-6 lg:p-8">
        {loading ? (
          <div className="card-flat p-10 text-center text-[13px] text-slate-500">Loading…</div>
        ) : list.length === 0 ? (
          <div className="card-flat">
            <EmptyState icon={ActivityIcon} title="No activity yet" copy="As your team works, updates will show up here in real time." />
          </div>
        ) : (
          <div className="card-flat overflow-hidden">
            <ul className="divide-y divide-slate-900/[0.06]">
              {list.map((a) => (
                <li key={a._id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/70">
                  <Avatar name={a.user?.name} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-800 leading-snug">
                      <span className="font-medium text-slate-950">{a.user?.name}</span>{' '}
                      <span className="text-slate-600">{String(a.action).replace(/\./g, ' ')}</span>
                      {a.project?.name && <span className="text-slate-500"> · {a.project.name}</span>}
                    </p>
                    {a.details?.title && (
                      <p className="text-[12px] text-slate-500 mt-0.5 truncate">— {a.details.title}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
