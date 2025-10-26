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
  hidden: (isRow: boolean) => (isRow ? { opacity: 0, x: -24 } : { opacity: 0, y: 24 }),
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function BannerRail({ packs }: { packs: PackMeta[] }) {
  const started = useStarted();

  // брейкпоинты/ориентации
  const isDesktop = useMediaQuery('(min-width: 1024px)'); // lg
  const isTabletPortrait = useMediaQuery(
    '(min-width: 768px) and (max-width: 1279.98px) and (orientation: portrait)'
  );
  const isTabletLandscape = useMediaQuery('(min-width: 768px) and (orientation: landscape)');

  const [active, setActive] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // md+ всегда «лента» в ряд; телефон — колонка (страница скроллится нативно)
  const inRow = isDesktop || isTabletLandscape || isTabletPortrait;

  // авто-открытие одной карточки после прелоадера
  const openedRef = useRef(false);
  useEffect(() => {
    if (!started || openedRef.current || packs.length === 0) return;
    openedRef.current = true;
    const idx = Math.floor(Math.random() * packs.length);
    const t = setTimeout(() => setActive((p) => (p === null ? idx : p)), 350);
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

  // «дыхание» ширин только в ряду
  const flexFor = useMemo(() => {
    if (inRow) return { base: 1.2, active: 2.6, idle: 0.9 };
    return { base: 1.0, active: 1.0, idle: 1.0 };
  }, [inRow]);

  const handleEnter = (i: number) => { if (inRow) setActive(i); };
  const handleLeave = () => { if (inRow) setActive(null); };
  const handleTap = (i: number) => { if (!inRow) setActive((p) => (p === i ? null : i)); };

  // высоты карточек: на телефоне — «высокие плитки» и естественный скролл страницы;
  // на md+ — 100% высоты ленты.
  const heightCls = inRow ? 'md:h-full' : 'h-[46svh]';

  return (
    <motion.div
      ref={railRef}
      variants={container}
      initial="hidden"
      animate={started ? 'show' : 'hidden'}
      className={[
        'flex w-full',
        inRow
          ? 'h-[100svh] overflow-y-hidden overflow-x-hidden md:flex-row'
          : 'h-auto overflow-visible flex-col', // ← телефон: НИЧЕГО не блокируем
        'items-stretch justify-start',
        'gap-3 lg:gap-6',
      ].join(' ')}
      onMouseLeave={handleLeave}
    >
      {packs.map((pack, i) => {
        const isActive = active === i;

        // телефон — по одной карточке на строку; md+ — «дыхание»
        const flexStyle = inRow ? undefined : { flex: 'none', width: '100%' };

        const desktopFlexCls = inRow
          ? active === null
            ? 'md:[flex:1.2_1_0%] lg:[flex:1.2_1_0%]'
            : isActive
              ? 'md:[flex:1.6_1_0%] lg:[flex:4.6_1_0%]'
              : 'md:[flex:0.4_1_0%] lg:[flex:0.4_1_0%]'
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
