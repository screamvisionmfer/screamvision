import './globals.css';
import type { ReactNode } from 'react';
import Header from '@/components/Header';

export const metadata = { title: 'ScreamVision' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />         {/* фиксированный, поверх всего */}
        <main className="min-h-dvh">{children}</main>  {/* НИКАКИХ pt/offset */}
      </body>
    </html>
  );
}
