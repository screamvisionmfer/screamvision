'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BannerPanel from './BannerPanel';
import type { PackMeta } from '@/lib/packs';
import { useStarted } from '@/components/ClientPreloaderShell';

function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const upd = () => setMatch(mq.matches);
    upd();
    mq.addEventListener?.('change', upd);
    return () => mq.removeEventListener?.('change', upd);
  }, [query]);
  return match;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const item = {
  hidden: (isDesktop: boolean) =>
    isDesktop ? { opacity: 0, x: -24 } : { opacity: 0, y: 24 },
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function BannerRail({ packs }: { packs: PackMeta[] }) {
  const started = useStarted();

  const isDesktop = useMediaQuery('(min-width: 1024px)');   // lg
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279.98px)');

  const [active, setActive] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // авто-открытие одной карточки после прелоудера
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!started || autoOpenedRef.current || packs.length === 0) return;
    autoOpenedRef.current = true;
    const idx = Math.floor(Math.random() * packs.length);
    const t = setTimeout(() => setActive(prev => (prev === null ? idx : prev)), 350);
    return () => clearTimeout(t);
  }, [started, packs.length]);

  useEffect(() => {
    function onDocTap(e: MouseEvent | TouchEvent) {
      if (!railRef.current) return;
      if (active === null) return;
      if (!railRef.current.contains(e.target as Node)) setActive(null);
    }
    document.addEventListener('click', onDocTap);
    document.addEventListener('touchstart', onDocTap);
    return () => {
      document.removeEventListener('click', onDocTap);
      document.removeEventListener('touchstart', onDocTap);
    };
  }, [active]);

  const flexFor = useMemo(() => {
    if (isDesktop) return { base: 1.15, active: 1.8, idle: 0.7 };
    if (isTablet) return { base: 1.0, active: 1.9, idle: 0.6 };
    return { base: 1.0, active: 1.0, idle: 1.0 };
  }, [isDesktop, isTablet]);

  const handleEnter = (i: number) => { if (isDesktop) setActive(i); };
  const handleLeave = () => { if (isDesktop) setActive(null); };
  const handleTap = (i: number) => { if (!isDesktop) setActive(prev => (prev === i ? null : i)); };

  return (
    <motion.div
      ref={railRef}
      variants={container}
      initial="hidden"
      animate={started ? 'show' : 'hidden'}
      className="flex w-full h-full flex-col lg:flex-row items-stretch justify-start gap-3 lg:gap-6"
      onMouseLeave={handleLeave}
    >
      {packs.map((pack, i) => {
        const isActive = active === i;

        // высота: мобильный, планшет-портрет, планшет-ландшафт, десктоп
        const heightCls =
          'h-[44svh] md:portrait:h-[64svh] md:landscape:h-[100svh] lg:h-[100svh]';

        // На моб/планшете запрещаем рост по главной оси (фиксируем высоту).
        // На десктопе — динамическая ширина.
        const desktopFlexCls =
          isDesktop
            ? (active === null
              ? 'lg:[flex:1.15_1_0%]'
              : isActive
                ? 'lg:[flex:2.8_1_0%]'
                : 'lg:[flex:0.7_1_0%]')
            : 'flex-none';

        return (
          <motion.div
            key={(pack as any).slug ?? i}
            variants={item}
            custom={isDesktop}
            onMouseEnter={() => handleEnter(i)}
            onClick={() => handleTap(i)}
            onTouchStart={() => handleTap(i)}
            className={[
              'min-w-0',
              'mb-3 md:mb-0',
              heightCls,
              'transition-[flex] duration-500 ease-out',
              desktopFlexCls,
            ].join(' ')}
          >
            <BannerPanel
              index={i}
              activeIndex={active}
              setActive={setActive}
              data={pack}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
