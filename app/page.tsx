'use client';
import BannerRail from '@/components/BannerRail';
import { PACKS } from '@/lib/packs';

export default function Page() {
  return (
    // было: min-h-dvh → из-за этого баннеры не могут стать h-full
    <section className="w-full h-dvh overflow-x-hidden">
      <BannerRail packs={PACKS} reveal />
    </section>
  );
}
