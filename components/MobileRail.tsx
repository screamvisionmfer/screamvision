'use client';
import MobileBanner from './MobileBanner';
import { PACKS } from '@/lib/packs';

export default function MobileRail() {
    return (
        <section
            aria-label="Collections (mobile)"
            className="md:hidden h-[100svh] w-full overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-4 px-4"
        >
            {PACKS.map((p) => (
                <div key={p.slug} className="snap-center shrink-0 w-[88vw]">
                    <MobileBanner pack={p as any} />
                </div>
            ))}
        </section>
    );
}
