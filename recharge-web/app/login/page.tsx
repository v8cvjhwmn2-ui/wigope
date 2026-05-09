'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, Check, LockKeyhole, Phone, ReceiptText, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { authService } from '@/services/auth';
import { userMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { WigopeLogo } from '@/components/wigope-logo';
import { useAuth } from '@/components/app-providers';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [sentTo, setSentTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validMobile = /^[6-9]\d{9}$/.test(mobile);
  const validOtp = /^\d{6}$/.test(otp);

  async function sendOtp() {
    if (!validMobile) return;
    setLoading(true);
    setError('');
    try {
      const data = await authService.sendOtp(mobile);
      setSentTo(data.sentTo);
      setStep('otp');
    } catch (err) {
      setError(userMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!validOtp) return;
    setLoading(true);
    setError('');
    try {
      await authService.verifyOtp(mobile, otp);
      await refreshUser();
      router.replace('/recharge');
    } catch (err) {
      setError(userMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(255,107,0,0.34),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(255,255,255,0.12),transparent_24%)]" />
      <div className="absolute inset-0 app-grid opacity-[0.12]" />
      <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="rounded-2xl bg-white px-3 py-2 shadow-card">
          <WigopeLogo />
        </Link>
        <a className="rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm font-black text-white/85 backdrop-blur" href="mailto:support@wigope.com">
          Need help?
        </a>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-16">
        <div className="hidden lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-black text-orange-100 backdrop-blur">
            <Sparkles className="h-4 w-4 text-wigope-orange" /> Wigope Recharge account access
          </p>
          <h1 className="mt-8 text-6xl font-black leading-[0.94] tracking-[-0.075em]">
            One login for recharge, bills, wallet and rewards.
          </h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-slate-300">
            Verify your mobile number to continue with secure Wigope Recharge services connected to live APIs.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-4">
            {[
              ['Secure OTP', LockKeyhole],
              ['Live wallet', WalletCards],
              ['Instant receipts', ReceiptText],
              ['Protected session', ShieldCheck]
            ].map(([label, Icon]) => (
              <div key={String(label)} className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <Icon className="h-7 w-7 text-wigope-orange" />
                <p className="mt-4 text-lg font-black">{String(label)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[38px] border border-white/10 bg-white shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex items-center justify-between">
              <WigopeLogo />
              <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-wigope-orange">Production</span>
            </div>
          </div>
          <div className="p-6 text-navy-950 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-wigope-orange">Welcome</p>
            <h2 className="mt-4 text-5xl font-black leading-[0.98] tracking-[-0.065em]">
              {step === 'mobile' ? 'Enter your mobile number' : 'Verify the OTP'}
            </h2>
            <p className="mt-5 text-lg font-semibold leading-8 text-slate-600">
              {step === 'mobile'
                ? "We'll send a 6-digit verification code to confirm it's really you."
                : `Code sent to ${sentTo || `+91 ${mobile}`}.`}
            </p>

            <div className="mt-9">
              {step === 'mobile' ? (
                <div className="flex h-20 items-center rounded-[28px] border-2 border-emerald-500 bg-white px-5 shadow-card">
                  <span className="text-2xl">🇮🇳</span>
                  <span className="ml-4 border-r border-slate-200 pr-5 text-2xl font-black">+91</span>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="min-w-0 flex-1 bg-transparent px-5 text-3xl font-black tracking-[0.12em] outline-none"
                  />
                  {validMobile ? (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-7 w-7" />
                    </span>
                  ) : null}
                </div>
              ) : (
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="h-20 w-full rounded-[28px] border-2 border-wigope-orange bg-white px-5 text-center text-4xl font-black tracking-[0.35em] text-navy-950 outline-none shadow-card"
                />
              )}
            </div>

            {error ? (
              <div className="mt-5 rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
                {error}
              </div>
            ) : null}

            <Button
              className="mt-8 h-16 w-full rounded-[28px] text-xl font-black"
              disabled={step === 'mobile' ? !validMobile : !validOtp}
              loading={loading}
              onClick={step === 'mobile' ? sendOtp : verifyOtp}
            >
              {step === 'mobile' ? 'Send OTP' : 'Verify & Continue'}
              <ArrowRight className="h-6 w-6" />
            </Button>

            {step === 'otp' ? (
              <button
                className="mt-5 w-full text-center text-sm font-black text-wigope-orange"
                onClick={() => {
                  setOtp('');
                  setStep('mobile');
                }}
              >
                Edit mobile number
              </button>
            ) : null}

            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-extrabold text-slate-400">
              <BadgeCheck className="h-4 w-4" />
              Secured by Wigope
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
