import Link from 'next/link';
import { Download, Headphones, Menu } from 'lucide-react';
import { WigopeLogo } from '@/components/wigope-logo';
import { company } from '@/lib/site-content';

const navItems = [
  { label: 'Services', href: '/#services' },
  { label: 'Gift Cards', href: '/#rewards' },
  { label: 'Download', href: '/#download' },
  { label: 'Policies', href: '/#policies' },
  { label: 'Support', href: '/#support' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-orange-100/70 bg-white/78 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-[28px] border border-orange-100/80 bg-white/92 px-4 py-3 shadow-[0_22px_70px_rgba(15,23,42,0.08)] sm:px-5">
          <a
            href={company.mainWebsite}
            aria-label="Open Wigope main website"
            className="flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 transition hover:bg-orange-50"
          >
            <WigopeLogo />
            <span className="hidden text-sm font-black tracking-[-0.02em] text-slate-950 sm:inline">
              Recharge
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-extrabold text-slate-600 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-wigope-orange">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={company.whatsappUrl}
              className="hidden h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 shadow-sm transition hover:border-orange-200 hover:text-wigope-orange md:inline-flex"
            >
              <Headphones className="h-4 w-4" />
              Help
            </a>
            <Link
              href="/login"
              className="hidden h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-black leading-[44px] text-slate-950 shadow-sm transition hover:border-orange-200 hover:text-wigope-orange sm:inline-block"
            >
              Login
            </Link>
            <a
              href="/#download"
              className="hidden h-11 items-center gap-2 rounded-full bg-wigope-orange px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(255,107,19,0.25)] transition hover:bg-wigope-orangeDark sm:inline-flex"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <button
              type="button"
              aria-label="Open menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
