'use client';
import { useEffect, useState } from 'react';

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

/**
 * Waits for window 'load' + preloads provided assets.
 * Guarantees a minimum visible duration so it doesn't flash too fast.
 */
export function usePagePreloader(options?: { assets?: string[]; minDurationMs?: number }) {
  const assets = options?.assets ?? [];
  const minDurationMs = options?.minDurationMs ?? 900;

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    const startedAt = performance.now();

    const onWindowLoad = new Promise<void>((resolve) => {
      if (typeof document !== 'undefined' && document.readyState === 'complete') return resolve();
      const cb = () => resolve();
      window.addEventListener('load', cb, { once: true });
    }).then(() => alive && setProgress((p) => Math.max(p, 0.3)));

    const unique = Array.from(new Set(assets.filter(Boolean)));
    let loaded = 0;
    const bump = () => {
      loaded += 1;
      if (!alive) return;
      const base = unique.length || 1;
      // 70% images, 30% window load
      setProgress((p) => Math.max(p, 0.7 * (loaded / base)));
    };

    const images = unique.map((u) => loadImage(u).then(bump));

    Promise.all([onWindowLoad, Promise.all(images)])
      .then(async () => {
        const elapsed = performance.now() - startedAt;
        const remain = Math.max(0, minDurationMs - elapsed);
        if (remain) await new Promise((r) => setTimeout(r, remain));
      })
      .then(() => {
        if (!alive) return;
        setProgress(1);
        setDone(true);
      });

    return () => { alive = false; };
  }, [assets.join('|'), minDurationMs]);

  return { progress: Math.min(1, progress), done } as const;
}
