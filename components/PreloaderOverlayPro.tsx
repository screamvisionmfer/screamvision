'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const tips = [
  'Warming up shaders…',
  'Summoning assets from void…',
  'Preheating VHS head…',
  'De-noising pixels…',
  'Sharpening knives… just kidding',
];

export default function PreloaderOverlayPro({
  done,
  progress,           // 0..1
  brand = '',
  onSkip,
}: {
  done: boolean;
  progress: number;
  brand?: string;
  onSkip?: () => void;
}) {
  const [tipIdx, setTipIdx] = useState(0);
  const pct = Math.min(100, Math.round(progress * 100));

  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 700);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onSkip?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSkip]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader-pro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="fixed inset-0 z-[1000] bg-black text-white"
          onClick={onSkip}
          style={{ touchAction: 'manipulation' }}  // не блокируем скролл на мобиле
        >
          {/* animated grain */}
          <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-30">
            <div className="absolute inset-0 will-change-transform animate-grain bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')]" />
          </div>

          {/* radial “from darkness” vignette */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            style={{
              WebkitMaskImage: 'radial-gradient(70% 70% at 50% 50%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
              maskImage: 'radial-gradient(70% 70% at 50% 50%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
            }}
          />

          <div className="relative h-full w-full flex items-center justify-center p-6">
            <div className="w-[min(92vw,560px)]">
              {/* brand + shimmer */}
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-6 text-center select-none"
              >
                <div className="text-2xl font-black tracking-[0.18em] uppercase relative inline-block">
                  {brand || ' '}
                  <span className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(75deg,transparent,white,transparent)] animate-shimmer" />
                </div>
              </motion.div>

              {/* progress bar with diagonal stripes */}
              <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded relative bg-white/80"
                  style={{ width: '0%' }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className="absolute inset-0 [background-image:linear-gradient(45deg,rgba(0,0,0,.0)25%,rgba(0,0,0,.12)25%,rgba(0,0,0,.12)50%,rgba(0,0,0,.0)50%,rgba(0,0,0,.0)75%,rgba(0,0,0,.12)75%,rgba(0,0,0,.12)100%)] [background-size:24px_24px] animate-diag" />
                </motion.div>
              </div>

              {/* tips + percent */}
              <div className="mt-3 flex items-center justify-between text-xs opacity-70">
                <span>{tips[tipIdx]}</span>
                <span>{pct}%</span>
              </div>

              <div className="mt-6 text-center text-[11px] opacity-40">Click or press ESC to skip</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
