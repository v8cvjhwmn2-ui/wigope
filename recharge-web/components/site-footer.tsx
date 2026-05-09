import Link from 'next/link';
import { ExternalLink, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { WigopeLogo } from '@/components/wigope-logo';
import { company } from '@/lib/site-content';

const companyLinks = [
  { label: 'About Wigope', href: company.mainWebsite },
  { label: 'Privacy Policy', href: '/policies/privacy-policy' },
  { label: 'Terms & Conditions', href: '/policies/terms-conditions' },
  { label: 'Refund Policy', href: '/policies/refund-cancellation' },
  { label: 'Grievance Redressal Policy', href: '/policies/grievance-redressal' },
  { label: 'AML / CFT Policy', href: '/policies/aml-cft-policy' }
];

const productLinks = [
  { label: 'Mobile Recharge', href: '/services/mobile-recharge' },
  { label: 'DTH Recharge', href: '/services/dth-recharge' },
  { label: 'FASTag Recharge', href: '/services/fastag-recharge' },
  { label: 'Electricity Bill', href: '/services/electricity-bill' },
  { label: 'Gift Cards & Vouchers', href: '/services/gift-cards' },
  { label: 'OTT Vouchers', href: '/services/ott-vouchers' }
];

const panelLinks = [
  { label: 'Download App', href: '/#download' },
  { label: 'Recharge Services', href: '/#services' },
  { label: 'Rewards', href: '/#rewards' },
  { label: 'Support', href: '/#support' }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.85fr_0.85fr_0.75fr_0.95fr]">
          <div>
            <a href={company.mainWebsite} aria-label="Open Wigope main website" className="inline-flex">
              <WigopeLogo />
            </a>
            <p className="mt-6 max-w-sm text-sm font-semibold leading-7 text-slate-600">
              Wigope Recharge helps customers access mobile recharge, utility bill payments,
              wallet topups, gift cards and rewards through a clean Wigope product experience.
            </p>
          </div>

          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Products" links={productLinks} />
          <FooterColumn title="Quick Links" links={panelLinks} />

          <div>
            <h3 className="text-lg font-black tracking-[-0.02em] text-slate-950">Get in Touch</h3>
            <div className="mt-5 space-y-4 text-sm font-semibold text-slate-600">
              <a className="flex items-center gap-3 transition hover:text-wigope-orange" href={`mailto:${company.email}`}>
                <Mail className="h-4 w-4" />
                {company.email}
              </a>
              <a className="flex items-center gap-3 transition hover:text-wigope-orange" href={`tel:+${company.phoneE164}`}>
                <Phone className="h-4 w-4" />
                {company.phone}
              </a>
              <a className="flex items-center gap-3 transition hover:text-wigope-orange" href={company.whatsappUrl}>
                <MessageCircle className="h-4 w-4" />
                WhatsApp support
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-slate-200 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm font-black text-slate-500">
            <span className="rounded-full bg-slate-100 px-4 py-2">DPIIT #startupindia</span>
            <span className="rounded-full bg-slate-100 px-4 py-2">UPI ready</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Secure payments
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2">CIN {company.cin}</span>
          </div>
          <div className="flex gap-5 text-sm font-semibold text-slate-500">
            <Link href="/policies/cookies-policy" className="hover:text-wigope-orange">
              Cookies Policy
            </Link>
            <Link href="/#services" className="hover:text-wigope-orange">
              Sitemap
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-xs font-semibold leading-6 text-slate-500">
            © 2026 WIGOPE | {company.legalName}. Wigope Recharge operates as a technology
            platform for recharge, bill payment, wallet and reward access through integrated
            payment, operator and rewards partners. Wigope is not a bank. Payment, recharge
            and voucher fulfilment are subject to provider confirmation, reconciliation and
            applicable customer terms.
          </p>
        </div>
      </div>

      <a
        href={company.whatsappUrl}
        aria-label="Chat with Wigope on WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid h-16 w-16 place-items-center rounded-full bg-[#37c965] text-white shadow-[0_18px_40px_rgba(55,201,101,0.35)] transition hover:scale-105"
      >
        <MessageCircle className="h-8 w-8" />
      </a>
    </footer>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-lg font-black tracking-[-0.02em] text-slate-950">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => {
          const isExternal = link.href.startsWith('http');
          const className = 'inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-wigope-orange';
          return (
            <li key={link.href}>
              {isExternal ? (
                <a href={link.href} className={className}>
                  {link.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link href={link.href} className={className}>
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
