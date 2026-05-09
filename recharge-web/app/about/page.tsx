import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building2, ShieldCheck, Smartphone } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { WigopeLogo } from '@/components/wigope-logo';
import { company } from '@/lib/site-content';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="rounded-[44px] bg-white p-6 shadow-[0_24px_100px_rgba(15,23,42,0.08)] sm:p-10">
          <WigopeLogo />
          <p className="mt-8 text-sm font-black uppercase tracking-[0.22em] text-wigope-orange">About Wigope Recharge</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.07em] sm:text-7xl">
            A clean recharge, bill payment and rewards product from Wigope.
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-slate-600">
            Wigope Recharge is designed as a customer-facing product for digital recharge, bill payments, wallet-led journeys, gift cards, OTT vouchers and support-ready transactions.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              [Building2, company.legalName, `CIN: ${company.cin}`],
              [Smartphone, 'Mobile-first product', 'Built for web, PWA and Android customer journeys.'],
              [ShieldCheck, 'Secure service layer', 'Production APIs, OTP access and payment partner readiness.']
            ].map(([Icon, title, body]) => (
              <div key={String(title)} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <Icon className="h-7 w-7 text-wigope-orange" />
                <h2 className="mt-4 text-xl font-black">{String(title)}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{String(body)}</p>
              </div>
            ))}
          </div>
          <Link href="/#download" className="mt-10 inline-flex items-center gap-2 rounded-full bg-wigope-orange px-6 py-3 text-sm font-black text-white shadow-orange-glow">
            Download app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
