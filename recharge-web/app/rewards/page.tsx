'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Gift, Link2, Sparkles, Ticket, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useAsync } from '@/hooks/use-async';
import { rewardsService } from '@/services/rewards';

const vouchers = [
  ['Flipkart', '/assets/brands/voucher_flipkart_new.png', '1.25%'],
  ['Amazon', '/assets/brands/voucher_amazon_new.png', '2%'],
  ['Myntra', '/assets/brands/voucher_myntra_new.png', '2%'],
  ["Domino's", '/assets/brands/voucher_dominos_new.png', '10%'],
  ['Swiggy', '/assets/brands/voucher_swiggy_new.png', '3%'],
  ['Zomato', '/assets/brands/voucher_zomato_new.png', '1%']
];

const ott = [
  ['Sony LIV', '/assets/brands/ott_sonyliv.png'],
  ['Spotify', '/assets/brands/ott_spotify.png'],
  ['Hotstar', '/assets/brands/ott_hotstar.png'],
  ['Prime Video', '/assets/brands/ott_prime.png']
];

export default function RewardsPage() {
  const sdk = useAsync(() => rewardsService.url(), []);
  const [showSdk, setShowSdk] = useState(false);
  const [frameLoading, setFrameLoading] = useState(true);

  useEffect(() => {
    if (!showSdk) return;
    setFrameLoading(true);
    const timer = window.setTimeout(() => setFrameLoading(false), 12000);
    return () => window.clearTimeout(timer);
  }, [showSdk]);

  return (
    <AppShell title="Wigope Rewards">
      <div className="space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[34px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20"
        >
          <div className="absolute -right-12 top-0 h-44 w-44 rounded-full bg-wigope-orange/50 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-wigope-orange">
              <Gift className="h-9 w-9" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-200">Powered by Hubble</p>
              <h2 className="mt-1 text-3xl font-black tracking-[-0.06em]">Rewards ecosystem</h2>
              <p className="mt-1 text-sm font-semibold text-white/70">Gift cards, OTT, vouchers, cashback and chain rewards.</p>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Mini icon={<Gift />} label="Gift cards" />
          <Mini icon={<Ticket />} label="Vouchers" />
          <Mini icon={<Link2 />} label="Reward chain" />
        </div>

        <Card className="bg-gradient-to-br from-orange-50 via-white to-orange-50">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-wigope-orange text-white">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.05em]">Referral chain rewards</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Invite verified users, grow your audience chain, and unlock campaign rewards whenever Wigope opens new reward pools.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">₹7 fixed invite</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">Audience chain</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">Gift rewards</span>
          </div>
        </Card>

        <RewardGrid title="Gift & Voucher Deals" items={vouchers} />
        <OttSlider />

        {sdk.loading ? <Skeleton className="h-14" /> : sdk.error ? <ErrorState message={sdk.error} onRetry={sdk.reload} /> : null}

        <Button className="h-14 w-full rounded-3xl" disabled={!sdk.data} onClick={() => setShowSdk(true)}>
          <ExternalLink className="h-5 w-5" />
          Open Hubble marketplace
        </Button>

        {showSdk && sdk.data ? (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex h-16 items-center justify-between border-b border-wigope-line px-4">
              <div>
                <p className="text-lg font-black">Hubble Rewards</p>
                <p className="text-xs font-bold text-slate-500">Live secure rewards session</p>
              </div>
              <Button variant="secondary" onClick={() => setShowSdk(false)}>
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
            {frameLoading ? (
              <div className="absolute inset-x-0 top-16 z-10 bg-white p-5">
                <Skeleton className="h-20" />
                <Skeleton className="mt-3 h-20" />
                <Skeleton className="mt-3 h-20" />
              </div>
            ) : null}
            <iframe
              src={sdk.data}
              title="Hubble Rewards"
              className="h-[calc(100vh-64px)] w-full border-0"
              onLoad={() => setFrameLoading(false)}
            />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card">
      <div className="mx-auto flex h-10 w-10 items-center justify-center text-wigope-orange">{icon}</div>
      <p className="mt-2 text-xs font-black">{label}</p>
    </div>
  );
}

function RewardGrid({ title, items }: { title: string; items: string[][] }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-[-0.05em]">{title}</h2>
        <span className="text-sm font-black text-slate-500">500+ brands</span>
      </div>
      <div className="grid grid-cols-3 gap-x-5 gap-y-6">
        {items.map(([name, src, badge]) => (
          <button key={name} className="text-center">
            <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-[24px] bg-slate-100 shadow-card">
              <Image src={src} alt={name} fill className="object-cover" />
              {badge ? <span className="absolute left-2 top-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-black text-white">{badge}</span> : null}
            </div>
            <p className="mt-2 text-sm font-black">{name}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}

function OttSlider() {
  return (
    <Card>
      <h2 className="text-2xl font-black tracking-[-0.05em]">OTT Gift Cards</h2>
      <div className="hide-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2">
        {ott.map(([name, src]) => (
          <button key={name} className="min-w-[124px] text-left">
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-slate-100 shadow-card">
              <Image src={src} alt={name} fill className="object-cover" />
            </div>
            <p className="mt-2 text-sm font-black">{name}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}
