import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wigope Pay — Admin',
  description: 'Operator panel for Wigope Pay',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-soft text-ink-primary">{children}</body>
    </html>
  );
}
