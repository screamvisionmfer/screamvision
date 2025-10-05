'use client';
import React, { useCallback, useState } from 'react';
import PreloaderOverlayPro from '@/components/PreloaderOverlayPro';
import { usePagePreloader } from '@/src/hooks/usePagePreloader';
import { PreloaderProvider } from '@/src/providers/PreloaderContext';

type Props = {
  children: React.ReactNode;
  assets?: string[];
  minDurationMs?: number;
  brand?: string;
  firstVisitOnly?: boolean;
};

export default function ClientPreloaderShell({
  children,
  assets = [],
  minDurationMs = 1000,
  brand = '',
  firstVisitOnly = false,
}: Props) {
  const skipKey = 'sv:preloader:seen';
  const [skipped, setSkipped] = useState<boolean>(
    () => firstVisitOnly && typeof window !== 'undefined' && sessionStorage.getItem(skipKey) === '1'
  );

  const { progress, done } = usePagePreloader({ assets, minDurationMs });

  const handleSkip = useCallback(() => {
    setSkipped(true);
    try { if (firstVisitOnly) sessionStorage.setItem(skipKey, '1'); } catch { }
  }, [firstVisitOnly]);

  const isDone = skipped || done;

  return (
    <PreloaderProvider value={{ done: isDone }}>
      <PreloaderOverlayPro done={isDone} progress={progress} brand={brand} onSkip={handleSkip} />
      {/* показываем контент, но саму анимацию запускает BannerRail в момент done=true */}
      <div style={{ opacity: isDone ? 1 : 0, transition: 'opacity .45s ease-out' }}>
        {children}
      </div>
    </PreloaderProvider>
  );
}
