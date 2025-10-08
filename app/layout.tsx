import './globals.css';
import type { ReactNode } from 'react';
import ClientPreloaderShell from '@/components/ClientPreloaderShell';

export const metadata = { title: 'ScreamVision' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] overflow-hidden bg-black antialiased">
        <ClientPreloaderShell>
          {children}
        </ClientPreloaderShell>
      </body>
    </html>
  );
}
