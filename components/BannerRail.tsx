'use client';
import { useState } from 'react';
import BannerPanel from './BannerPanel';
import type { PackMeta } from '@/lib/packs';

export default function BannerRail({ packs }: { packs: PackMeta[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      className="
        flex w-full h-full
        flex-col            /* default: телефоны и планшеты — столбиком */
        xl:flex-row         /* >=1280px — в ряд, как на десктопе */
        gap-4 xl:gap-6
      "
      onMouseLeave={() => setActive(null)}
    >
      {packs.map((pack, i) => (
        <BannerPanel
          key={pack.slug}
          index={i}
          activeIndex={active}
          setActive={setActive}
          data={pack}
        />
      ))}
    </div>
  );
}
