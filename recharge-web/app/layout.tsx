import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import '../styles/globals.css';
import { AppProviders } from '@/components/app-providers';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://recharge.wigope.com'),
  title: {
    default: 'Wigope Recharge',
    template: '%s | Wigope Recharge'
  },
  description: 'Mobile recharge, bill payments, wallet, rewards, and transactions by Wigope.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Wigope Recharge',
    statusBarStyle: 'default'
  },
  openGraph: {
    title: 'Wigope Recharge',
    description: 'Recharge, bill payments, wallet, and rewards in one premium Wigope app.',
    url: 'https://recharge.wigope.com',
    siteName: 'Wigope Recharge',
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  themeColor: '#ff6b13',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
        <Script id="pwa-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').catch(function () {});
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
