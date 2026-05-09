import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Headphones,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { company, ottBrands, servicePages, voucherBrands } from '@/lib/site-content';

type PageProps = {
  params: {
    slug: string;
  };
};

const categoryCopy: Record<string, string> = {
  Recharge: 'Instant customer recharge journeys for mobile, DTH, FASTag and connected service categories.',
  Bills: 'Bill payment journeys with clean validation, support readiness and clear customer communication.',
  Finance: 'Payment categories designed for secure customer flows, receipts and status tracking.',
  Rewards: 'Gift cards, OTT subscriptions, vouchers and referral-led rewards powered by the Wigope ecosystem.'
};

export function generateStaticParams() {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const service = servicePages.find((item) => item.slug === params.slug);
  if (!service) return {};
  return {
    title: `${service.title} | Wigope Recharge`,
    description: `${service.title} on Wigope Recharge. ${service.description}`
  };
}

export default function ServicePage({ params }: PageProps) {
  const service = servicePages.find((item) => item.slug === params.slug);
  if (!service) notFound();

  const related = servicePages
    .filter((item) => item.slug !== service.slug && item.category === service.category)
    .slice(0, 4);
  const showcaseBrands =
    service.slug === 'gift-cards' ? voucherBrands : service.slug === 'ott-vouchers' ? ottBrands : [];

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#080b12] px-4 py-16 text-white sm:px-6 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,107,0,0.42),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.16),transparent_22%)]" />
        <div className="absolute inset-0 app-grid opacity-[0.08]" />
        <div className="relative mx-auto max-w-6xl">
          <Link href="/#services" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-black text-white/80 backdrop-blur">
            <ArrowLeft className="h-4 w-4" /> All services
          </Link>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-orange-200">
                {service.category}
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.07em] sm:text-7xl">
                {service.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-300">
                {service.description} {categoryCopy[service.category]}
              </p>
            </div>
            <div className="rounded-[34px] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur">
              {[
                ['Production API', 'Connected to recharge-api.wigope.com'],
                ['Customer journey', 'Mobile-first web and app-ready flows'],
                ['Support ready', `${company.email} and WhatsApp assistance`]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-white/10 py-4 last:border-0">
                  <span className="text-sm font-black uppercase tracking-[0.16em] text-white/45">{label}</span>
                  <span className="text-right text-sm font-black text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3">
        {[
          [ShieldCheck, 'Secure access', 'OTP based access with protected payment and reward flows.'],
          [Clock3, 'Fast completion', 'Designed for quick validation, status updates and confirmations.'],
          [Headphones, 'Assisted support', 'Clear customer support path for pending, failed or delayed transactions.']
        ].map(([Icon, title, body]) => (
          <div key={String(title)} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
            <Icon className="h-7 w-7 text-wigope-orange" />
            <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">{String(title)}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{String(body)}</p>
          </div>
        ))}
      </section>

      {showcaseBrands.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="rounded-[38px] border border-slate-200 bg-white p-5 shadow-[0_20px_90px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-wigope-orange">Featured catalogue</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] sm:text-5xl">Premium brands on Wigope</h2>
              </div>
              <p className="max-w-md text-sm font-semibold leading-6 text-slate-600">
                Rewards and vouchers powered by Hubble for a secure customer redemption journey.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {showcaseBrands.slice(0, 8).map((brand) => (
                <div key={brand.name} className="rounded-[28px] border border-slate-100 bg-slate-50 p-3">
                  <div className="relative aspect-square overflow-hidden rounded-[24px] bg-white shadow-inner">
                    <Image src={brand.image} alt={brand.name} fill sizes="180px" className="object-contain p-2" />
                  </div>
                  <p className="mt-3 text-center text-sm font-black">{brand.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-[38px] bg-[#111827] p-6 text-white shadow-[0_30px_120px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-center">
            <div>
              <Sparkles className="h-9 w-9 text-wigope-orange" />
              <h2 className="mt-5 text-3xl font-black tracking-[-0.055em] sm:text-5xl">Ready for Wigope customers</h2>
              <p className="mt-4 text-base font-semibold leading-7 text-slate-300">
                Start with app download, secure OTP access and assisted support. Live recharge and rewards flows connect to Wigope production APIs.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Mobile-first web experience', 'Production API connected', 'Payment gateway ready', 'Customer support enabled'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-black">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#download" className="inline-flex items-center gap-2 rounded-full bg-wigope-orange px-6 py-3 text-sm font-black text-white shadow-orange-glow">
              Download app <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/support" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-black text-white/85">
              Contact support
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="text-3xl font-black tracking-[-0.055em]">Related services</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link key={item.slug} href={`/services/${item.slug}`} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-orange-200">
                <BadgeCheck className="h-6 w-6 text-wigope-orange" />
                <h3 className="mt-4 text-xl font-black tracking-[-0.04em]">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <SiteFooter />
    </main>
  );
}
