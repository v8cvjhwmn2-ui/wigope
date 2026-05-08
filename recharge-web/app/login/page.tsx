'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { authService } from '@/services/auth';
import { userMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { WigopeLogo } from '@/components/wigope-logo';

export default function LoginPage() {
  const router = useRouter();
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
      router.replace('/dashboard');
    } catch (err) {
      setError(userMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-grid mx-auto min-h-screen w-full max-w-md overflow-hidden bg-white text-navy-900 md:my-4 md:min-h-[880px] md:rounded-[34px] md:border md:border-wigope-line">
      <header className="flex items-center justify-between border-b border-wigope-line px-5 py-4">
        <WigopeLogo />
        <a className="text-sm font-bold text-navy-800" href="mailto:support@wigope.com">
          Need help?
        </a>
      </header>

      <section className="px-6 py-10">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-wigope-orange">Welcome</p>
        <h1 className="mt-4 text-5xl font-black leading-[0.98] tracking-[-0.06em]">
          {step === 'mobile' ? 'Enter your mobile number' : 'Verify your OTP'}
        </h1>
        <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
          {step === 'mobile'
            ? "We'll send a 6-digit verification code to confirm it's really you."
            : `Code sent to ${sentTo || `+91 ${mobile}`}.`}
        </p>

        <div className="mt-10">
          {step === 'mobile' ? (
            <div className="flex h-16 items-center rounded-3xl border-2 border-emerald-500 bg-white px-4 shadow-card">
              <span className="text-2xl">🇮🇳</span>
              <span className="ml-3 border-r border-slate-200 pr-4 text-xl font-black">+91</span>
              <input
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="min-w-0 flex-1 bg-transparent px-4 text-2xl font-black tracking-[0.12em] outline-none"
              />
              {validMobile ? (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-6 w-6" />
                </span>
              ) : null}
            </div>
          ) : (
            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="h-16 w-full rounded-3xl border-2 border-wigope-orange bg-white px-5 text-center text-3xl font-black tracking-[0.35em] text-navy-900 outline-none shadow-card"
            />
          )}
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        <Button
          className="mt-8 h-16 w-full rounded-3xl text-xl font-black"
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
          <LockKeyhole className="h-4 w-4" />
          Secured by Wigope
        </div>
      </section>
    </main>
  );
}
