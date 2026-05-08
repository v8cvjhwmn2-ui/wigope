'use client';

import { LogOut, Mail, ShieldCheck, Smartphone, UserRound } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/app-providers';

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <AppShell title="Profile">
      <div className="space-y-5">
        <Card className="bg-gradient-to-br from-navy-900 to-wigope-orange text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/14">
              <UserRound className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black">{user?.name || 'Wigope user'}</p>
              <p className="mt-1 text-sm font-semibold text-white/75">{user?.referralCode || 'Referral code pending'}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <Info icon={<Smartphone />} label="Mobile" value={user?.mobile || '-'} />
          <Info icon={<Mail />} label="Email" value={user?.email || 'Not added'} />
          <Info icon={<ShieldCheck />} label="Account role" value={user?.role || 'user'} />
        </Card>

        <Card>
          <h2 className="text-xl font-black">Security</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Your session is protected with access and refresh tokens from Wigope production API.
          </p>
        </Card>

        <Button variant="secondary" className="h-14 w-full rounded-3xl text-red-600" onClick={signOut}>
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </AppShell>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-wigope-orange">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
        <p className="font-black">{value}</p>
      </div>
    </div>
  );
}
