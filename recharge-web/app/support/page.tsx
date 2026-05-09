import Link from 'next/link';
import { AlertCircle, Mail, MessageCircle, Phone, RefreshCcw, ShieldCheck } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { company } from '@/lib/site-content';

const supportTopics = [
  ['Failed recharge', 'Share transaction reference and mobile number for status review.', RefreshCcw],
  ['Wallet or payment issue', 'Send the order ID, amount and payment time for support.', ShieldCheck],
  ['Gift card or voucher', 'Mention the brand, amount and reward session reference if available.', AlertCircle]
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="rounded-[44px] bg-white p-6 shadow-[0_24px_100px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-wigope-orange">Customer support</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.07em] sm:text-7xl">Help for every recharge journey.</h1>
          <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-slate-600">
            Wigope support is available for recharge, bill payment, wallet, refund and reward questions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={company.whatsappUrl} className="inline-flex items-center gap-2 rounded-full bg-[#18b96f] px-6 py-3 text-sm font-black text-white">
              <MessageCircle className="h-4 w-4" /> WhatsApp support
            </Link>
            <Link href={`mailto:${company.email}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-black text-slate-800">
              <Mail className="h-4 w-4" /> Email support
            </Link>
            <Link href={`tel:${company.phoneE164}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-black text-slate-800">
              <Phone className="h-4 w-4" /> Call support
            </Link>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {supportTopics.map(([title, body, Icon]) => (
              <div key={String(title)} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <Icon className="h-7 w-7 text-wigope-orange" />
                <h2 className="mt-4 text-xl font-black">{String(title)}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{String(body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
