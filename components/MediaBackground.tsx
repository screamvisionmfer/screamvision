'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { PackMeta } from '@/lib/packs';

export default function MediaBackground({
    data,
    isActive,
    index
}: { data: PackMeta; isActive: boolean; index: number }) {
    const vref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const v = vref.current;
        if (!v) return;
        if (isActive) {
            v.play().catch(() => { }); // автоплей работает т.к. muted
        } else {
            v.pause();
            v.currentTime = 0;
        }
    }, [isActive]);

    if (data.video?.srcMp4 || data.video?.srcWebm) {
        return (
            <video
                ref={vref}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                loop
                playsInline
                preload="metadata"
                poster={data.video?.poster || data.background}
            >
                {data.video?.srcWebm && <source src={data.video.srcWebm} type="video/webm" />}
                {data.video?.srcMp4 && <source src={data.video.srcMp4} type="video/mp4" />}
            </video>
        );
    }

    // fallback — картинка
    return (
        <Image
            src={data.background}
            alt={data.name}
            fill
            sizes="33vw"
            className="object-cover"
            priority={index === 0}
        />
    );
}
