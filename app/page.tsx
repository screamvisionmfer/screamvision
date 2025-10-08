'use client';
import BannerRail from '@/components/BannerRail';
import { PACKS } from '@/lib/packs';

export default function Page() {
  return (
    <section className="relative z-10 w-full min-h-screen overflow-x-hidden bg-black">
      <BannerRail packs={PACKS} />
    </section>
  );
}
