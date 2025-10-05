'use client';
import { AnimatePresence, motion } from 'framer-motion';

export default function PreloaderOverlay({ done, progress, brand }: { done: boolean; progress: number; brand?: string }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="fixed inset-0 z-[1000] bg-black text-white flex items-center justify-center"
          aria-label="Loading"
        >
          <div className="w-[min(90vw,520px)] px-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-center mb-6 select-none">
              <div className="text-2xl font-black tracking-wide">{brand || 'LOADING'}</div>
              <div className="text-xs/5 opacity-60">Preparing assets…</div>
            </motion.div>
            <div className="h-2 w-full bg-white/10 rounded">
              <motion.div
                className="h-full bg-white rounded"
                style={{ width: `${Math.floor(progress * 100)}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.floor(progress * 100)}%` }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
              />
            </div>
            <div className="mt-2 text-right text-[10px] tabular-nums opacity-60">{Math.floor(progress * 100)}%</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
