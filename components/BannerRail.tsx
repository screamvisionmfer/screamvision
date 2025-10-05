'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BannerPanel from './BannerPanel';
import type { PackMeta } from '@/lib/packs';
import { usePreloaderState } from '@/src/providers/PreloaderContext';

function useIsDesktop() {
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const up = () => setDesk(mq.matches);
    up(); mq.addEventListener?.('change', up);
    return () => mq.removeEventListener?.('change', up);
  }, []);
  return desk;
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
  const [active, setActive] = useState<number | null>(null);
  const isDesktop = useIsDesktop();
  const { done } = usePreloaderState();      // ← ключевое

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={done ? 'show' : 'hidden'}      // ← запускаем каскад ТОЛЬКО когда прелоудер закончился
      className="flex w-full h-full flex-col xl:flex-row items-stretch justify-start gap-4 xl:gap-6"
      onMouseLeave={() => setActive(null)}
    >
      {packs.map((pack, i) => {
        const flexClass =
          active === null ? 'xl:[flex:1.15_1_0%]' : active === i ? 'xl:[flex:1.8_1_0%]' : 'xl:[flex:0.7_1_0%]';

        return (
          <motion.div
            key={(pack as any).slug ?? i}
            variants={item}
            custom={isDesktop}
            onMouseEnter={() => setActive(i)}
            className={[
              'min-w-0 h-[35svh] md:h-[72svh] xl:h-full',
              'transition-[flex] duration-500 ease-out',
              flexClass,
            ].join(' ')}
          >
            <BannerPanel index={i} activeIndex={active} setActive={setActive} data={pack} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
