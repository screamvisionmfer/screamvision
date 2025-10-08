'use client';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import MediaBackground from './MediaBackground';
import type { Dispatch, SetStateAction } from 'react';
import type { PackMeta } from '@/lib/packs';

interface Props {
  index: number;
  activeIndex: number | null;
  setActive: Dispatch<SetStateAction<number | null>>;
  data: PackMeta;
}

const easeSoft = [0.45, 0, 0.2, 1];

const overlayVariants = {
  hidden: { opacity: 0, transition: { when: 'afterChildren' } },
  visible: {
    opacity: 1,
    transition: { when: 'beforeChildren', staggerChildren: 0.12, ease: easeSoft, duration: 0.5 }
  }
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { ease: easeSoft, duration: 0.45 } }
};

type Ripple = { id: number; x: number; y: number };

export default function BannerPanel({ index, activeIndex, setActive, data }: Props) {
  const isActive = activeIndex === index;

  // ---- device/adaptive flags (мобильные/планшеты и reduced motion) ----
  const isCoarse = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
    []
  );
  const prefersReduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const lite = isCoarse || prefersReduced; // "облегчённый" режим анимаций

  // ---- tilt + glints (остаются только на десктопе) ----
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 16, mass: 0.9 });
  const sry = useSpring(ry, { stiffness: 220, damping: 16, mass: 0.9 });

  const glintX = useTransform(sry, [-12, 12], ['20%', '80%']);
  const glintY = useTransform(srx, [-12, 12], ['30%', '70%']);
  const sheenX = useTransform(sry, [-12, 12], ['-10%', '110%']);

  const finePointer = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches,
    []
  );
  const panelRef = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!finePointer || !isActive) return;
    const rect = (panelRef.current ?? e.currentTarget).getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const MAX = 12;
    ry.set((px - 0.5) * MAX * 2 * 0.8);
    rx.set(-(py - 0.5) * MAX * 2 * 0.8);
  }
  function onLeave() {
    rx.set(0); ry.set(0);
    setActive(null);
  }

  // ---- ripple (лёгкий эффект, можно оставить) ----
  const [ripples, setRipples] = useState<Ripple[]>([]);
  function spawnRipple(e: React.MouseEvent<HTMLDivElement>) {
    const rect = (panelRef.current ?? e.currentTarget).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 650);
  }

  // ---- GPU compositing hints (снимают мерцание на iOS/Android) ----
  const gpuHint = {
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    willChange: 'transform' as const,
  };

  return (
    <motion.article
      ref={panelRef}
      onMouseEnter={() => setActive(index)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={(e) => { setActive(isActive ? null : index); spawnRipple(e); }}
      className="group relative flex overflow-hidden rounded-xl bg-brand-card cursor-pointer
                 ring-1 ring-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                 h-full"
      animate={{ flex: isActive ? 7 : 1 }}
      transition={{ type: 'tween', duration: 0.65, ease: easeSoft }}
      whileTap={{ scale: 0.99 }}
      style={{ minWidth: 0, ...gpuHint }}
    >
      {/* BACKGROUND
         Lite: без бесконечного "дрейфа", без filter: grayscale (он рябит на мобилках).
         Desktop: оставляем дрейф + grayscale для неактивных. */}
      <motion.div
        className={[
          'absolute inset-0 overflow-hidden will-change-transform',
          !lite && !isActive ? 'filter grayscale contrast-90 saturate-50' : 'filter-none',
          'transition-[filter] duration-500 ease-out'
        ].join(' ')}
        initial={false}
        animate={
          isActive
            ? (lite ? { scale: 1.12, x: 0, y: 0 } : { scale: 1.5, x: 0, y: 0 })
            : (lite ? { scale: 1.06, x: 0, y: 0 } : { scale: 1.2, x: [-8, 8, -8], y: [-6, 6, -6] })
        }
        transition={
          lite
            ? { type: 'tween', duration: 0.6, ease: easeSoft }
            : isActive
              ? { type: 'tween', duration: 0.85, ease: easeSoft }
              : { duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
        }
        style={{ transformOrigin: '50% 50%', ...gpuHint }}
      >
        <MediaBackground data={data} isActive={!!isActive} index={index} />
      </motion.div>

      {/* Доп. «приглушение» вместо grayscale на тач-устройствах (дешево по GPU) */}
      {!lite && null}
      {lite && !isActive && (
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
      )}

      {/* рамка/виньетки */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/35 to-transparent" />
      <div className="absolute inset-0 bg-black/18" />

   

      {/* PACK (с лёгким снижением «бампа» в lite-режиме) */}
      <motion.div
        className="relative z-20 flex items-center justify-center w-full"
        initial={false}
        animate={isActive
          ? { y: 0, opacity: 1, scale: lite ? 1.005 : 1.02 }
          : { y: lite ? 8 : 24, opacity: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18, mass: 0.9 }}
        style={{ transformStyle: 'preserve-3d', transformPerspective: '1200px', rotateX: srx, rotateY: sry, ...gpuHint }}
      >
        {/* динамическая тень */}
        {!lite && (
          <motion.div
            className="absolute bottom-[12%] h-[16%] w-[42%] rounded-[999px] bg-black/70 blur-xl opacity-70"
            style={{ x: useTransform(sry, [-12, 12], [-12, 12]) }}
          />
        )}

        {/* glints */}
        {!lite && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen"
              style={{
                ['--mx' as any]: glintX,
                ['--my' as any]: glintY,
                background:
                  'radial-gradient(60% 120% at var(--mx) var(--my), rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)'
              }}
            />
            <motion.div
              className="pointer-events-none absolute h-[140%] w-[35%] -skew-x-12 rotate-[18deg] opacity-30 mix-blend-screen"
              style={{
                x: sheenX,
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 70%)'
              }}
            />
          </>
        )}

        <div className="relative h-full w-full flex items-center justify-center p-2 sm:p-3 md:p-6">
          <Image
            src={data.packImage}
            alt={data.name + ' pack'}
            width={520}
            height={780}
            className="h-[66%] sm:h-[70%] md:h-[62%] w-auto select-none"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />

          {/* ripples */}
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              className="pointer-events-none absolute rounded-full"
              style={{ left: r.x, top: r.y, width: 1, height: 1, transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0.28, scale: 0 }}
              animate={{ opacity: 0, scale: 120 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="block w-40 h-40 rounded-full"
                style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.35), rgba(255,255,255,0))' }}
              />
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* overlay text */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-30 px-4 md:px-6 pb-6 pt-24 md:pt-24"
        variants={overlayVariants}
        initial={false}
        animate={isActive ? 'visible' : 'hidden'}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

        <motion.div className="max-w-[85%] md:max-w-[70%]" variants={fadeUp}>
          {data.titleImage ? (
            <Image src={data.titleImage} alt={data.name} width={800} height={300} className="w-auto h-14 md:h-16" />
          ) : (
            <h3 className="font-display text-2xl md:text-4xl tracking-tight">{data.name}</h3>
          )}
        </motion.div>

        <motion.div className="mt-2" variants={fadeUp}>
          <p className="text-sm md:text-base text-white/90 max-w-[60ch]">{data.description}</p>
          {data.tags?.length ? (
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] md:text-xs text-white/70 uppercase tracking-wide">
              {data.tags.map((t) => (
                <span key={t} className="px-2 py-1 bg-white/10 rounded-md border border-white/10">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </motion.div>

        <motion.div className="mt-4" variants={fadeUp}>
          <a
            href={data.marketUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open ${data.name} on VibeMarket`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md
                       bg-brand-accent text-black font-semibold uppercase tracking-wide
                       hover:translate-y-[-1px] active:translate-y-0 transition"
          >
            Buy on VibeMarket
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Z" />
              <path d="M5 5h5V3H3v7h2V5Z" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}
