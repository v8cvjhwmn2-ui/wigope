'use client';

import { BellRing, CheckCheck } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAsync } from '@/hooks/use-async';
import { notificationService } from '@/services/notifications';

export default function NotificationsPage() {
  const notifications = useAsync(() => notificationService.list(), []);

  async function markRead() {
    await notificationService.markAllRead();
    await notifications.reload();
  }

  return (
    <AppShell title="Notifications">
      <div className="space-y-5">
        <Button variant="secondary" className="w-full" onClick={markRead}>
          <CheckCheck className="h-5 w-5" />
          Mark all as read
        </Button>

        {notifications.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : notifications.error ? (
          <ErrorState message={notifications.error} onRetry={notifications.reload} />
        ) : notifications.data?.notifications.length ? (
          <div className="space-y-3">
            {notifications.data.notifications.map((item) => (
              <Card key={item.id ?? item.createdAt} className="flex gap-3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-wigope-orange">
                  <BellRing className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{item.title}</p>
                  {item.body ? <p className="mt-1 text-sm font-semibold text-slate-500">{item.body}</p> : null}
                  <p className="mt-2 text-xs font-bold uppercase text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Now'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No notifications" body="Recharge updates, cashback, and account alerts will show here." />
        )}
      </div>
    </AppShell>
  );
}
