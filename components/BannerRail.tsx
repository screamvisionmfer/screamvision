'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import BannerPanel from './BannerPanel';
import type { PackMeta } from '@/lib/packs';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function BannerRail({ packs, reveal = true }: { packs: PackMeta[]; reveal?: boolean }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={reveal ? 'show' : 'hidden'}
      className="
        flex w-full h-full
        flex-col xl:flex-row
        items-stretch justify-start
        gap-4 xl:gap-6
      "
      onMouseLeave={() => setActive(null)}
    >
      {packs.map((pack, i) => {
        const isActive = active === i;

        const flexClass =
          active === null
            ? 'xl:[flex:1_1_0%]'
            : isActive
              ? 'xl:[flex:3.6_1_0%]'
              : 'xl:[flex:0.8_1_0%]';

        return (
          <motion.div
            key={(pack as any).slug ?? i}
            variants={itemVariants}
            className={[
              // адаптивная высота
              'min-w-0 h-[30svh] md:h-[76svh] xl:h-full',
              'transition-[flex] duration-500 ease-out',
              flexClass,
            ].join(' ')}
            onMouseEnter={() => setActive(i)}
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
