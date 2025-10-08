import './globals.css';
import type { ReactNode } from 'react';
import ClientPreloaderShell from '@/components/ClientPreloaderShell';

export const metadata = { title: 'ScreamVision' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientPreloaderShell>
          {children}
        </ClientPreloaderShell>
      </body>
    </html>
  );
}
