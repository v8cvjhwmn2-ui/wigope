'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BookOpen,
  Building2,
  Cable,
  Car,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Download,
  Droplets,
  Flame,
  Gift,
  GraduationCap,
  Headphones,
  HeartHandshake,
  Home,
  Landmark,
  LifeBuoy,
  LockKeyhole,
  Menu,
  MessageCircle,
  Phone,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TicketPercent,
  WalletCards,
  X,
  Zap
} from 'lucide-react';
import { WigopeLogo } from '@/components/wigope-logo';

const nav = ['Home', 'About', 'Services', 'Rewards', 'Wallet', 'Support', 'Contact'];

const services = [
  ['Mobile Recharge', Smartphone, '3.8% rewards'],
  ['DTH Recharge', Cable, '4.1% rewards'],
  ['FASTag', Car, '2% rewards'],
  ['Electricity', Zap, 'Instant bills'],
  ['Water', Droplets, 'BBPS ready'],
  ['Gas', Flame, 'Fast payments'],
  ['Broadband', WifiIcon, 'Live bills'],
  ['Credit Card', CreditCard, 'Secure'],
  ['Insurance', ShieldCheck, 'Track dues'],
  ['Loan EMI', Landmark, 'On time'],
  ['OTT', TicketPercent, 'Gift pass'],
  ['Gift Cards', Gift, 'Hubble'],
  ['Municipal', Building2, 'Utility'],
  ['Education Fees', GraduationCap, 'Receipts'],
  ['Housing Society', Home, 'Collections'],
  ['NPS', CircleDollarSign, 'Savings'],
  ['EV Recharge', Car, 'Future ready'],
  ['Hubble Rewards', Sparkles, '500+ brands'],
  ['Wallet', WalletCards, 'Razorpay'],
  ['Refer & Earn', HeartHandshake, 'Chain rewards']
] as const;

const kpis = [
  ['99.9', '%', 'Success Rate', BadgeCheck],
  ['0', ' sec', 'Instant Recharge', Zap],
  ['Live', '', 'Cashback', TicketPercent],
  ['256', '-bit', 'Secure Payments', LockKeyhole],
  ['500', '+', 'Hubble Rewards', Gift],
  ['24/7', '', 'Support', Headphones],
  ['Razorpay', '', 'Secured', ShieldCheck],
  ['Instant', '', 'Confirmation', ReceiptText]
] as const;

const rewards = [
  ['Amazon', '/assets/brands/voucher_amazon_new.png'],
  ['Flipkart', '/assets/brands/voucher_flipkart_new.png'],
  ['Myntra', '/assets/brands/voucher_myntra_new.png'],
  ['Zomato', '/assets/brands/voucher_zomato_new.png'],
  ['Swiggy', '/assets/brands/voucher_swiggy_new.png'],
  ["Domino's", '/assets/brands/voucher_dominos_new.png'],
  ['Prime', '/assets/brands/ott_prime.png'],
  ['Hotstar', '/assets/brands/ott_hotstar.png']
];

const features = [
  ['Wallet System', WalletCards],
  ['Razorpay Add Money', CreditCard],
  ['Live Transactions', ReceiptText],
  ['Instant Refund Tracking', BadgeCheck],
  ['Transaction Receipts', BookOpen],
  ['Rewards Engine', Gift],
  ['Referral System', HeartHandshake],
  ['Notifications', BellRing],
  ['OTP Login', Smartphone],
  ['Secure APIs', LockKeyhole],
  ['Multi-service Platform', Sparkles]
] as const;

const faqs = [
  ['How to create account?', 'Open Wigope Recharge, enter your mobile number, verify OTP, and your secure wallet profile is created automatically.'],
  ['How recharge works?', 'Choose a service, enter the number or biller details, confirm amount, pay from wallet or gateway, and get instant status updates.'],
  ['Failed recharge refund?', 'Failed transactions are tracked and eligible wallet debits are refunded back through the Wigope ledger workflow.'],
  ['Wallet safety?', 'Wallet and session flows use token-based authentication, Razorpay payments, secure APIs, and live transaction logs.'],
  ['Cashback process?', 'Eligible recharge, wallet, and reward campaigns credit cashback according to active Wigope offers.'],
  ['Hubble rewards?', 'Wigope connects to Hubble Rewards for gift cards, vouchers, OTT brands, and reward marketplace sessions.'],
  ['Is Wigope secure?', 'The production frontend uses HTTPS APIs, protected sessions, secure payment partners, and server-side validation.'],
  ['How to contact support?', 'Use WhatsApp, email, support tickets, or live status from the support section below.']
];

export default function LandingPage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-navy-950">
      <Header open={openMenu} setOpen={setOpenMenu} />
      <Hero />
      <Services />
      <WhyWigope />
      <HowItWorks />
      <Rewards />
      <Features />
      <DownloadSection />
      <Support />
      <FAQ openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <Footer />
      <FloatingSupport />
    </main>
  );
}

function Header({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-white/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <WigopeLogo />
          <span className="hidden text-sm font-black uppercase tracking-[0.18em] text-navy-900 sm:inline">Recharge</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-extrabold text-slate-600 transition hover:text-wigope-orange">
              {item}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="rounded-full border border-wigope-line bg-white px-5 py-3 text-sm font-black text-navy-900 shadow-sm">
            Login
          </Link>
          <a href="#download" className="rounded-full bg-wigope-orange px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25">
            Download App
          </a>
        </div>
        <button className="rounded-2xl border border-wigope-line bg-white p-3 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border-t border-wigope-line bg-white px-4 py-5 lg:hidden">
          <div className="grid gap-3">
            {nav.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setOpen(false)} className="rounded-2xl bg-slate-50 px-4 py-3 font-black">
                {item}
              </a>
            ))}
            <Link href="/login" className="rounded-2xl bg-wigope-orange px-4 py-3 text-center font-black text-white">
              Login / Start Recharge
            </Link>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-navy-950 pt-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,107,0,0.35),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.16),transparent_20%)]" />
      <div className="absolute inset-0 app-grid opacity-20" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-black text-orange-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
            Live recharge infrastructure active
          </div>
          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.07em] sm:text-6xl lg:text-7xl">
            India&apos;s smarter recharge & bill payments platform
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-300">
            Recharge mobiles, DTH, FASTag, electricity, broadband, gas, water, insurance and more in seconds with instant confirmations and rewards.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-wigope-orange px-7 font-black text-white shadow-2xl shadow-orange-500/30">
              Start Recharge <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#download" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-7 font-black text-white backdrop-blur">
              Download App <Download className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-9 grid grid-cols-3 gap-3 max-w-xl">
            <TrustPill label="99.9%" value="Success rate" />
            <TrustPill label="Live" value="Cashback" />
            <TrustPill label="Hubble" value="Rewards" />
          </div>
        </motion.div>
        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative">
      <div className="absolute -inset-8 rounded-[46px] bg-wigope-orange/20 blur-3xl" />
      <div className="relative rounded-[42px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
        <div className="rounded-[32px] bg-white p-5 text-navy-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-wigope-orange">Live recharge</p>
              <h3 className="mt-1 text-2xl font-black">Jio prepaid</h3>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-600">Success</div>
          </div>
          <div className="mt-5 rounded-[28px] bg-gradient-to-br from-orange-50 to-white p-5">
            <p className="text-sm font-bold text-slate-500">Amount</p>
            <p className="text-6xl font-black tracking-[-0.08em]">₹299</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-black text-emerald-600">
              <BadgeCheck className="h-5 w-5" />
              Cashback unlocked
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['FASTag', Car],
              ['DTH', Cable],
              ['Wallet', WalletCards]
            ].map(([label, Icon]) => (
              <div key={String(label)} className="rounded-3xl border border-wigope-line p-3 text-center">
                <Icon className="mx-auto h-6 w-6 text-wigope-orange" />
                <p className="mt-2 text-xs font-black">{String(label)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FloatCard className="-left-4 top-8" title="₹7 referral" icon={<HeartHandshake />} />
      <FloatCard className="-right-2 bottom-14" title="Instant receipt" icon={<ReceiptText />} />
    </motion.div>
  );
}

function Services() {
  return (
    <Section id="services" eyebrow="Live Services" title="Everything users recharge, pay, and redeem in one premium flow">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {services.map(([label, Icon, badge], index) => (
          <Reveal key={label} delay={index * 0.025}>
            <Link href="/login" className="group block rounded-[28px] border border-wigope-line bg-white p-4 shadow-card transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-wigope-orange transition group-hover:bg-wigope-orange group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 font-black tracking-[-0.02em]">{label}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{badge}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function WhyWigope() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-wigope-orange">Why Wigope</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-5xl">Built like a fintech control room, designed like a consumer app.</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map(([value, suffix, label, Icon], index) => (
            <Reveal key={label} delay={index * 0.04}>
              <div className="rounded-[30px] border border-wigope-line bg-[#fbfcff] p-5 shadow-card">
                <Icon className="h-7 w-7 text-wigope-orange" />
                <p className="mt-5 text-3xl font-black tracking-[-0.05em]">
                  {Number.isFinite(Number(value)) ? <Counter value={Number(value)} /> : value}
                  {suffix}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ['Login with OTP', 'Secure mobile-first session with production Wigope auth.', Smartphone],
    ['Add money / choose service', 'Use wallet, Razorpay topup, or pick a live bill service.', WalletCards],
    ['Recharge & earn rewards', 'Instant status, receipts, cashback and Hubble reward access.', Sparkles]
  ] as const;
  return (
    <Section id="wallet" eyebrow="How it works" title="Three steps from login to confirmation">
      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map(([title, body, Icon], index) => (
          <Reveal key={title} delay={index * 0.08}>
            <div className="relative rounded-[34px] border border-wigope-line bg-white p-6 shadow-card">
              <div className="absolute right-6 top-6 text-6xl font-black text-orange-50">0{index + 1}</div>
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-950 text-white">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="relative mt-8 text-2xl font-black">{title}</h3>
              <p className="relative mt-3 font-semibold leading-7 text-slate-600">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Rewards() {
  return (
    <section id="rewards" className="relative overflow-hidden bg-navy-950 py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,107,0,0.28),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-200">Powered by Hubble</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-5xl">Rewards marketplace that feels built into Wigope.</h2>
            <p className="mt-4 text-lg font-semibold text-slate-300">Gift cards, OTT rewards, cashback banners, coins and voucher flows through live Hubble sessions.</p>
          </div>
          <Link href="/rewards" className="inline-flex h-14 items-center justify-center rounded-full bg-white px-6 font-black text-navy-950">
            Open Rewards
          </Link>
        </div>
        <div className="hide-scrollbar mt-10 flex gap-4 overflow-x-auto pb-4">
          {rewards.map(([name, src], index) => (
            <motion.div key={name} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} className="min-w-[150px]">
              <div className="relative aspect-square overflow-hidden rounded-[32px] bg-white/10 shadow-2xl">
                <Image src={src} alt={name} fill className="object-cover" />
              </div>
              <p className="mt-3 text-center font-black">{name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <Section id="features" eyebrow="Platform Features" title="The operating layer for recharge, wallet, rewards, and support">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(([label, Icon], index) => (
          <Reveal key={label} delay={index * 0.035}>
            <div className="flex items-center gap-4 rounded-[26px] border border-wigope-line bg-white p-4 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-wigope-orange">
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-black">{label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function DownloadSection() {
  return (
    <section id="download" className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-wigope-orange">Download App</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-5xl">Install Wigope Recharge as a premium PWA.</h2>
          <p className="mt-4 text-lg font-semibold leading-8 text-slate-600">Use the Android app experience, add to home screen, and keep wallet, rewards, notifications, and transactions one tap away.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-14 items-center justify-center rounded-full bg-wigope-orange px-7 font-black text-white">
              Launch Web App
            </Link>
            <button className="inline-flex h-14 items-center justify-center rounded-full border border-wigope-line bg-white px-7 font-black">
              Android APK Soon
            </button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-8 rounded-full bg-wigope-orange/20 blur-3xl" />
          <div className="relative rounded-[46px] border-[10px] border-navy-950 bg-white p-5 shadow-2xl">
            <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-slate-200" />
            <div className="rounded-[32px] bg-gradient-to-br from-orange-50 to-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-wigope-orange">Available balance</p>
              <p className="mt-3 text-6xl font-black tracking-[-0.08em]">₹0</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {['Add', 'Bills', 'Gift'].map((item) => (
                  <div key={item} className="rounded-2xl bg-white p-3 text-center shadow-card">
                    <p className="text-xs font-black">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-[26px] border border-dashed border-wigope-line p-5 text-center">
              <div className="mx-auto grid h-24 w-24 grid-cols-4 gap-1 rounded-2xl bg-navy-950 p-3">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className={`rounded-sm ${i % 3 === 0 ? 'bg-wigope-orange' : 'bg-white'}`} />
                ))}
              </div>
              <p className="mt-3 text-xs font-black uppercase text-slate-500">QR placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Support() {
  const cards = [
    ['WhatsApp Support', MessageCircle],
    ['Email Support', MailIcon],
    ['Live Status', BadgeCheck],
    ['Ticket Support', LifeBuoy]
  ] as const;
  return (
    <Section id="support" eyebrow="Support" title="Fast help when money, status, or rewards matter">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, Icon]) => (
          <div key={label} className="rounded-[30px] border border-wigope-line bg-white p-6 shadow-card">
            <Icon className="h-8 w-8 text-wigope-orange" />
            <h3 className="mt-5 text-xl font-black">{label}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">Priority assistance for Wigope users.</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQ({ openFaq, setOpenFaq }: { openFaq: number; setOpenFaq: (index: number) => void }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-black uppercase tracking-[0.24em] text-wigope-orange">FAQ</p>
        <h2 className="mt-4 text-center text-4xl font-black tracking-[-0.06em]">Questions users ask before their first recharge</h2>
        <div className="mt-10 space-y-3">
          {faqs.map(([q, a], index) => (
            <button key={q} onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="w-full rounded-[26px] border border-wigope-line bg-white p-5 text-left shadow-card">
              <span className="flex items-center justify-between gap-4">
                <span className="text-lg font-black">{q}</span>
                <ChevronDown className={`h-5 w-5 transition ${openFaq === index ? 'rotate-180 text-wigope-orange' : ''}`} />
              </span>
              <motion.span initial={false} animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }} className="block overflow-hidden">
                <span className="block pt-3 font-semibold leading-7 text-slate-600">{a}</span>
              </motion.span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <WigopeLogo />
          <p className="mt-5 max-w-sm font-semibold leading-7 text-slate-400">Wigope Recharge is a premium fintech recharge, wallet, bill payment and rewards web app connected to Wigope production APIs.</p>
          <p className="mt-5 text-sm font-black text-wigope-orange">API Status · Live</p>
        </div>
        <FooterList title="Services" items={['Mobile Recharge', 'DTH', 'FASTag', 'Electricity', 'Wallet', 'Rewards']} />
        <FooterList title="Important Links" items={['About', 'Support', 'Privacy', 'Terms', 'Contact', 'Download App']} />
        <FooterList title="Contact Details" items={['support@wigope.com', 'WhatsApp Support', 'Ticket Support', 'recharge.wigope.com']} />
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-sm font-bold text-slate-500">
        Wigope Technologies Pvt Ltd · Built for India
      </div>
    </footer>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-wigope-orange">{eyebrow}</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-5xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.45, delay }}>
      {children}
    </motion.div>
  );
}

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1200, bounce: 0 });
  const rounded = useTransform(spring, (latest) => (value % 1 ? latest.toFixed(1) : Math.round(latest).toString()));

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

function TrustPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
      <p className="text-xl font-black">{label}</p>
      <p className="text-xs font-bold text-slate-300">{value}</p>
    </div>
  );
}

function FloatCard({ className, title, icon }: { className: string; title: string; icon: React.ReactNode }) {
  return (
    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className={`absolute hidden rounded-2xl border border-white/15 bg-white/15 px-4 py-3 text-sm font-black text-white shadow-2xl backdrop-blur lg:flex ${className}`}>
      <span className="mr-2 text-wigope-orange">{icon}</span>
      {title}
    </motion.div>
  );
}

function FloatingSupport() {
  return (
    <a href="#support" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-wigope-orange text-white shadow-2xl shadow-orange-500/30">
      <Headphones className="h-6 w-6" />
    </a>
  );
}

function FooterList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-black">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <a key={item} href="#" className="text-sm font-semibold text-slate-400 transition hover:text-white">
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

function WifiIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Phone {...props} />;
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return <MessageCircle {...props} />;
}
