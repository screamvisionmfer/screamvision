'use client';
import React from 'react';
import PreloaderOverlay from '@/components/PreloaderOverlay';
import { usePagePreloader } from '@/src/hooks/usePagePreloader';

type Props = {
  children: React.ReactNode;
  assets?: string[];
  minDurationMs?: number;
  brand?: string;
};

export default function ClientPreloaderShell({ children, assets = [], minDurationMs = 900, brand = '' }: Props) {
  const { progress, done } = usePagePreloader({ assets, minDurationMs });
  return (
    <>
      <PreloaderOverlay done={done} progress={progress} brand={brand} />
      <div style={{ opacity: done ? 1 : 0, transition: 'opacity .45s ease-out' }}>{children}</div>
    </>
  );
}
