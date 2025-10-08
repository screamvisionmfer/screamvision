"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PreloaderOverlayPro from "./PreloaderOverlayPro";
import Header from "./Header";

// === started context ===
const StartedCtx = createContext(false);
export const useStarted = () => useContext(StartedCtx);

export default function ClientPreloaderShell({ children }: { children?: React.ReactNode }) {
  const [started, setStarted] = useState(false);

  // метка на <html> и сброс возможных overflow
  useEffect(() => {
    if (started) {
      document.documentElement.dataset.started = "1";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    } else {
      delete document.documentElement.dataset.started;
    }
  }, [started]);

  return (
    <>
      {/* Прелоудер с fade-out */}
      <AnimatePresence mode="wait">
        {!started && <PreloaderOverlayPro onDone={() => setStarted(true)} />}
      </AnimatePresence>

      {/* Основной слой: контент + плавный fade-in/blur-out */}
      <StartedCtx.Provider value={started}>
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: started ? 1 : 0, filter: started ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: started ? 0.1 : 0 }}
        >
          <Header started={started} />
          <main className="min-h-screen">
            {children ?? (
              <div className="p-10 text-center text-white/70">
                Debug: children отсутствуют. Помести ClientPreloaderShell в <code>app/layout.tsx</code> и передай <code>{`{children}`}</code>.
              </div>
            )}
          </main>
        </motion.div>
      </StartedCtx.Provider>
    </>
  );
}
