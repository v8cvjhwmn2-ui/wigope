'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gift, Plus, RefreshCcw, ShieldCheck, Zap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAsync } from '@/hooks/use-async';
import { walletService } from '@/services/wallet';
import { transactionService } from '@/services/transactions';

const services = [
  { label: 'Mobile Recharge', icon: '/assets/services/prepaid_recharges.png', href: '/recharge?service=mobile', badge: '3.8% off' },
  { label: 'DTH Recharge', icon: '/assets/services/dth_d2h_recharges.png', href: '/recharge?service=dth', badge: '4.1% off' },
  { label: 'Electricity', icon: '/assets/services/electricity_payments.png', href: '/recharge?service=electricity', badge: 'Bills' },
  { label: 'FASTag', icon: '/assets/services/fastag_recharges.png', href: '/recharge?service=fastag', badge: '2% off' }
];

const brands = [
  ['Flipkart', '/assets/brands/voucher_flipkart_new.png'],
  ['Amazon', '/assets/brands/voucher_amazon_new.png'],
  ['Myntra', '/assets/brands/voucher_myntra_new.png'],
  ["Domino's", '/assets/brands/voucher_dominos_new.png'],
  ['Swiggy', '/assets/brands/voucher_swiggy_new.png'],
  ['Zomato', '/assets/brands/voucher_zomato_new.png'],
  ['MakeMyTrip', '/assets/brands/makemytrip_tile.png'],
  ['See All', '/assets/brands/see_all_tile.png']
];

export default function DashboardPage() {
  const wallet = useAsync(() => walletService.summary(), []);
  const txns = useAsync(() => transactionService.list(), []);

  return (
    <AppShell>
      <div className="space-y-5">
        <Card className="overflow-hidden bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-navy-800">Available Balance</p>
              {wallet.loading ? (
                <Skeleton className="mt-4 h-14 w-36" />
              ) : wallet.error ? (
                <button className="mt-4 text-sm font-black text-red-600" onClick={wallet.reload}>
                  Refresh balance
                </button>
              ) : (
                <p className="mt-3 text-6xl font-black tracking-[-0.08em]">₹{wallet.data?.wallet.balance ?? 0}</p>
              )}
            </div>
            <Link href="/wallet">
              <Button className="rounded-full">
                <Plus className="h-5 w-5" />
                Add
              </Button>
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-600">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Secure wallet
            <span>·</span>
            <RefreshCcw className="h-4 w-4 text-wigope-orange" />
            Auto refresh
          </div>
        </Card>

        <Card className="bg-navy-900 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-wigope-orange">
              <Gift className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black">Welcome bonus · upto ₹200</h2>
              <p className="mt-1 text-sm font-semibold text-slate-300">Cashback on your first successful recharge.</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-4 gap-3">
            {services.map((item) => (
              <Link key={item.label} href={item.href} className="text-center">
                <div className="relative mx-auto h-16 w-16 rounded-2xl bg-orange-50 p-1">
                  <Image src={item.icon} alt="" fill className="object-contain p-1" />
                  <span className="absolute -right-2 -top-2 rounded-full bg-wigope-orange px-2 py-0.5 text-[10px] font-black text-white">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-2 text-xs font-black leading-tight text-navy-900">{item.label}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Gift & Voucher Deals</h2>
            <Link href="/rewards" className="rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-wigope-orange">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-x-4 gap-y-5">
            {brands.map(([name, src]) => (
              <Link href="/rewards" key={name} className="text-center">
                <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-[22px] bg-slate-100">
                  <Image src={src} alt={name} fill className="object-cover" />
                </div>
                <p className="mt-2 text-xs font-black">{name}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Recent activity</h2>
            <Link href="/transactions" className="text-sm font-black text-wigope-orange">
              See all
            </Link>
          </div>
          {txns.loading ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : txns.error ? (
            <div className="mt-4">
              <ErrorState message="Transactions could not be loaded." onRetry={txns.reload} />
            </div>
          ) : txns.data?.transactions.length ? (
            <div className="mt-4 space-y-3">
              {txns.data.transactions.slice(0, 3).map((txn) => (
                <div key={txn.orderId ?? txn.id} className="flex items-center gap-3 rounded-2xl border border-wigope-line p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{txn.operatorName || txn.operator || txn.service || 'Recharge'}</p>
                    <p className="text-xs font-bold uppercase text-slate-500">{txn.status}</p>
                  </div>
                  <p className="font-black">₹{txn.amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No activity yet" body="Your successful recharges and wallet updates will appear here." />
            </div>
          )}
        </Card>

        <Link href="/rewards" className="flex items-center justify-between rounded-[28px] bg-white p-5 shadow-card">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-wigope-orange">Earn rewards</p>
            <h2 className="mt-1 text-xl font-black">Open Wigope Rewards</h2>
          </div>
          <ArrowRight className="h-6 w-6 text-wigope-orange" />
        </Link>
      </div>
    </AppShell>
  );
}
