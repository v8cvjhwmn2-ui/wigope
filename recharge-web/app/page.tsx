import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Download,
  Gift,
  Headphones,
  Mail,
  MessageCircle,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
  Zap
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { WigopeLogo } from '@/components/wigope-logo';
import { company, ottBrands, policies, servicePages, voucherBrands } from '@/lib/site-content';

const topServices = servicePages.slice(0, 10);
const rewardServices = servicePages.filter((service) => service.category === 'Rewards');

const proofPoints = [
  'Mobile recharge',
  'DTH recharge',
  'FASTag',
  'Utility bills',
  'Wallet topup',
  'Gift cards',
  'OTT vouchers',
  'Refer rewards'
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfbfc] text-navy-950">
      <SiteHeader />
      <Hero />
      <Services />
      <Rewards />
      <DownloadApp />
      <CustomerJourney />
      <PolicyLinks />
      <Support />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-orange-100 bg-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute left-[-12%] top-16 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
      <div className="absolute right-[-10%] top-20 h-96 w-96 rounded-full bg-[#ffe5d1] blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 overflow-hidden px-5 py-14 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:py-20">
        <div className="min-w-0">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.12em] text-wigope-orange shadow-sm sm:text-xs sm:tracking-[0.16em]">
            <Sparkles className="h-4 w-4" />
            Official Wigope Recharge product
          </p>
          <h1 className="mt-7 max-w-[21rem] break-words text-[2.05rem] font-black leading-[1.06] tracking-[-0.035em] text-navy-950 sm:max-w-4xl sm:text-6xl sm:leading-[1.05] sm:tracking-[-0.055em] lg:text-7xl">
            Recharge, bills and rewards in one clean Wigope experience.
          </h1>
          <p className="mt-6 max-w-[21.5rem] text-base font-semibold leading-7 text-slate-600 sm:max-w-2xl sm:text-lg sm:leading-8">
            A customer-facing Wigope product for mobile recharge, DTH, FASTag, utilities,
            wallet topups, OTT vouchers, gift cards and referral rewards.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#download"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-wigope-orange px-6 text-sm font-black text-white shadow-[0_18px_38px_rgba(255,107,19,0.25)] transition hover:bg-wigope-orangeDark sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Download app
            </a>
            <a
              href="#services"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-navy-950 shadow-sm transition hover:border-orange-200 hover:text-wigope-orange sm:w-auto"
            >
              View services
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Live API', 'Production ready'],
              ['OTP access', 'Secure login'],
              ['Wallet', 'Gateway ready'],
              ['Rewards', 'Hubble powered']
            ].map(([title, label]) => (
              <div key={title} className="min-w-0 rounded-2xl border border-slate-200 bg-white/78 p-4 shadow-sm backdrop-blur">
                <p className="text-lg font-black tracking-[-0.03em] text-navy-950">{title}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -inset-5 rounded-[42px] bg-[radial-gradient(circle_at_30%_15%,rgba(255,107,0,0.26),transparent_34%),radial-gradient(circle_at_80%_82%,rgba(15,23,42,0.20),transparent_36%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/92 p-5 shadow-[0_34px_100px_rgba(15,23,42,0.16)] backdrop-blur">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[100px] bg-orange-50" />
            <div className="relative flex items-center justify-between gap-4">
              <a href={company.mainWebsite} aria-label="Open Wigope main website">
                <WigopeLogo className="rounded-2xl bg-white px-2 py-1 shadow-sm" />
              </a>
              <span className="rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-wigope-orange">
                Product showcase
              </span>
            </div>

            <div className="relative mt-7 rounded-[28px] border border-orange-100 bg-[#fff7ef] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-wigope-orange">Start with</p>
                  <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-navy-950">
                    Recharge essentials
                  </p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-wigope-orange shadow-sm">
                  <Zap className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {topServices.slice(0, 6).map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="group rounded-2xl border border-white/80 bg-white p-3 text-navy-950 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-orange-50">
                      <Image
                        src={service.icon}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain p-1.5"
                      />
                    </div>
                    <p className="mt-3 text-xs font-black leading-tight">{service.title}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative mt-5 rounded-[28px] bg-[linear-gradient(135deg,#071225,#1d2b47_52%,#ff6b13)] p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-black tracking-[-0.04em]">Gift cards & vouchers</p>
                  <p className="mt-1 max-w-sm text-sm font-semibold leading-6 text-orange-50">
                    Rewards and vouchers powered by Hubble.
                  </p>
                </div>
                <Gift className="h-8 w-8 shrink-0" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {voucherBrands.slice(0, 3).map((brand) => (
                  <div key={brand.name} className="rounded-2xl bg-white p-2 shadow-sm">
                    <div className="relative aspect-square overflow-hidden rounded-[18px] bg-slate-100">
                      <Image
                        src={brand.image}
                        alt={brand.name}
                        fill
                        sizes="96px"
                        className="object-contain p-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                ['12+', 'Services'],
                ['24/7', 'Support'],
                ['HTTPS', 'Secure']
              ].map(([value, label]) => (
                <div key={value} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-lg font-black text-navy-950">{value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="bg-[#fbfbfc] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Services"
          title="Every everyday payment service, presented clearly."
          body="Wigope Recharge keeps the public product surface simple: customers can discover services, understand support policies and move to the app for checkout."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topServices.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_24px_70px_rgba(255,107,19,0.14)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-orange-50">
                  <Image
                    src={service.icon}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </div>
                <ChevronRight className="mt-2 h-5 w-5 text-slate-300 transition group-hover:text-wigope-orange" />
              </div>
              <p className="mt-5 text-lg font-black tracking-[-0.03em] text-navy-950">{service.title}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{service.short}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-[30px] border border-orange-100 bg-white p-5 shadow-card">
          <div className="flex flex-wrap gap-3">
            {proofPoints.map((point) => (
              <span
                key={point}
                className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-navy-950"
              >
                <CheckCircle2 className="h-4 w-4 text-wigope-orange" />
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Rewards() {
  return (
    <section id="rewards" className="border-y border-slate-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Rewards marketplace"
          title="Gift cards, vouchers and OTT rewards for high-intent customers."
          body="A clean rewards marketplace layer for gift cards, OTT subscriptions and shopping vouchers powered by Hubble."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[32px] bg-navy-950 p-5 text-white shadow-[0_30px_90px_rgba(7,18,37,0.22)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-3xl font-black tracking-[-0.05em]">Gift cards & vouchers</p>
                <p className="mt-2 text-sm font-semibold text-slate-300">
                  Rewards and vouchers powered by Hubble.
                </p>
              </div>
              <Link
                href="/services/gift-cards"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-navy-950"
              >
                Explore
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {voucherBrands.map((brand) => (
                <BrandCard key={brand.name} name={brand.name} image={brand.image} label={brand.offer} />
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-[#fbfbfc] p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-wigope-orange">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-black tracking-[-0.04em] text-navy-950">OTT gift cards</p>
                <p className="text-sm font-semibold text-slate-600">Entertainment rewards in one view.</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {ottBrands.map((brand) => (
                <BrandCard key={brand.name} name={brand.name} image={brand.image} compact />
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-600">
              Gift card and OTT catalogue opens in a secure Wigope reward flow backed by Hubble.
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {rewardServices.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200"
            >
              <p className="text-lg font-black tracking-[-0.03em] text-navy-950">{service.title}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{service.short}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadApp() {
  return (
    <section id="download" className="bg-[#fbfbfc] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#e9fbff,#f3f0ff_55%,#fff1e8)] shadow-[0_36px_100px_rgba(15,23,42,0.12)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-wigope-orange shadow-sm">
                <Download className="h-4 w-4" />
                App download
              </p>
              <h2 className="mt-6 text-4xl font-black leading-tight tracking-[-0.05em] text-navy-950 sm:text-5xl">
                Start cashback, rewards and vouchers from the Wigope app.
              </h2>
              <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-slate-600">
                Install the Android app for login, wallet, recharge checkout, Hubble rewards and transaction history.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <span className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-navy-950 px-5 text-sm font-black text-white">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-navy-950">
                    <PlayStoreMark />
                  </span>
                  Get it on Google Play
                </span>
                <span className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-navy-950">
                  <QrCode className="h-5 w-5 text-wigope-orange" />
                  Scan QR to download
                </span>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-[1fr_170px] sm:items-center">
              <div className="relative min-h-[260px] overflow-hidden rounded-[30px] bg-white/50">
                <Image
                  src="/assets/showcase/download-icons.png"
                  alt="Wigope app rewards, vouchers and service icons"
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-contain p-4"
                  priority
                />
              </div>
              <div className="rounded-[28px] border border-white/80 bg-white p-5 text-center shadow-card">
                <div className="mx-auto grid h-32 w-32 place-items-center rounded-3xl bg-[linear-gradient(135deg,#fff7ed,#ffffff)]">
                  <QrCode className="h-20 w-20 text-navy-950" />
                </div>
                <p className="mt-4 text-sm font-black text-navy-950">Wigope Recharge app</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Scan after launch to open the official Android listing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomerJourney() {
  const steps = [
    ['Choose service', 'Pick recharge, bill payment, wallet or reward category.'],
    ['Confirm details', 'Review number, biller, amount and support policy before checkout.'],
    ['Track status', 'Use app history and support for confirmations, refunds and receipts.']
  ];

  return (
    <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Customer flow"
          title="Built for simple discovery and app-first checkout."
          body="The website stays clean for customers and partners. Secure transaction actions continue through protected Wigope backend flows."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(([title, body], index) => (
            <div key={title} className="rounded-[30px] border border-slate-200 bg-[#fbfbfc] p-6 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-wigope-orange text-lg font-black text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-navy-950">{title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PolicyLinks() {
  return (
    <section id="policies" className="bg-[#fbfbfc] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Customer policies"
          title="Recharge, wallet and rewards policies for customers."
          body="Clear public policies for customer data, recharge terms, refunds, complaints, KYC and secure payment handling."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {policies.map((policy) => (
            <Link
              key={policy.slug}
              href={`/policies/${policy.slug}`}
              className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200"
            >
              <ShieldCheck className="h-6 w-6 text-wigope-orange" />
              <h3 className="mt-4 text-lg font-black tracking-[-0.03em] text-navy-950">{policy.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{policy.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Support() {
  return (
    <section id="support" className="border-y border-slate-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-wigope-orange">Support</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-navy-950">
              Recharge support that is easy to find.
            </h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-slate-600">
              Contact Wigope for recharge status, failed payments, wallet reversals, voucher issues or complaint escalation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SupportCard
              icon={<MessageCircle className="h-6 w-6" />}
              title="WhatsApp"
              body={company.phone}
              href={company.whatsappUrl}
            />
            <SupportCard
              icon={<Mail className="h-6 w-6" />}
              title="Email"
              body={company.email}
              href={`mailto:${company.email}`}
            />
            <SupportCard
              icon={<Headphones className="h-6 w-6" />}
              title="Help"
              body="Recharge and rewards support"
              href="/policies/grievance-redressal"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-wigope-orange">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.055em] text-navy-950 sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base font-semibold leading-7 text-slate-600">{body}</p>
    </div>
  );
}

function BrandCard({
  name,
  image,
  label,
  compact = false
}: {
  name: string;
  image: string;
  label?: string;
  compact?: boolean;
}) {
  const targetHref = compact ? '/services/ott-vouchers' : '/services/gift-cards';

  return (
    <Link
      href={targetHref}
      className="group block rounded-[24px] bg-white/95 p-3 text-navy-950 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={`relative overflow-hidden rounded-[22px] bg-slate-100 ${compact ? 'aspect-[1.2/1]' : 'aspect-square'}`}>
        <Image
          src={image}
          alt={name}
          fill
          sizes={compact ? '180px' : '220px'}
          className="object-contain p-2"
        />
      </div>
      <p className="mt-3 text-base font-black tracking-[-0.03em]">{name}</p>
      {label ? <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p> : null}
    </Link>
  );
}

function SupportCard({
  icon,
  title,
  body,
  href
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-[28px] border border-slate-200 bg-[#fbfbfc] p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:bg-white"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-wigope-orange">
        {icon}
      </span>
      <p className="mt-4 text-lg font-black text-navy-950">{title}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{body}</p>
    </a>
  );
}

function PlayStoreMark() {
  return (
    <span className="relative block h-4 w-4">
      <span className="absolute inset-y-0 left-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-[#34a853]" />
      <span className="absolute left-[7px] top-[2px] h-3 w-3 rotate-45 rounded-[2px] bg-[#fbbc05]" />
      <span className="absolute left-[8px] top-[5px] h-2 w-2 rotate-45 rounded-[1px] bg-[#4285f4]" />
    </span>
  );
}
