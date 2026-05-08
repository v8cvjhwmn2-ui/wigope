'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { formatINR } from '@/lib/utils';

// Live catalog of every Wigope admin primitive. Mirrors mobile/lib/features/components/.
// Used to verify token compliance per ADR-0002.
export default function ComponentsPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
      <header>
        <div className="text-xs font-semibold uppercase tracking-widest text-wigope-orange-600">
          Component library
        </div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-wigope-navy-900">
          Wigope Pay · Admin
        </h1>
        <p className="mt-2 font-script text-2xl text-ink-secondary">
          simple. secure. recharge-first.
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button loading>Loading…</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <Input label="Mobile" placeholder="10-digit number" />
          <Input label="Amount" placeholder="₹ 0.00" />
          <Input label="PAN" placeholder="ABCDE1234F" hint="Used for KYC verification only." />
          <Input label="OTP" placeholder="6 digits" error="Code expired — request a new one." />
        </div>
      </Section>

      <Section title="Cards & KPIs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Revenue', value: formatINR(1240050), tone: 'text-wigope-navy-900' },
            { label: 'Transactions', value: '12,408', tone: 'text-wigope-navy-900' },
            { label: 'Success rate', value: '98.7%', tone: 'text-success' },
            { label: 'Pending KYC', value: '17', tone: 'text-warning' },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent>
                <div className="text-xs uppercase tracking-wider text-ink-tertiary">{k.label}</div>
                <div className={`mt-2 font-display text-3xl font-bold ${k.tone}`}>{k.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card hero className="mt-4 bg-grad-orange-soft border-0">
          <CardHeader>
            <CardTitle>Hero card</CardTitle>
            <CardDescription>Used on dashboard intros and onboarding moments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Primary CTA</Button>
          </CardContent>
        </Card>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">Success</Badge>
          <Badge tone="pending">Pending</Badge>
          <Badge tone="failed">Failed</Badge>
          <Badge tone="info">Refund</Badge>
          <Badge>Neutral</Badge>
        </div>
      </Section>

      <Section title="Table">
        <Table>
          <THead>
            <TR>
              <TH>Txn</TH>
              <TH>Service</TH>
              <TH>Amount</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {[
              { id: 'TXN-9821', svc: 'Vi Prepaid · 9568XXXX', amt: 299, status: 'success' as const },
              { id: 'TXN-9820', svc: 'Tata Power · DL', amt: 1450, status: 'pending' as const },
              { id: 'TXN-9819', svc: 'FASTag · ICICI', amt: 500, status: 'failed' as const },
            ].map((r) => (
              <TR key={r.id}>
                <TD className="font-mono text-xs">{r.id}</TD>
                <TD>{r.svc}</TD>
                <TD className="tabular-nums">{formatINR(r.amt)}</TD>
                <TD>
                  <Badge tone={r.status}>{r.status}</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Section>

      <Section title="Skeletons">
        <Card>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </Section>

      <Section title="Empty state">
        <Card>
          <EmptyState
            title="No transactions yet"
            scriptTagline="Pehla recharge karein — yahan history dikhegi."
            actionLabel="Configure providers"
            onAction={() => {}}
          />
        </Card>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-wigope-orange-600">
        {title}
      </h2>
      {children}
    </section>
  );
}
