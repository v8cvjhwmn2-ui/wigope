'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, Search, Smartphone, Zap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { rechargeService } from '@/services/recharge';
import { userMessage } from '@/lib/errors';
import type { MobilePlan, OperatorDetection } from '@/types/api';

const quickServices = [
  { label: 'Mobile', service: 'mobile', icon: '/assets/services/prepaid_recharges.png' },
  { label: 'DTH', service: 'dth', icon: '/assets/services/dth_d2h_recharges.png' },
  { label: 'Electricity', service: 'electricity', icon: '/assets/services/electricity_payments.png' },
  { label: 'FASTag', service: 'fastag', icon: '/assets/services/fastag_recharges.png' },
  { label: 'Postpaid', service: 'postpaid', icon: '/assets/services/postpaid_payments.png' },
  { label: 'LPG', service: 'lpg', icon: '/assets/services/gas_cylinder_booking.png' },
  { label: 'Water', service: 'water', icon: '/assets/services/water_payments.png' },
  { label: 'Insurance', service: 'insurance', icon: '/assets/services/insurance_payments.png' }
];

export default function RechargePage() {
  const [service, setService] = useState('mobile');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState<number>(199);
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detection, setDetection] = useState<OperatorDetection | null>(null);
  const [plans, setPlans] = useState<MobilePlan[]>([]);
  const [error, setError] = useState('');
  const validNumber = useMemo(() => /^\d{10}$/.test(number), [number]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selected = params.get('service');
    if (selected && quickServices.some((item) => item.service === selected)) setService(selected);
  }, []);

  async function detect() {
    if (!validNumber) return;
    setDetecting(true);
    setError('');
    try {
      const op = await rechargeService.detectOperator(number);
      setDetection(op);
      try {
        const planData = await rechargeService.mobilePlans(op.opid, op.circleCode);
        setPlans(planData.plans ?? []);
      } catch {
        setPlans([]);
      }
    } catch (err) {
      setDetection(null);
      setError(userMessage(err));
    } finally {
      setDetecting(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      if (service === 'mobile') {
        await rechargeService.mobileRecharge(number, amount);
      } else {
        await rechargeService.billPayment({
          service,
          opid: service,
          number,
          amount
        });
      }
      window.location.href = '/transactions';
    } catch (err) {
      setError(userMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Recharge & Bills">
      <div className="space-y-5">
        <Card>
          <div className="grid grid-cols-4 gap-4">
            {quickServices.map((item) => (
              <button
                key={item.service}
                onClick={() => setService(item.service)}
                className={`rounded-2xl p-2 text-center transition ${
                  service === item.service ? 'bg-orange-50 ring-2 ring-wigope-orange' : 'bg-white'
                }`}
              >
                <div className="relative mx-auto h-14 w-14 rounded-2xl bg-slate-50">
                  <Image src={item.icon} alt="" fill className="object-contain p-1" />
                </div>
                <p className="mt-2 text-xs font-black">{item.label}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-wigope-orange">
              {service === 'mobile' ? <Smartphone /> : <Zap />}
            </div>
            <div>
              <h2 className="text-xl font-black capitalize">{service} payment</h2>
              <p className="text-sm font-semibold text-slate-500">Live request through Wigope API</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Input
              label={service === 'mobile' ? 'Mobile number' : 'Consumer / account number'}
              inputMode="numeric"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10 digit number"
            />
            {service === 'mobile' ? (
              <Button variant="secondary" className="w-full" onClick={detect} disabled={!validNumber} loading={detecting}>
                <Search className="h-4 w-4" />
                Detect operator
              </Button>
            ) : null}
            {detection ? (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                {detection.operatorName} · {detection.circleName || detection.circleCode}
              </div>
            ) : null}
          </div>
        </Card>

        {service === 'mobile' ? (
          <Card>
            <h2 className="text-xl font-black">Choose plan</h2>
            <div className="mt-4 space-y-3">
              {plans.length ? plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setAmount(Number(plan.amount))}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${
                    amount === Number(plan.amount) ? 'border-wigope-orange bg-orange-50' : 'border-wigope-line'
                  }`}
                >
                  <p className="text-2xl font-black">₹{plan.amount}</p>
                  <div className="min-w-0 flex-1 px-4">
                    <p className="font-black">{plan.validity || 'Recharge'}</p>
                    <p className="truncate text-sm font-semibold text-slate-500">{plan.description}</p>
                  </div>
                </button>
              )) : (
                <EmptyState
                  title="Detect operator to load plans"
                  body="Live plans will appear here after the operator is detected from Wigope API."
                />
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <Input
              label="Amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, '')))}
              placeholder="Enter amount"
            />
          </Card>
        )}

        {error ? <ErrorState message={error} /> : null}

        <Button className="h-16 w-full rounded-3xl text-lg font-black" disabled={!number || !amount} loading={submitting} onClick={submit}>
          Pay & Recharge
        </Button>
      </div>
    </AppShell>
  );
}
