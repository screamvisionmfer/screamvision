'use client';
import BannerRail from '@/components/BannerRail';
import { PACKS } from '@/lib/packs';

export default function Page() {
  return (
    // Во всю ширину и высоту вьюпорта
    <section className="w-full h-dvh">
      <BannerRail packs={PACKS} />
    </section>
  );
}
