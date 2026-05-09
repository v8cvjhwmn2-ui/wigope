import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, MessageCircle, ShieldCheck } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { company, policies } from '@/lib/site-content';

type PageProps = {
  params: {
    slug: string;
  };
};

const policyBodies: Record<string, string[]> = {
  'privacy-policy': [
    'Wigope Recharge collects customer information only for account access, recharge processing, bill payments, wallet operations, support, fraud prevention and regulatory obligations.',
    'Mobile numbers, transaction references and support details are processed with access controls. Payment credentials are handled by authorized payment partners and are not stored by Wigope Recharge.',
    'Customer data is shared only with service providers, payment partners, reward partners, compliance authorities or support vendors where required to complete a customer request or meet legal obligations.',
    'Customers can request support for data correction, account queries and consent-related questions through support@wigope.com.'
  ],
  'terms-conditions': [
    'Wigope Recharge provides a digital platform for recharge, bill payment, wallet, gift card, voucher and reward journeys through integrated service providers.',
    'Customers must provide accurate mobile numbers, biller identifiers, consumer numbers and payment details. Incorrect information may lead to failed, delayed or irreversible transactions.',
    'All transactions are subject to operator, biller, payment gateway, reward partner and regulatory rules. Service availability can vary by provider, geography and maintenance windows.',
    'Wigope may pause, review or decline transactions where fraud, misuse, risk, incomplete KYC or policy violation is suspected.'
  ],
  'refund-cancellation': [
    'Successful recharge and bill payment transactions usually cannot be cancelled once submitted to the operator or biller.',
    'If a recharge, bill payment or wallet transaction fails and the amount is debited, Wigope will initiate reversal or refund handling according to provider confirmation and settlement timelines.',
    'Refunds may reflect in the original payment source, wallet or linked payment instrument depending on the transaction type and gateway/provider response.',
    'Customers should contact support with the transaction reference, mobile number or biller details for delayed refund assistance.'
  ],
  'grievance-redressal': [
    'Customers can raise service issues by email at support@wigope.com or WhatsApp support on +91 9568 654684.',
    'Include transaction ID, registered mobile number, amount, date and a short issue description so the support team can identify the transaction quickly.',
    'Escalations are reviewed with provider logs, payment status and reconciliation records. Resolution timelines depend on operator, biller and payment partner confirmation.',
    'Wigope maintains internal support records for audit, quality improvement and dispute handling.'
  ],
  'kyc-compliance': [
    'Where KYC is required, Wigope may collect PAN, Aadhaar-related masked information, business details, address proof or other documents required for verification.',
    'KYC information is used for identity verification, fraud control, account limits, regulatory checks and partner onboarding requirements.',
    'Sensitive documents are handled with restricted access and are retained only as long as needed for legal, operational or compliance purposes.',
    'Users must submit authentic documents. False or misleading information can result in account suspension or service restriction.'
  ],
  'security-policy': [
    'Wigope Recharge uses HTTPS-secured APIs, OTP based access, tokenized sessions and production monitoring for customer-facing flows.',
    'Payment processing is routed through authorized payment partners. Wigope does not ask customers to share OTPs, UPI PINs, card PINs or passwords with support agents.',
    'Customers should immediately report suspicious messages, unknown payment requests or unauthorized account activity to support@wigope.com.',
    'Security controls are reviewed as the platform evolves, including logging hygiene, access control and provider verification.'
  ],
  'aml-cft-policy': [
    'Wigope monitors platform activity for suspicious usage patterns, repeated failed attempts, unusual payment behavior and misuse of wallet or reward flows.',
    'Accounts or transactions may be paused for review where risk signals, regulatory requests or partner alerts require additional checks.',
    'Wigope cooperates with authorized agencies and regulated partners where legally required.',
    'Customers must not use the platform for prohibited, fraudulent or unlawful transactions.'
  ],
  'cookies-policy': [
    'Wigope Recharge uses essential cookies and local storage for login continuity, secure sessions, payment status and customer experience.',
    'Analytics or marketing technologies may be used only where permitted and configured according to consent and legal requirements.',
    'Blocking essential storage can affect login, customer account, payment and support experiences.',
    'Browser settings can be used to manage cookies, subject to the impact on platform functionality.'
  ]
};

export function generateStaticParams() {
  return policies.map((policy) => ({ slug: policy.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const policy = policies.find((item) => item.slug === params.slug);
  if (!policy) return {};
  return {
    title: `${policy.title} | Wigope Recharge`,
    description: policy.summary
  };
}

export default function PolicyPage({ params }: PageProps) {
  const policy = policies.find((item) => item.slug === params.slug);
  if (!policy) notFound();

  const body = policyBodies[policy.slug] ?? [policy.summary];

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <Link href="/#policies" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Policies
        </Link>
        <div className="mt-8 rounded-[40px] border border-slate-200 bg-white p-6 shadow-[0_24px_100px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-wigope-orange">{company.legalName}</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-6xl">{policy.title}</h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-600">{policy.summary}</p>
          <div className="mt-8 grid gap-5">
            {body.map((paragraph, index) => (
              <div key={paragraph} className="rounded-[26px] border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Section {index + 1}</p>
                <p className="mt-2 text-base font-semibold leading-8 text-slate-700">{paragraph}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 rounded-[28px] bg-[#101522] p-5 text-white sm:grid-cols-3">
            {[
              [ShieldCheck, 'HTTPS APIs'],
              [Mail, company.email],
              [MessageCircle, company.phone]
            ].map(([Icon, label]) => (
              <div key={String(label)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-black">
                <Icon className="h-5 w-5 text-wigope-orange" /> {String(label)}
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
