import BannerRail from '@/components/BannerRail';
import { PACKS } from '@/lib/packs';

export default function Page() {
  return (
    <main className="relative w-screen h-dvh overflow-hidden bg-black">
      <BannerRail packs={PACKS} />
    </main>
  );
}
