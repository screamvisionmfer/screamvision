'use client';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMemo, useRef } from 'react';
import MediaBackground from './MediaBackground';
import type { Dispatch, SetStateAction } from 'react';
import type { PackMeta } from '@/lib/packs';

interface Props {
  index: number;
  activeIndex: number | null;
  setActive: Dispatch<SetStateAction<number | null>>;
  data: PackMeta;
}

const easeSoft = [0.45, 0, 0.2, 1]; // плавная кривая (easeInOut)

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

export default function BannerPanel({ index, activeIndex, setActive, data }: Props) {
  const isActive = activeIndex === index;

  // --- Tilt: целевые значения (MotionValue) + "инерция" через useSpring ---
  const rx = useMotionValue(0);              // target rotateX
  const ry = useMotionValue(0);              // target rotateY
  const srx = useSpring(rx, { stiffness: 220, damping: 16, mass: 0.9 }); // smoothed
  const sry = useSpring(ry, { stiffness: 220, damping: 16, mass: 0.9 });

  // Границы/эффекты, завязанные на наклон
  const glintX = useTransform(sry, [-12, 12], ['20%', '80%']);  // позиция блика по X
  const glintY = useTransform(srx, [-12, 12], ['30%', '70%']);  // позиция блика по Y
  const sheenX = useTransform(sry, [-12, 12], ['-10%', '110%']); // движение «полосы» блика

  const finePointer = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches,
    []
  );
  const panelRef = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!finePointer || !isActive) return;
    const rect = (panelRef.current ?? e.currentTarget).getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;  // 0..1
    const py = (e.clientY - rect.top) / rect.height;  // 0..1
    const MAX = 12;                                   // максимальный угол
    ry.set((px - 0.5) * MAX * 2 * 0.8);               // Y — влево/вправо
    rx.set(-(py - 0.5) * MAX * 2 * 0.8);              // X — вверх/вниз
  }
  function onLeave() {
    // плавный возврат к нулю — springs дадут "послевкусие"
    rx.set(0); ry.set(0);
    setActive(null);
  }

  return (
    <motion.article
      ref={panelRef}
      onMouseEnter={() => setActive(index)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => setActive(isActive ? null : index)}
      className="relative flex overflow-hidden rounded-xl bg-brand-card cursor-pointer
                 ring-1 ring-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                 h-full"
      animate={{ flex: isActive ? 7 : 1 }}
      transition={{ type: 'tween', duration: 0.65, ease: easeSoft }}
      style={{ minWidth: 0 }}
    >
      {/* BACKGROUND: scale 2 -> 1.5 */}
      <motion.div
        className="absolute inset-0 overflow-hidden will-change-transform"
        initial={false}
        animate={{ scale: isActive ? 1.5 : 2 }}
        transition={{ type: 'tween', duration: 0.85, ease: easeSoft }}
        style={{ transformOrigin: '50% 50%' }}
      >
        <MediaBackground data={data} isActive={!!isActive} index={index} />
      </motion.div>

      {/* рамка/виньетки */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/35 to-transparent" />
      <div className="absolute inset-0 bg-black/18" />

      {/* PACK: по центру + 3D-tilt (rx/ry сглажены пружиной) */}
      <motion.div
        className="relative z-20 flex items-center justify-center w-full"
        initial={false}
        animate={isActive ? { y: 0, opacity: 1, scale: 1.02 } : { y: 24, opacity: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18, mass: 0.9 }}
        style={{
          transformStyle: 'preserve-3d',
          transformPerspective: '1200px',
          rotateX: srx,     // ← плавный наклон
          rotateY: sry
        }}
      >
        {/* динамическая «тень» под паком */}
        <motion.div
          className="absolute bottom-[12%] h-[16%] w-[42%] rounded-[999px] bg-black/70 blur-xl opacity-70"
          style={{ x: useTransform(sry, [-12, 12], [-12, 12]) }}
        />
        {/* foil-glint вокруг пачки (двигается с наклоном) */}
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen"
          style={{
            ['--mx' as any]: glintX,
            ['--my' as any]: glintY,
            background:
              'radial-gradient(60% 120% at var(--mx) var(--my), rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)'
          }}
        />
        {/* диагональная бегущая «полоска» блика */}
        <motion.div
          className="pointer-events-none absolute h-[140%] w-[35%] -skew-x-12 rotate-[18deg] opacity-30 mix-blend-screen"
          style={{
            x: sheenX,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 70%)'
          }}
        />

        <div className="relative h-full w-full flex items-center justify-center p-3 md:p-6">
          {/* ⬇️ увеличили относительную высоту пака на мобильных/планшетах */}
          <Image
            src={data.packImage}
            alt={data.name + ' pack'}
            width={520}
            height={780}
            className="h-[78%] sm:h-[80%] md:h-[68%] w-auto select-none"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </motion.div>

      {/* Overlay: title → description+tags → button */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-30 px-4 md:px-6 pb-6 pt-24 md:pt-24"
        variants={overlayVariants}
        initial={false}
        animate={isActive ? 'visible' : 'hidden'}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

        {/* 1) Title */}
        <motion.div className="max-w-[85%] md:max-w-[70%]" variants={fadeUp}>
          {data.titleImage ? (
            <Image src={data.titleImage} alt={data.name} width={800} height={300} className="w-auto h-14 md:h-16" />
          ) : (
            <h3 className="font-display text-2xl md:text-4xl tracking-tight">{data.name}</h3>
          )}
        </motion.div>

        {/* 2) Description + tags */}
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

        {/* 3) Button */}
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
