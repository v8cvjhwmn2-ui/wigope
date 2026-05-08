'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Gift, Link2, Ticket } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useAsync } from '@/hooks/use-async';
import { rewardsService } from '@/services/rewards';

const vouchers = [
  ['Flipkart', '/assets/brands/voucher_flipkart_new.png'],
  ['Amazon', '/assets/brands/voucher_amazon_new.png'],
  ['Myntra', '/assets/brands/voucher_myntra_new.png'],
  ["Domino's", '/assets/brands/voucher_dominos_new.png'],
  ['Swiggy', '/assets/brands/voucher_swiggy_new.png'],
  ['Zomato', '/assets/brands/voucher_zomato_new.png']
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

  return (
    <AppShell title="Wigope Rewards">
      <div className="space-y-5">
        <Card className="bg-gradient-to-r from-navy-900 to-wigope-orange text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-wigope-orange">
              <Gift className="h-9 w-9" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Gift cards & vouchers</h2>
              <p className="mt-1 text-sm font-semibold text-white/75">Powered by Hubble Rewards API</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Mini icon={<Gift />} label="Gift cards" />
          <Mini icon={<Ticket />} label="Vouchers" />
          <Mini icon={<Link2 />} label="Reward chain" />
        </div>

        <Card className="bg-orange-50">
          <h2 className="text-2xl font-black">Wigope rewards chain</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Invite users, build your audience chain, and unlock reward opportunities through Wigope campaigns.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white px-4 py-2">₹7 fixed</span>
            <span className="rounded-full bg-white px-4 py-2">Audience chain</span>
            <span className="rounded-full bg-white px-4 py-2">Gift rewards</span>
          </div>
        </Card>

        <RewardGrid title="Gift & Voucher Deals" items={vouchers} />
        <RewardGrid title="OTT Gift Cards" items={ott} />

        {sdk.loading ? <Skeleton className="h-14" /> : sdk.error ? <ErrorState message={sdk.error} onRetry={sdk.reload} /> : null}

        <Button className="h-14 w-full rounded-3xl" disabled={!sdk.data} onClick={() => setShowSdk(true)}>
          <ExternalLink className="h-5 w-5" />
          Open live catalogue
        </Button>

        {showSdk && sdk.data ? (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex h-16 items-center justify-between border-b border-wigope-line px-4">
              <p className="text-lg font-black">Hubble Rewards</p>
              <Button variant="secondary" onClick={() => setShowSdk(false)}>
                Close
              </Button>
            </div>
            <iframe src={sdk.data} title="Hubble Rewards" className="h-[calc(100vh-64px)] w-full border-0" />
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
      <h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2>
      <div className="mt-4 grid grid-cols-3 gap-x-5 gap-y-6">
        {items.map(([name, src]) => (
          <button key={name} className="text-center">
            <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-[24px] bg-slate-100">
              <Image src={src} alt={name} fill className="object-cover" />
            </div>
            <p className="mt-2 text-sm font-black">{name}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}
