'use client';

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CollectionsGallery — v3 (clean flat UI, working 3D tilt, nice fullscreen)
 * - Flat aesthetic (без рамок/скруглений/теней)
 * - Страница нормально скроллится (никаких fixed/sticky сверху)
 * - Карточки: плавный tilt3D на RAF + лёгкий параллакс блика
 * - Полноэкранный лайтбокс: центр, fade+scale, стрелки ← →, Esc, клик‑наружу; внутри тоже tilt3D
 */

// ——————————————————————————————————————————————————————
// Types
// ——————————————————————————————————————————————————————
type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | string;
type CardImg = { src: string; rarity?: Rarity; set?: string };
type LinkSet = { vibemarket?: string; opensea?: string; website?: string };
type Collection = {
  id: string;
  title: string;
  tagline?: string;
  bannerImage?: string;
  accent?: string;
  links?: LinkSet;
  cards: CardImg[];
};

// ——————————————————————————————————————————————————————
// Demo data (замени на реальные)
// ——————————————————————————————————————————————————————
const collections: Collection[] = [
  {
    id: 'stray-till-nine',
    title: 'STRAY CLUB',
    tagline: 'Unofficial parody pack • Fan‑made',
    bannerImage: '/packs/stray-bg.jpg',
    accent: '#FFD100',
    links: {
      vibemarket: 'https://vibechain.com/market/stray-till-nine',
      opensea: 'https://opensea.io/collection/stray-till-nine',
    },
    cards: [
      { src: '/cards/straytillnine/1.jpg', rarity: 'Rare', set: 'Core' },
      { src: '/cards/straytillnine/2.jpg', rarity: 'Common', set: 'Core' },
      { src: '/cards/straytillnine/3.jpg', rarity: 'Epic', set: 'Core' },
    ],
  },
  {
    id: 'ordo-memeticus',
    title: 'ORDO MEMETICUS',
    tagline: 'Stained‑glass lore cards • Hand‑drawn',
    bannerImage: '/packs/ordo-memeticus-bg.png',
    accent: '#FDE047',
    links: {
      vibemarket: 'https://vibechain.com/market/ordo-memeticus',
      opensea: 'https://opensea.io/collection/ordo-memeticus',
      website: 'https://ordomemeticus.lol',
    },
    cards: [
      { src: '/cards/1.jpg', rarity: 'Rare', set: 'Launch' },
    ],
  },
];

// ——————————————————————————————————————————————————————
// Utils
// ——————————————————————————————————————————————————————
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const k = (n: number = 0) => (n < 1000 ? String(n) : n < 10000 ? (n / 1000).toFixed(1) + 'k' : Math.round(n / 1000) + 'k');

// ——————————————————————————————————————————————————————
// Tilt hook (сглаженный RAF)
// ——————————————————————————————————————————————————————
function useTilt(maxX = 10, maxY = 10) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ transform: 'perspective(900px)' });
  const frame = useRef<number | null>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height; // 0..1
    const rotY = (x - 0.5) * 2 * maxY; // -max..max
    const rotX = -(y - 0.5) * 2 * maxX;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      setStyle({ transform: `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)` });
    });
  }, [maxX, maxY]);

  const onLeave = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    setStyle({ transform: 'perspective(900px)' });
  }, []);

  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); }, []);

  return { ref, style, onMove, onLeave } as const;
}

// ——————————————————————————————————————————————————————
// Card (чистое изображение + tilt + блик)
// ——————————————————————————————————————————————————————
function TiltCard({ src, onClick, className = '' }: { src: string; onClick?: () => void; className?: string }) {
  const { ref, style, onMove, onLeave } = useTilt(8, 10);
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={style}
      className={`relative select-none will-change-transform ${className}`}
    >
      <div className="aspect-[3/4] w-full bg-black">
        <img src={src} alt="" className="h-full w-full object-contain" draggable={false} loading="lazy" />
      </div>
      {/* блик */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 hover:opacity-100" style={{
        background: 'radial-gradient(1000px 400px at 10% -10%, rgba(255,255,255,0.12), transparent 60%)'
      }} />
    </div>
  );
}

// ——————————————————————————————————————————————————————
// Banner (плоский, без рамок/теней/скруглений)
// ——————————————————————————————————————————————————————
function CollectionBanner({ c }: { c: Collection }) {
  const { vibemarket, opensea, website } = c.links || {};
  const buttons = [
    vibemarket && { label: 'VibeMarket', href: vibemarket, key: 'vm' },
    opensea && { label: 'OpenSea', href: opensea, key: 'os' },
    website && { label: 'Website', href: website, key: 'web' },
  ].filter(Boolean) as { label: string; href: string; key: string }[];

  return (
    <motion.section
      id={c.id}
      initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
      className="relative w-full overflow-hidden text-zinc-100"
    >
      <div className="absolute inset-0" style={{
        backgroundImage: `url(${c.bannerImage || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'contrast(1.05) saturate(1.05)'
      }} aria-hidden />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.92) 100%)'
      }} />

      <div className="relative z-10 grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">{c.title}</h2>
          {c.tagline && <p className="mt-2 max-w-2xl text-zinc-300">{c.tagline}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {buttons.map((b) => (
              <a key={b.key} href={b.href} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white bg-white/10 hover:bg-white/20">
                <span>{b.label}</span>
                <svg className="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
                </svg>
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-start md:justify-end">
          <div className="px-5 py-4 text-right bg-black/30">
            <div className="text-xs uppercase tracking-widest text-zinc-300">Total cards</div>
            <div className="text-4xl font-black" style={{ color: c.accent || '#fff' }}>{k(c.cards?.length || 0)}</div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ——————————————————————————————————————————————————————
// Page
// ——————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————
// Лайтбокс (аккуратный центр, без рамок/обводок/скруглений)
// ——————————————————————————————————————————————————————
function TiltCardModal({ src, onClick }: { src: string; onClick?: () => void }) {
  const { ref, style, onMove, onLeave } = useTilt(6, 8);
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={style}
      className="relative select-none will-change-transform"
    >
      <img
        src={src}
        alt=""
        draggable={false}
        loading="eager"
        className="block max-h-[88vh] max-w-[92vw] w-auto h-auto object-contain"
      />
    </div>
  );
}

export default function CollectionsGallery() {
  // фильтры
  const all = useMemo(() => collections.flatMap((c) => c.cards), []);
  const rarityOptions = useMemo(() => Array.from(new Set(all.map((c) => c.rarity).filter(Boolean))) as Rarity[], [all]);
  const setOptions = useMemo(() => Array.from(new Set(all.map((c) => c.set).filter(Boolean))) as string[], [all]);
  const [rarity, setRarity] = useState<Rarity | 'All'>('All');
  const [subset, setSubset] = useState<string | 'All'>('All');
  const PAGE = 12;
  const [visible, setVisible] = useState(PAGE);

  // лайтбокс (с навигацией)
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<{ list: string[]; index: number }>({ list: [], index: 0 });
  const modalRef = useRef<HTMLDivElement | null>(null);

  const lock = (v: boolean) => { if (typeof document !== 'undefined') document.body.style.overflow = v ? 'hidden' : ''; };

  const openModal = (list: string[], index: number) => { setCurrent({ list, index }); setOpen(true); lock(true); setTimeout(() => modalRef.current?.focus(), 0); };
  const closeModal = () => { setOpen(false); lock(false); };
  const prev = () => setCurrent((s) => ({ ...s, index: (s.index - 1 + s.list.length) % s.list.length }));
  const next = () => setCurrent((s) => ({ ...s, index: (s.index + 1) % s.list.length }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (!open) return; if (e.key === 'Escape') closeModal(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* упрощённая нав-лента без sticky, чтобы страница скроллилась */}
      <nav className="mb-8">
        <ul className="flex flex-wrap items-center gap-2">
          {collections.map((c) => (
            <li key={c.id}><a href={`#${c.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 bg-white/5 hover:bg-white/10">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.accent || '#fff' }} />{c.title}
            </a></li>
          ))}
        </ul>
      </nav>

      {/* фильтры */}
      <section className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-zinc-400">Rarity:</span>
          <button onClick={() => { setRarity('All'); setVisible(PAGE); }} className={`px-3 py-1 text-sm ${rarity === 'All' ? 'bg-white/20' : 'bg-white/5'} `}>All</button>
          {rarityOptions.map((r) => (
            <button key={r} onClick={() => { setRarity(r); setVisible(PAGE); }} className={`px-3 py-1 text-sm ${rarity === r ? 'bg-white/20' : 'bg-white/5'}`}>{r}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-zinc-400">Set:</span>
          <button onClick={() => { setSubset('All'); setVisible(PAGE); }} className={`px-3 py-1 text-sm ${subset === 'All' ? 'bg-white/20' : 'bg-white/5'} `}>All</button>
          {setOptions.map((s) => (
            <button key={s} onClick={() => { setSubset(s); setVisible(PAGE); }} className={`px-3 py-1 text-sm ${subset === s ? 'bg-white/20' : 'bg-white/5'}`}>{s}</button>
          ))}
        </div>
      </section>

      {collections.map((c, i) => {
        const filtered = c.cards.filter((card) => (rarity === 'All' || card.rarity === rarity) && (subset === 'All' || card.set === subset));
        const toShow = filtered.slice(0, visible);
        const list = filtered.map((x) => x.src);
        return (
          <section key={c.id} className={i === 0 ? '' : 'mt-12 sm:mt-16 lg:mt-20'}>
            <CollectionBanner c={c} />
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {toShow.map((it, idx) => (
                <TiltCard key={it.src + idx} src={it.src} onClick={() => openModal(list, idx)} />
              ))}
            </div>
            {filtered.length > visible && (
              <div className="mt-6 flex justify-center">
                <button onClick={() => setVisible((v) => v + PAGE)} className="px-5 py-2 bg-white/10 text-white font-semibold hover:bg-white/20">Показать ещё ({filtered.length - visible})</button>
              </div>
            )}
          </section>
        );
      })}

      {/* Лайтбокс */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="lb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] grid place-items-center bg-black/85"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.18 }}
              ref={modalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              className="relative group"
            >
              {/* изображение: аккуратно вписано, не на весь экран */}
              <TiltCardModal src={current.list[current.index]} onClick={closeModal} />

              {/* стрелки показываются только при наведении */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <button aria-label="Prev" onClick={prev} className="px-3 py-4 text-white/80 hover:text-white">←</button>
                <button aria-label="Next" onClick={next} className="px-3 py-4 text-white/80 hover:text-white">→</button>
              </div>
              <button aria-label="Close" onClick={closeModal} className="absolute right-2 top-2 px-3 py-1 text-white/80 hover:text-white">ESC ×</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </main>
  );
}
