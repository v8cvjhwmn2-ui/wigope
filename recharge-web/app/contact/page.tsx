import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { company } from '@/lib/site-content';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
          <div className="rounded-[42px] bg-[#0b101a] p-7 text-white shadow-[0_24px_110px_rgba(15,23,42,0.18)] sm:p-9">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-200">Contact Wigope</p>
            <h1 className="mt-4 text-5xl font-black leading-[0.96] tracking-[-0.07em] sm:text-6xl">Support for recharge, wallet and rewards.</h1>
            <p className="mt-5 text-base font-semibold leading-7 text-slate-300">
              Reach the Wigope team for customer help, partner review, app download support and transaction assistance.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                [Phone, company.phone, `tel:${company.phoneE164}`],
                [Mail, company.email, `mailto:${company.email}`],
                [MessageCircle, 'WhatsApp support', company.whatsappUrl]
              ].map(([Icon, label, href]) => (
                <Link key={String(label)} href={String(href)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-black">
                  <span className="flex items-center gap-3"><Icon className="h-5 w-5 text-wigope-orange" /> {String(label)}</span>
                  <Send className="h-4 w-4 text-white/50" />
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-[42px] border border-slate-200 bg-white p-7 shadow-[0_20px_90px_rgba(15,23,42,0.08)] sm:p-9">
            <MapPin className="h-9 w-9 text-wigope-orange" />
            <h2 className="mt-5 text-3xl font-black tracking-[-0.055em]">Company details</h2>
            <div className="mt-6 grid gap-4">
              {[
                ['Legal name', company.legalName],
                ['CIN', company.cin],
                ['Product', 'Wigope Recharge'],
                ['Primary support', company.email]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
