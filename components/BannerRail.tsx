'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BannerPanel from './BannerPanel';
import type { PackMeta } from '@/lib/packs';
import { usePreloaderState } from '@/src/providers/PreloaderContext';

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
  const { done } = usePreloaderState();

  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279.98px)');
  // телефоны — иначе

  const [active, setActive] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // закрытие по тапу/клику вне активной карточки (для тача)
  useEffect(() => {
    function onDocTap(e: MouseEvent | TouchEvent) {
      if (!railRef.current) return;
      if (active === null) return;
      if (!railRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    }
    document.addEventListener('click', onDocTap);
    document.addEventListener('touchstart', onDocTap);
    return () => {
      document.removeEventListener('click', onDocTap);
      document.removeEventListener('touchstart', onDocTap);
    };
  }, [active]);

  // коэффициенты ширины для разных брейков
  const flexFor = useMemo(() => {
    if (isDesktop) return { base: 1.15, active: 1.8, idle: 0.7 };  // как было
    if (isTablet) return { base: 1.0, active: 1.9, idle: 0.6 };  // шире на планшете по тапу
    return { base: 1.0, active: 1.0, idle: 1.0 };        // телефоны — колонны вертикально
  }, [isDesktop, isTablet]);

  // хэндлеры взаимодействия
  const handleEnter = (i: number) => {
    if (isDesktop) setActive(i); // hover только на десктопе
  };
  const handleLeave = () => {
    if (isDesktop) setActive(null);
  };
  const handleTap = (i: number) => {
    if (!isDesktop) {
      setActive(prev => (prev === i ? null : i)); // toggle по тапу на планшете/телефоне
    }
  };

  return (
    <motion.div
      ref={railRef}
      variants={container}
      initial="hidden"
      animate={done ? 'show' : 'hidden'}
      className="flex w-full h-full flex-col xl:flex-row items-stretch justify-start gap-4 xl:gap-6"
      onMouseLeave={handleLeave}
    >
      {packs.map((pack, i) => {
        const isActive = active === i;
        // на десктопе мы можем оставить утилитные классы, но для планшета дадим инлайн flex,
        // чтобы легко контролировать коэффициенты.
        const flexStyle =
          isDesktop
            ? undefined
            : { flex: `${(isActive ? flexFor.active : active === null ? flexFor.base : flexFor.idle)} 1 0%` };

        // базовые классы по высоте: короче на мобилке, полная на десктопе
        const heightCls = 'h-[60svh] md:h-[72svh] xl:h-full';

        // для десктопа — старый механизм через utility классы (плавнее из коробки)
        const desktopFlexCls =
          isDesktop
            ? (active === null
              ? 'xl:[flex:1.15_1_0%]'
              : isActive
                ? 'xl:[flex:2.8_1_0%]'
                : 'xl:[flex:0.7_1_0%]')
            : '';

        return (
          <motion.div
            key={(pack as any).slug ?? i}
            variants={item}
            custom={isDesktop}
            onMouseEnter={() => handleEnter(i)}
            onClick={() => handleTap(i)}
            onTouchStart={() => handleTap(i)}
            className={[
              'min-w-0', heightCls,
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
