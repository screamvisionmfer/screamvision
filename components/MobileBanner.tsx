'use client';
import Image from 'next/image';

type Pack = {
    slug: string;
    name: string;
    description?: string;
    tags?: string[];
    background?: string;       // /packs/foo-bg.jpg
    srcMp4?: string;           // /packs/foo-bg.mp4 (опционально)
    poster?: string;           // /packs/foo-bg.jpg (кадр для видео)
    packImage: string;         // /packs/foo-pack.png
    titleImage?: string;       // /titles/foo-title.png (опционально)
    marketUrl: string;
};

export default function MobileBanner({ pack }: { pack: Pack }) {
    return (
        <article className="relative h-[100svh] w-full overflow-hidden rounded-3xl bg-neutral-900">
            {/* BG: видео приоритетно, иначе картинка */}
            <div className="absolute inset-0">
                {pack.srcMp4 ? (
                    <video
                        className="absolute inset-0 h-full w-full object-cover"
                        src={pack.srcMp4}
                        poster={pack.poster || pack.background}
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    // next/image тут избыточен, но используем для оптимизации
                    <Image
                        src={pack.background || '/packs/placeholder-bg.png'}
                        alt=""
                        fill
                        priority
                        className="object-cover"
                    />
                )}
            </div>

            {/* затемнение для читаемости */}
            <div className="absolute inset-0 bg-black/45" />

            {/* контент */}
            <div className="relative z-10 flex h-full flex-col items-center justify-end p-5 pb-6">
                {/* pack (без tilt на мобиле, просто лёгкая тень) */}
                <div className="mb-6 w-[72%] max-w-[360px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
                    <Image
                        src={pack.packImage}
                        alt={`${pack.name} pack`}
                        width={800}
                        height={1200}
                        className="h-auto w-full"
                        priority
                    />
                </div>

                {/* title */}
                {pack.titleImage ? (
                    <Image
                        src={pack.titleImage}
                        alt={pack.name}
                        width={720}
                        height={160}
                        className="mb-3 h-auto w-[80%] max-w-[420px]"
                        priority
                    />
                ) : (
                    <h2 className="mb-2 text-center text-3xl font-black tracking-tight text-white">
                        {pack.name}
                    </h2>
                )}

                {/* description */}
                {pack.description ? (
                    <p className="mb-3 line-clamp-3 text-center text-sm text-white/85">
                        {pack.description}
                    </p>
                ) : null}

                {/* теги */}
                {pack.tags && pack.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                        {pack.tags.map((t) => (
                            <span
                                key={t}
                                className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-white/90 backdrop-blur"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <a
                    href={pack.marketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold uppercase tracking-wide text-black shadow-[0_8px_24px_rgba(0,0,0,0.35)] active:translate-y-[1px]"
                >
                    Buy on Vibemarket ↗
                </a>
            </div>
        </article>
    );
}
