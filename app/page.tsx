'use client';
import BannerRail from '@/components/BannerRail';
import { PACKS } from '@/lib/packs';
import { usePagePreloader } from '@/src/hooks/usePagePreloader';

export default function Page() {
  const { done } = usePagePreloader({ assets: [], minDurationMs: 900 });

  return (
    <section className="w-full h-dvh overflow-hidden">
      <BannerRail packs={PACKS} reveal={done} />
    </section>
  );
}
