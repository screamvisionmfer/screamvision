'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

/* ======================== Types & Consts ======================== */

type Rarity = 'Mythical' | 'Legendary' | 'Epic' | 'Rare' | 'Common';
const RARITY_ORDER: readonly Rarity[] = ['Mythical', 'Legendary', 'Epic', 'Rare', 'Common'];

type Card = { rarity: Rarity; image: string };
type Pack = {
  slug: string;
  title: string;
  banner: string;
  links?: { vibemarket?: string; opensea?: string };
  cards: Card[];
};

/* ======================== Helpers ======================== */

function rarityWeight(r: Rarity): number {
  return RARITY_ORDER.indexOf(r);
}
function sortByRarity(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rarityWeight(a.rarity) - rarityWeight(b.rarity));
}

/* ======================== Demo Data (оставь как у тебя) ======================== */

const packs: Pack[] = [
  {
    slug: 'straytillnine',
    title: 'STRAY TILL NINE',
    banner: '/packs/stray-bg.jpg',
    links: {
      vibemarket: 'https://vibechain.com/market/stray-till-nine?ref=B3FLA1AGGOH2',
      opensea: 'https://opensea.io/collection/stray',
    },
    cards: [
      { rarity: 'Legendary', image: '/cards/straytillnine/1.jpg' },
      { rarity: 'Rare', image: '/cards/straytillnine/2.jpg' },
      { rarity: 'Legendary', image: '/cards/straytillnine/3.jpg' },
      { rarity: 'Epic', image: '/cards/straytillnine/4.jpg' },
      { rarity: 'Rare', image: '/cards/straytillnine/5.jpg' },
      { rarity: 'Rare', image: '/cards/straytillnine/6.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/7.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/8.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/9.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/10.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/11.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/12.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/13.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/14.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/15.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/16.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/17.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/18.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/19.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/20.jpg' },
      { rarity: 'Common', image: '/cards/straytillnine/21.jpg' },
    ],
  },
];

/* ======================== Banner ======================== */

const easeOutSoft = [0.22, 1, 0.36, 1] as const;

function PackBanner({ pack, onToggle }: { pack: Pack; onToggle: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl ring-1 ring-amber-500/15">
      <img
        src={pack.banner}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />
      <div className="relative z-10 p-8 md:p-12">
        <div className="text-amber-200/70 tracking-widest uppercase text-xs">Collection</div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-amber-50 drop-shadow-[0_2px_8px_rgba(0,0,0,.35)]">
          {pack.title}
        </h2>
        <div className="mt-4 flex items-center gap-3 text-amber-100/70">
          <span className="rounded-md bg-amber-500/10 px-3 py-1 ring-1 ring-amber-300/20">
            Total cards: {pack.cards.length}
          </span>
          {pack.links?.vibemarket && (
            <a className="rounded-md bg-amber-500/10 px-3 py-1 ring-1 ring-amber-300/20 hover:bg-amber-500/20 transition"
              href={pack.links.vibemarket} target="_blank">VibeMarket →</a>
          )}
          {pack.links?.opensea && (
            <a className="rounded-md bg-amber-500/10 px-3 py-1 ring-1 ring-amber-300/20 hover:bg-amber-500/20 transition"
              href={pack.links.opensea} target="_blank">OpenSea →</a>
          )}
          <button
            onClick={onToggle}
            className="ml-auto text-amber-100/80 hover:text-amber-50 transition"
          >
            Hide
          </button>
        </div>
      </div>
      {/* затемнения/рамки */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-[60%] bg-gradient-to-l from-black/80 via-black/55 to-transparent" />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-amber-500/15" />
        <div className="absolute -inset-[1px] rounded-[1.5rem] opacity-[.18] blur-[1.2px]
                        bg-[conic-gradient(at_20%_-10%,#fde68a22,transparent_30%,#a78bfa22_60%,transparent_75%)]" />
      </div>
    </div>
  );
}

/* ======================== Card ======================== */

function TiltCard({ src, onClick }: { src: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-2xl ring-1 ring-amber-500/20 bg-black/20"
      style={{ aspectRatio: '3 / 4' }}
    >
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300
                      bg-[radial-gradient(60%_60%_at_50%_50%,rgba(255,255,255,.15),transparent_70%)]" />
    </button>
  );
}

/* ======================== Lightbox (full viewport + portal) ======================== */

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rX = useTransform(my, [0, 1], [6, -6]);
  const rY = useTransform(mx, [0, 1], [-6, 6]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return createPortal(
    (
      <div className="fixed inset-0 z-[9999] overflow-hidden">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center" onMouseMove={onMove}>
          <motion.div
            ref={ref}
            style={{ perspective: 1200, rotateX: rX as any, rotateY: rY as any }}
            className="relative w-[100dvw] h-[100dvh] flex items-center justify-center"
          >
            <img
              src={src}
              alt=""
              className="block w-[100dvw] h-[100dvh] object-contain"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 h-10 w-10 grid place-items-center rounded-full
                         bg-black/60 text-white/90 hover:bg-black/80 transition"
              aria-label="Close"
            >
              ×
            </button>
          </motion.div>
        </div>
      </div>
    ),
    document.body
  );
}

/* ======================== Page ======================== */

export default function CollectionsGallery() {
  const [openedSlug, setOpenedSlug] = useState<string | null>(null);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  /* Лочим скролл, пока открыт лайтбокс */
  useEffect(() => {
    if (!zoomSrc) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev || ''; };
  }, [zoomSrc]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-10">
      {packs.map((pack) => {
        const isOpen = openedSlug === pack.slug;
        const sortedCards = useMemo(() => sortByRarity(pack.cards), [pack.cards]);

        return (
          <section key={pack.slug} className="space-y-6">
            <PackBanner
              pack={pack}
              onToggle={() => setOpenedSlug((s) => (s === pack.slug ? null : pack.slug))}
            />

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={`${pack.slug}-grid`}
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4"
                >
                  {sortedCards.map((c, idx) => (
                    <motion.div
                      key={`${pack.slug}-${idx}`}
                      initial={{ opacity: 0, y: 14, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: 'easeOut', delay: idx * 0.02 }}
                    >
                      <TiltCard src={c.image} onClick={() => setZoomSrc(c.image)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}

      <AnimatePresence>
        {zoomSrc && <Lightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />}
      </AnimatePresence>
    </div>
  );
}
