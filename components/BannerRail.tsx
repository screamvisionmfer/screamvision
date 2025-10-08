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

  // брейкпоинты/ориентации
  const isDesktop = useMediaQuery('(min-width: 1024px)'); // lg
  const isTabletPortrait = useMediaQuery('(min-width: 768px) and (max-width: 1279.98px) and (orientation: portrait)');
  const isTabletLandscape = useMediaQuery('(min-width: 768px) and (orientation: landscape)');

  const [active, setActive] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // авто-открытие одной карточки после прелоадера
  const openedRef = useRef(false);
  useEffect(() => {
    if (!started || openedRef.current || packs.length === 0) return;
    openedRef.current = true;
    const idx = Math.floor(Math.random() * packs.length);
    const t = setTimeout(() => setActive(p => (p === null ? idx : p)), 350);
    return () => clearTimeout(t);
  }, [started, packs.length]);

  // клик/тап вне — закрыть
  useEffect(() => {
    function onDocTap(e: MouseEvent | TouchEvent) {
      if (!railRef.current || active === null) return;
      if (!railRef.current.contains(e.target as Node)) setActive(null);
    }
    document.addEventListener('click', onDocTap);
    document.addEventListener('touchstart', onDocTap);
    return () => {
      document.removeEventListener('click', onDocTap);
      document.removeEventListener('touchstart', onDocTap);
    };
  }, [active]);

  // «дыхание» ширин только в ландшафте/десктопе
  const flexFor = useMemo(() => {
    if (isDesktop || isTabletLandscape) return { base: 1.15, active: 1.8, idle: 0.7 };
    return { base: 1.0, active: 1.0, idle: 1.0 };
  }, [isDesktop, isTabletLandscape]);

  const handleEnter = (i: number) => { if (isDesktop || isTabletLandscape) setActive(i); };
  const handleLeave = () => { if (isDesktop || isTabletLandscape) setActive(null); };
  const handleTap = (i: number) => { if (!(isDesktop || isTabletLandscape)) setActive(p => (p === i ? null : i)); };

  // высоты: моб 46svh; планшет портрет 64svh; планшет ландшафт/десктоп — на полный контейнер
  const heightCls = 'h-[46svh] md:portrait:h-[64svh] md:landscape:h-full lg:h-full';

  // контейнер рельсы: колонка по умолчанию, лента в ландшафте/десктопе
  return (
    <motion.div
      ref={railRef}
      variants={container}
      initial="hidden"
      animate={started ? 'show' : 'hidden'}
      className="
        flex w-full h-full
        flex-col md:landscape:flex-row lg:flex-row
        items-stretch justify-start
        gap-3 lg:gap-6
        overflow-x-hidden
        overflow-y-auto md:landscape:overflow-y-hidden lg:overflow-y-hidden
      "
      onMouseLeave={handleLeave}
    >
      {packs.map((pack, i) => {
        const isActive = active === i;

        // в колонке (моб/планшет-портрет) — карточка на всю ширину и не сжимается
        // в ленте (ландшафт/десктоп) — прежнее «дыхание»
        const inRow = isDesktop || isTabletLandscape;
        const flexStyle = inRow
          ? undefined
          : { flex: 'none', width: '100%' };

        const desktopFlexCls = inRow
          ? (active === null
            ? 'md:landscape:[flex:1.15_1_0%] lg:[flex:1.15_1_0%]'
            : isActive
              ? 'md:landscape:[flex:2.8_1_0%] lg:[flex:2.8_1_0%]'
              : 'md:landscape:[flex:0.7_1_0%] lg:[flex:0.7_1_0%]')
          : 'flex-none';

        return (
          <motion.div
            key={(pack as any).slug ?? i}
            variants={item}
            custom={inRow}
            onMouseEnter={() => handleEnter(i)}
            onClick={() => handleTap(i)}
            onTouchStart={() => handleTap(i)}
            className={[
              'w-full min-h-0',
              heightCls,
              'overflow-hidden',
              'transition-[flex] duration-500 ease-out',
              desktopFlexCls,
            ].join(' ')}
            style={flexStyle}
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
