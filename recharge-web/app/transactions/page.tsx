'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, Download, RefreshCw, SlidersHorizontal, Zap } from 'lucide-react';
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
  const rows = useMemo(() => txns.data?.transactions ?? [], [txns.data]);
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, item) => {
        if (item.status === 'success') acc.spent += Number(item.amount ?? 0);
        return acc;
      },
      { spent: 0 }
    );
  }, [rows]);

  return (
    <AppShell title="Transactions">
      <div className="space-y-5">
        <Card className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className={`h-12 rounded-2xl border text-sm font-black transition ${
                  status === tab.value
                    ? 'border-wigope-orange bg-wigope-orange text-white shadow-lg shadow-orange-500/20'
                    : 'border-wigope-line bg-white text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm font-black">
            <button className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-wigope-line bg-white text-blue-600">
              <RefreshCw className="h-4 w-4" />
              Recent
            </button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-wigope-line bg-white">
              <CalendarDays className="h-4 w-4" />
              Today
            </button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-wigope-line bg-white">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Metric icon={<ArrowUp />} label="Total spent" value={`₹${totals.spent}`} tone="orange" />
          <Metric icon={<ArrowDown />} label="Cashback" value="₹0" tone="green" />
        </div>

        {txns.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : txns.error ? (
          <ErrorState message={txns.error} onRetry={txns.reload} />
        ) : rows.length ? (
          <div className="space-y-3">
            {rows.map((txn) => (
              <Card key={txn.id ?? txn.orderId} className="flex items-center gap-3 p-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-3xl ${
                    txn.status === 'success'
                      ? 'bg-emerald-50 text-emerald-500'
                      : txn.status === 'pending'
                        ? 'bg-orange-50 text-wigope-orange'
                        : 'bg-red-50 text-red-500'
                  }`}
                >
                  <Zap className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-black">{txn.operatorName || txn.operator || txn.service || txn.type || 'Transaction'}</p>
                  <p className="text-sm font-bold uppercase text-slate-500">
                    {new Date(txn.createdAt || txn.initiatedAt || Date.now()).toLocaleString()} · {txn.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black">₹{txn.amount}</p>
                  <button className="mt-1 inline-flex items-center gap-1 text-xs font-black text-wigope-orange">
                    <Download className="h-3 w-3" />
                    Receipt
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No transactions found" body="Recharge, wallet, and rewards transactions will appear here as soon as they happen." />
        )}

        <Button variant="secondary" className="w-full" onClick={txns.reload}>
          <RefreshCw className="h-5 w-5" />
          Refresh live status
        </Button>
      </div>
    </AppShell>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'orange' | 'green' }) {
  return (
    <div className={`flex items-center gap-3 rounded-3xl p-4 ${tone === 'orange' ? 'bg-orange-50' : 'bg-emerald-50'}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white ${tone === 'orange' ? 'bg-wigope-orange' : 'bg-emerald-500'}`}>
        {icon}
      </span>
      <div>
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <p className="text-lg font-black">{value}</p>
      </div>
    </div>
  );
}
