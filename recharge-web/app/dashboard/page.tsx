'use client';

import Link from 'next/link';
import {
  CreditCard,
  Gift,
  IndianRupee,
  MessageCircle,
  Percent,
  Smartphone,
  Tv,
  WalletCards,
  Zap
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useAsync } from '@/hooks/use-async';
import { walletService } from '@/services/wallet';
import { transactionService } from '@/services/transactions';

const actions = [
  { label: 'Mobile Recharge', icon: Smartphone, href: '/recharge?service=mobile' },
  { label: 'DTH Recharge', icon: Tv, href: '/recharge?service=dth' },
  { label: 'Gift Cards', icon: Gift, href: '/rewards' },
  { label: 'Add Money', icon: WalletCards, href: '/wallet' },
  { label: 'Margin Rates', icon: Percent, href: '/recharge?view=margin' },
  { label: 'Refer & Earn', icon: IndianRupee, href: '/profile' }
];

export default function DashboardPage() {
  const wallet = useAsync(() => walletService.summary(), []);
  const txns = useAsync(() => transactionService.list(), []);
  const balance = wallet.data?.wallet.balance ?? 0;
  const transactions = txns.data?.transactions ?? [];

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {actions.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex min-h-16 items-center justify-center gap-3 rounded-lg bg-[#294cd4] px-4 py-4 text-base font-black text-white transition hover:bg-wigope-orange"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black tracking-[-0.03em] text-[#1f1630]">Facing any issue?</h1>
          <p className="mt-2 text-lg font-semibold text-[#3d314f]">We are available for recharge, wallet and voucher support.</p>
          <a
            href="https://wa.me/919568654684"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#31b65f] px-5 py-4 text-base font-black text-white"
          >
            <MessageCircle className="h-5 w-5" />
            Let&apos;s Connect on WhatsApp
          </a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-black tracking-[-0.03em] text-[#1f1630]">Dashboard Statistics</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <StatCard label="Available Balance" value={wallet.loading ? null : `₹${Number(balance).toFixed(2)}`} />
          <StatCard label="Total Commission Earned" value="₹0" />
          <StatCard label="Total Recharges This Month" value={transactions.length ? String(transactions.length) : '0'} />
          <StatCard label="Total Recharges All Time" value={transactions.length ? String(transactions.length) : '0'} />
        </div>
        {wallet.error ? (
          <div className="mt-4">
            <ErrorState message="Wallet details could not be loaded." onRetry={wallet.reload} />
          </div>
        ) : null}
      </section>

      <section className="mt-8 border-t border-slate-200 pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black tracking-[-0.03em] text-[#1f1630]">Recent Recharge History</h2>
          <Link href="/transactions" className="rounded-lg bg-[#17172f] px-4 py-2 text-sm font-black text-white">
            View transactions
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[72px_1fr_1fr_150px] bg-slate-50 text-sm font-black text-[#1f1630]">
            <div className="border-r border-slate-200 p-4">#</div>
            <div className="border-r border-slate-200 p-4">Operator Details</div>
            <div className="border-r border-slate-200 p-4">Order Details</div>
            <div className="p-4">Status</div>
          </div>
          {txns.loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : txns.error ? (
            <div className="p-5">
              <ErrorState message="Recharge history could not be loaded." onRetry={txns.reload} />
            </div>
          ) : transactions.length ? (
            <div>
              {transactions.slice(0, 6).map((txn, index) => (
                <div key={txn.orderId ?? txn.id ?? index} className="grid grid-cols-[72px_1fr_1fr_150px] border-t border-slate-200 text-sm font-semibold">
                  <div className="border-r border-slate-200 p-4">{index + 1}</div>
                  <div className="border-r border-slate-200 p-4">{txn.operatorName || txn.operator || txn.service || 'Recharge'}</div>
                  <div className="border-r border-slate-200 p-4">₹{txn.amount}</div>
                  <div className="p-4 font-black uppercase text-wigope-orange">{txn.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-base font-semibold text-[#3d314f]">No history available</div>
          )}
        </div>
      </section>

      <footer className="mt-14 rounded-t-2xl bg-[#17172f] px-6 py-10 text-white">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-black">WIGOPE TECHNOLOGIES PVT LTD</h3>
            <p className="mt-2 text-sm font-semibold text-slate-300">CIN: U63999UP2025PTC238367</p>
          </div>
          <FooterColumn title="Pages" items={['Home', 'Services', 'Support']} />
          <FooterColumn title="Important Links" items={['Privacy Policy', 'Terms & Conditions', 'Refund Policy']} />
          <FooterColumn title="Contact Details" items={['support@wigope.com', '+91 9568 654684']} />
        </div>
      </footer>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-black text-[#3d314f]">{label}</p>
      {value === null ? <Skeleton className="mt-3 h-9 w-24" /> : <p className="mt-2 text-3xl font-black text-[#1f1630]">{value}</p>}
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-base font-black">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
