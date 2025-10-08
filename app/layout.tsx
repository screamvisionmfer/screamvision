import './globals.css';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import ClientPreloaderShell from '@/components/ClientPreloaderShell';

export const metadata = { title: 'ScreamVision' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="w-full h-full">
      <body className="w-full min-h-dvh overflow-hidden bg-black antialiased">
        {/* Провайдер даёт useStarted() и управляет прелоадером */}
        <ClientPreloaderShell>
          <Header />
          {children}
        </ClientPreloaderShell>
      </body>
    </html>
  );
}
