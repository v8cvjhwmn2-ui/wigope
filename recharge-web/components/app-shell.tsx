'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Gift, History, Home, UserRound, WalletCards } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/components/app-providers';
import { WigopeLogo } from '@/components/wigope-logo';

const nav = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/recharge', label: 'Recharge', icon: WalletCards },
  { href: '/rewards', label: 'Rewards', icon: Gift, featured: true },
  { href: '/transactions', label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: UserRound }
];

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[#f8fafc] pb-24 text-navy-900 shadow-2xl shadow-slate-200 md:my-4 md:rounded-[34px] md:border md:border-wigope-line">
      <header className="sticky top-0 z-30 border-b border-wigope-line bg-white/92 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <WigopeLogo />
          <Link
            href="/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-wigope-line bg-white text-navy-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-wigope-orange" />
          </Link>
        </div>
        {title ? <h1 className="mt-4 text-2xl font-black tracking-[-0.03em]">{title}</h1> : null}
        {!title && user ? (
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500">Good day</p>
            <p className="text-2xl font-black tracking-[-0.03em]">{user.name || `+91 ${user.mobile?.slice(-10)}`}</p>
          </div>
        ) : null}
      </header>
      <main className="px-4 py-5">{children}</main>
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-wigope-line bg-white px-3 py-2 shadow-dock md:bottom-4 md:rounded-b-[34px]">
        <div className="grid grid-cols-5 items-end gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-extrabold transition',
                  active && !item.featured && 'bg-blue-50 text-blue-600',
                  !active && !item.featured && 'text-slate-500',
                  item.featured &&
                    'mx-auto -mt-8 h-16 w-16 rounded-[24px] bg-wigope-orange text-white shadow-xl shadow-orange-500/25'
                )}
              >
                <Icon className={clsx(item.featured ? 'h-7 w-7' : 'h-5 w-5')} />
                {!item.featured ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
