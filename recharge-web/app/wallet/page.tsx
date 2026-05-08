'use client';

import Script from 'next/script';
import { Gift, Plus, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAsync } from '@/hooks/use-async';
import { walletService } from '@/services/wallet';
import { RAZORPAY_KEY_ID } from '@/lib/config';
import { userMessage } from '@/lib/errors';
import { useState } from 'react';

export default function WalletPage() {
  const wallet = useAsync(() => walletService.summary(), []);
  const ledger = useAsync(() => walletService.ledger(), []);
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function makePayment() {
    setLoading(true);
    setError('');
    try {
      const { order } = await walletService.createOrder(amount);
      if (!window.Razorpay) throw new Error('Razorpay checkout is still loading.');
      const key = order.keyId || RAZORPAY_KEY_ID;
      if (!key) throw new Error('Razorpay key is not configured.');
      const checkout = new window.Razorpay({
        key,
        amount: order.amountPaise ?? Math.round(order.amount * 100),
        currency: order.currency ?? 'INR',
        order_id: order.orderId || order.id,
        name: 'Wigope',
        description: 'Wallet topup',
        theme: { color: '#ff6b13' },
        handler: () => {
          void wallet.reload();
          void ledger.reload();
        }
      });
      checkout.open();
    } catch (err) {
      setError(userMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Wallet">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="space-y-5">
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-wigope-orange">Wallet Topup</p>
          <h2 className="mt-2 text-2xl font-black">Enter amount</h2>
          <div className="mt-4 rounded-3xl bg-white p-3 shadow-inner">
            <Input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, '')))}
              className="h-20 border-0 text-5xl font-black shadow-none focus:ring-0"
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Secure wallet payment
          </div>
        </Card>

        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
          {[100, 500, 1000, 2000, 5000].map((value) => (
            <button
              key={value}
              onClick={() => setAmount(value)}
              className={`h-12 min-w-24 rounded-full border-2 px-5 text-lg font-black ${
                amount === value ? 'border-wigope-orange bg-wigope-orange text-white' : 'border-blue-500 bg-white text-blue-600'
              }`}
            >
              ₹{value}
            </button>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-wigope-orange to-blue-700 text-white">
          <h2 className="text-3xl font-black">Add More & Earn More</h2>
          <p className="mt-2 text-lg font-semibold text-white/85">Offer applied on eligible wallet topups.</p>
          <button className="mt-5 rounded-full bg-white px-6 py-3 font-black text-navy-900" onClick={() => setAmount(2000)}>
            Add ₹2000
          </button>
        </Card>

        {error ? <ErrorState message={error} /> : null}

        <Button className="h-16 w-full rounded-3xl text-lg font-black" loading={loading} disabled={amount < 1} onClick={makePayment}>
          <Plus className="h-5 w-5" />
          Make Payment
        </Button>

        <Card>
          <h2 className="text-xl font-black">Wallet history</h2>
          {ledger.loading ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : ledger.error ? (
            <div className="mt-4">
              <ErrorState message={ledger.error} onRetry={ledger.reload} />
            </div>
          ) : ledger.data?.ledger.length ? (
            <div className="mt-4 space-y-3">
              {ledger.data.ledger.map((item, index) => (
                <div key={item.id ?? index} className="flex items-center gap-3 rounded-2xl border border-wigope-line p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-wigope-orange">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{item.description || item.source || 'Wallet entry'}</p>
                    <p className="text-xs font-bold uppercase text-slate-500">{item.type}</p>
                  </div>
                  <p className="font-black">₹{item.amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No wallet entries" body="Topups, cashback, and refunds will appear here." />
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
