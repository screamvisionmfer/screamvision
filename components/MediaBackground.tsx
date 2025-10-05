'use client';
import Image from 'next/image';
import React from 'react';
import type { PackMeta } from '@/lib/packs';

export default function MediaBackground({
    data,
    isActive,
    index,
}: { data: PackMeta; isActive: boolean; index: number }) {
    // В некоторых паках можем задать точный сдвиг фона на мобилке:
    // data.mobilePosY, например '72%' — необязательно
    const mbPos = (data as any).mobilePosY as string | undefined;

    // ВИДЕО
    if ((data as any).srcMp4) {
        return (
            <video
                className="h-full w-full object-cover md:object-center bg-mobile-anchor"
                style={mbPos ? ({ ['--mb-pos' as any]: mbPos } as React.CSSProperties) : undefined}
                src={(data as any).srcMp4}
                poster={(data as any).poster || data.background}
                muted
                loop
                autoPlay
                playsInline
            />
        );
    }

    // ИЗОБРАЖЕНИЕ
    return (
        <Image
            src={data.background}
            alt=""
            fill
            priority={index < 3}
            sizes="100vw"
            className="object-cover md:object-center bg-mobile-anchor select-none"
            style={mbPos ? ({ ['--mb-pos' as any]: mbPos } as React.CSSProperties) : undefined}
        />
    );
}
