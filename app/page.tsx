'use client';
import BannerRail from '@/components/BannerRail';
import { PACKS } from '@/lib/packs';

export default function Page() {
  return (
    <section className="relative z-10 w-full h-[100dvh] overflow-hidden bg-black">
      <BannerRail packs={PACKS} />
    </section>
  );
}
