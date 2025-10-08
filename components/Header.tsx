'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

type MenuItem = { label: string; aria: string; href: string };
const MENU: MenuItem[] = [
    { label: 'Home', aria: 'Go to home page', href: '/' },
    { label: 'VibeMarket', aria: 'Open marketplace', href: 'https://vibechain.com/market?ref=B3FLA1AGGOH2' },
];

type SocialItem = { label: string; href: string };
const SOCIALS: SocialItem[] = [
    { label: 'X / Twitter', href: 'https://x.com/scream_vision' },
    { label: 'Farcaster', href: 'https://warpcast.com/screamvision' },
    { label: 'Linktree', href: 'https://linktr.ee/screamvision' },
];

const easeOutSoft: number[] = [0.22, 1, 0.36, 1];

export default function Header() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // инлайн-логотип из /public/logo.svg (красим currentColor)
    const Logo = ({ className = '' }: { className?: string }) => (
        <span
            role="img"
            aria-label="ScreamVision"
            className={['inline-block align-middle', className].join(' ')}
            style={{
                WebkitMaskImage: 'url(/logo.svg)',
                maskImage: 'url(/logo.svg)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                backgroundColor: 'currentColor',
            }}
        />
    );

    // запрет скролла + закрытие по Esc
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = open ? 'hidden' : prev || '';
        const onKey = (e: KeyboardEvent) => { if (open && e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = prev || ''; window.removeEventListener('keydown', onKey); };
    }, [open]);

    // анимации (мягкие и длиннее)
    const overlayVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.65, ease: easeOutSoft } },
        exit: { opacity: 0, transition: { duration: 0.5, ease: easeOutSoft } },
    };
    const contentVariants = {
        hidden: { opacity: 0, y: 14, scale: 0.985, filter: 'blur(6px)' as any },
        show: {
            opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' as any,
            transition: { duration: 0.7, ease: easeOutSoft, delayChildren: 0.08, staggerChildren: 0.08 },
        },
        exit: { opacity: 0, y: 10, scale: 0.985, filter: 'blur(6px)' as any, transition: { duration: 0.5, ease: easeOutSoft } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutSoft } },
    };

    return (
        <>
            {/* Топ-бар */}
            <div className="fixed inset-x-0 top-0 z-[80]">
                <div className="flex items-center justify-between px-5 py-4">
                    <a href="/" aria-label="ScreamVision Home" className="select-none" title="Home">
                        <Logo className="w-7 h-7 text-white" />
                    </a>

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/95 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        aria-haspopup="dialog"
                        aria-expanded={open}
                        aria-controls="fullscreen-menu"
                    >
                        Menu <span className="text-lg">＋</span>
                    </button>
                </div>
            </div>

            {/* Портал для полноэкранного меню */}
            {mounted && createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.aside
                            id="fullscreen-menu"
                            role="dialog"
                            aria-modal="true"
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            variants={overlayVariants}
                            className="fixed inset-0 h-screen w-screen z-[100000] flex flex-col bg-[#FFD400] text-black"
                        >
                            {/* Кнопка закрытия всегда сверху */}
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close menu"
                                className="absolute right-4 top-4 z-[100001] inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold hover:opacity-80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black/60"
                            >
                                Close <span className="text-lg">×</span>
                            </button>

                            {/* Контент */}
                            <motion.div variants={contentVariants} className="flex grow items-center justify-center px-6">
                                <div className="flex flex-col items-center gap-10 text-center">
                                    <motion.div variants={itemVariants}>
                                        <Logo className="w-12 h-12 text-black" />
                                    </motion.div>

                                    <nav>
                                        <ul className="space-y-6">
                                            {MENU.map((it) => (
                                                <motion.li key={it.label} variants={itemVariants}>
                                                    <motion.a
                                                        href={it.href}
                                                        aria-label={it.aria}
                                                        onClick={() => setOpen(false)}
                                                        target={it.href.startsWith('http') ? '_blank' : undefined}
                                                        rel={it.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                        className="inline-block text-3xl md:text-4xl font-extrabold uppercase tracking-tight
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50 rounded"
                                                        whileHover={{ scale: 1.07 }}
                                                        whileTap={{ scale: 1.0 }}
                                                        transition={{ type: 'tween', duration: 0.22 }}
                                                    >
                                                        {it.label}
                                                    </motion.a>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </nav>

                                    {/* соцсети: при ховере на одном — остальные тускнеют */}
                                    {SOCIALS.length > 0 && (
                                        <motion.ul
                                            variants={itemVariants}
                                            className="group mt-2 flex flex-wrap items-center justify-center gap-6 text-base md:text-lg font-semibold"
                                        >
                                            {SOCIALS.map((s) => (
                                                <li key={s.label} className="transition-opacity opacity-100 group-hover:opacity-60 hover:!opacity-100">
                                                    <motion.a
                                                        href={s.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => setOpen(false)}
                                                        className="inline-block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
                                                        whileHover={{ scale: 1.07 }}
                                                        whileTap={{ scale: 1.0 }}
                                                        transition={{ type: 'tween', duration: 0.22 }}
                                                        title={s.label}
                                                    >
                                                        {s.label}
                                                    </motion.a>
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </div>
                            </motion.div>
                        </motion.aside>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
