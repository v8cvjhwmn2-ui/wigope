'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, RefreshCw, SlidersHorizontal, Zap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAsync } from '@/hooks/use-async';
import { transactionService } from '@/services/transactions';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' }
];

export default function TransactionsPage() {
  const [status, setStatus] = useState('all');
  const txns = useAsync(() => transactionService.list(status), [status]);
  const totals = useMemo(() => {
    const rows = txns.data?.transactions ?? [];
    return rows.reduce(
      (acc, item) => {
        if (item.status === 'success') acc.spent += Number(item.amount ?? 0);
        return acc;
      },
      { spent: 0 }
    );
  }, [txns.data]);

  return (
    <AppShell title="Transactions">
      <div className="space-y-5">
        <Card className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className={`h-11 rounded-2xl border text-sm font-black ${
                  status === tab.value
                    ? 'border-wigope-orange bg-wigope-orange text-white'
                    : 'border-wigope-line bg-white text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-black">
            <button className="rounded-2xl border border-wigope-line py-2 text-blue-600">
              <RefreshCw className="mx-auto mb-1 h-4 w-4" />
              Recent
            </button>
            <button className="rounded-2xl border border-wigope-line py-2">
              <CalendarDays className="mx-auto mb-1 h-4 w-4" />
              Today
            </button>
            <button className="rounded-2xl border border-wigope-line py-2">
              <SlidersHorizontal className="mx-auto mb-1 h-4 w-4" />
              Filter
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-3xl bg-blue-50 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-wigope-orange text-white">
              <ArrowUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-500">Total spent</p>
              <p className="text-lg font-black">₹{totals.spent}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-3xl bg-emerald-50 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <ArrowDown className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-500">Cashback</p>
              <p className="text-lg font-black">₹0</p>
            </div>
          </div>
        </div>

        {txns.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : txns.error ? (
          <ErrorState message={txns.error} onRetry={txns.reload} />
        ) : txns.data?.transactions.length ? (
          <div className="space-y-3">
            {txns.data.transactions.map((txn) => (
              <Card key={txn.id ?? txn.orderId} className="flex items-center gap-3 p-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-3xl ${
                    txn.status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                  }`}
                >
                  <Zap className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-black">{txn.operatorName || txn.operator || txn.service || txn.type}</p>
                  <p className="text-sm font-bold uppercase text-slate-500">
                    {new Date(txn.createdAt || txn.initiatedAt || Date.now()).toLocaleString()} · {txn.status}
                  </p>
                </div>
                <p className="text-lg font-black">₹{txn.amount}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No transactions found" body="Your live recharge, wallet, and reward transactions will appear here." />
        )}

        <Button variant="secondary" className="w-full" onClick={txns.reload}>
          Refresh
        </Button>
      </div>
    </AppShell>
  );
}
