'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, ReceiptText, Search, ShieldCheck, Smartphone, Sparkles, Zap } from 'lucide-react';
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
  { label: 'Mobile', title: 'Mobile Recharge', service: 'mobile', icon: '/assets/services/prepaid_recharges.png', badge: '3.8%' },
  { label: 'DTH', title: 'DTH Recharge', service: 'dth', icon: '/assets/services/dth_d2h_recharges.png', badge: '4.1%' },
  { label: 'FASTag', title: 'FASTag', service: 'fastag', icon: '/assets/services/fastag_recharges.png', badge: '2%' },
  { label: 'Electricity', title: 'Electricity Bill', service: 'electricity', icon: '/assets/services/electricity_payments.png', badge: 'BBPS' },
  { label: 'Broadband', title: 'Broadband', service: 'broadband', icon: '/assets/services/dth_d2h_recharges.png', badge: 'Live' },
  { label: 'Gas', title: 'Gas Bill', service: 'gas', icon: '/assets/services/gas_cylinder_booking.png', badge: 'Bill' },
  { label: 'Water', title: 'Water Bill', service: 'water', icon: '/assets/services/water_payments.png', badge: 'Bill' },
  { label: 'Credit Card', title: 'Credit Card', service: 'credit-card', icon: '/assets/services/credit_card_payment.png', badge: 'Pay' },
  { label: 'Insurance', title: 'Insurance', service: 'insurance', icon: '/assets/services/insurance_payments.png', badge: 'Safe' },
  { label: 'Loan EMI', title: 'Loan EMI', service: 'loan-emi', icon: '/assets/services/postpaid_payments.png', badge: 'EMI' },
  { label: 'OTT', title: 'OTT', service: 'ott', icon: '/assets/brands/ott_prime.png', badge: 'Gift' },
  { label: 'Gift Cards', title: 'Gift Cards', service: 'gift-cards', icon: '/assets/brands/see_all_tile.png', badge: 'Hub' }
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
  const selected = quickServices.find((item) => item.service === service) ?? quickServices[0];
  const validNumber = useMemo(() => (service === 'mobile' ? /^\d{10}$/.test(number) : number.trim().length >= 4), [number, service]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedService = params.get('service');
    if (selectedService && quickServices.some((item) => item.service === selectedService)) setService(selectedService);
  }, []);

  useEffect(() => {
    setError('');
    setDetection(null);
    setPlans([]);
  }, [service]);

  async function detect() {
    if (!validNumber || service !== 'mobile') return;
    setDetecting(true);
    setError('');
    try {
      const op = await rechargeService.detectOperator(number);
      setDetection(op);
      const planData = await rechargeService.mobilePlans(op.opid, op.circleCode);
      setPlans(planData.plans ?? []);
    } catch (err) {
      setDetection(null);
      setPlans([]);
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
    <AppShell title="Recharge">
      <div className="space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[34px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20"
        >
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-wigope-orange/40 blur-3xl" />
          <p className="relative text-xs font-black uppercase tracking-[0.22em] text-orange-200">Instant payments</p>
          <h2 className="relative mt-2 text-3xl font-black tracking-[-0.06em]">Choose a service, validate, pay, done.</h2>
          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <Stat label="Secure" value="OTP" />
            <Stat label="Status" value="Live" />
            <Stat label="Refunds" value="Track" />
          </div>
        </motion.section>

        <Card className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {quickServices.map((item) => (
              <button
                key={item.service}
                onClick={() => setService(item.service)}
                className={`relative rounded-[24px] p-2 text-center transition ${
                  service === item.service ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/15' : 'bg-white text-navy-900 shadow-card'
                }`}
              >
                <div className="relative mx-auto h-14 w-14 rounded-2xl bg-white">
                  <Image src={item.icon} alt="" fill className="object-contain p-1" />
                </div>
                <span className="absolute right-1 top-1 rounded-full bg-wigope-orange px-1.5 py-0.5 text-[9px] font-black text-white">{item.badge}</span>
                <p className="mt-2 text-[11px] font-black leading-tight">{item.label}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-50 text-wigope-orange">
              {service === 'mobile' ? <Smartphone /> : <ReceiptText />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-wigope-orange">Live Wigope API</p>
              <h2 className="text-2xl font-black tracking-[-0.05em]">{selected.title}</h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Input
              label={service === 'mobile' ? 'Mobile number' : 'Consumer / account number'}
              inputMode={service === 'mobile' ? 'numeric' : 'text'}
              value={number}
              onChange={(e) => setNumber(service === 'mobile' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value.slice(0, 32))}
              placeholder={service === 'mobile' ? '10 digit number' : 'Enter ID or registered number'}
            />
            <Input
              label="Amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, '')))}
              placeholder="Enter amount"
            />
            {service === 'mobile' ? (
              <Button variant="secondary" className="w-full" onClick={detect} disabled={!validNumber} loading={detecting}>
                <Search className="h-4 w-4" />
                Detect operator and plans
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">
                <ShieldCheck className="h-5 w-5" />
                Bill fetch and payment will use the live Wigope backend route.
              </div>
            )}
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
            <h2 className="text-2xl font-black tracking-[-0.05em]">Recommended plans</h2>
            <div className="mt-4 space-y-3">
              {plans.length ? plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setAmount(Number(plan.amount))}
                  className={`flex w-full items-center justify-between rounded-3xl border p-4 text-left transition ${
                    amount === Number(plan.amount) ? 'border-wigope-orange bg-orange-50 shadow-card' : 'border-wigope-line bg-white'
                  }`}
                >
                  <p className="text-3xl font-black tracking-[-0.06em]">₹{plan.amount}</p>
                  <div className="min-w-0 flex-1 px-4">
                    <p className="font-black">{plan.validity || 'Recharge'}</p>
                    <p className="truncate text-sm font-semibold text-slate-500">{plan.description}</p>
                  </div>
                </button>
              )) : (
                <EmptyState title="Detect operator to load plans" body="Live plans will appear here after operator detection succeeds." />
              )}
            </div>
          </Card>
        ) : null}

        {error ? <ErrorState message={error} /> : null}

        <Button className="h-16 w-full rounded-3xl text-lg font-black" disabled={!validNumber || !amount} loading={submitting} onClick={submit}>
          <Zap className="h-5 w-5" />
          Pay & Continue
        </Button>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-wigope-orange" />
            <p className="text-sm font-black text-slate-700">Instant confirmation, live status tracking, and receipt history after every transaction.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
