'use client';

import Link from 'next/link';
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/components/app-providers';
import { WigopeLogo } from '@/components/wigope-logo';

export function AppShell({ children }: { children: React.ReactNode; title?: string }) {
  const { user, signOut } = useAuth();
  const displayName = user?.name || (user?.mobile ? `+91 ${user.mobile.slice(-10)}` : 'Wigope User');

  return (
    <div className="min-h-screen bg-[#f7f4f2] text-[#1f1630]">
      <header className="bg-[#17172f] text-white">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-4">
            <span className="rounded-2xl bg-white px-3 py-2 shadow-sm">
              <WigopeLogo />
            </span>
            <span className="text-2xl font-black tracking-[-0.03em]">Wigope Recharge</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-black sm:flex">
              <UserRound className="h-4 w-4" />
              {displayName}
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef635c] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-wigope-orange"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
