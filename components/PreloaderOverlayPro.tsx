"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";

type Props = {
  onDone?: () => void;
  autoSkipMs?: number;
  src?: string;
  className?: string;
};

export default function PreloaderOverlayPro({
  onDone = () => { },
  autoSkipMs = 10000,
  src = "/videos/preloader.mp4",
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedRef = useRef(false);

  const finish = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    requestAnimationFrame(() => onDone());
  }, [onDone]);

  // lock scroll
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // skip by interaction + timeout
  useEffect(() => {
    const handle = () => finish();
    const onWheel = () => finish();
    window.addEventListener("click", handle, { passive: true });
    window.addEventListener("touchstart", handle, { passive: true });
    window.addEventListener("keydown", handle);
    window.addEventListener("wheel", onWheel, { passive: true });
    const t = setTimeout(finish, autoSkipMs);
    return () => {
      clearTimeout(t);
      window.removeEventListener("click", handle);
      window.removeEventListener("touchstart", handle);
      window.removeEventListener("keydown", handle);
      window.removeEventListener("wheel", onWheel);
    };
  }, [autoSkipMs, finish]);

  // autoplay try
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    (async () => {
      try { await v.play(); } catch { }
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transitionEnd: { pointerEvents: "none" } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={"fixed inset-0 z-[9999] bg-black flex items-center justify-center " + (className ?? "")}
      onClick={finish}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs tracking-widest uppercase animate-pulse select-none">
        Tap / Scroll to enter
      </div>
    </motion.div>
  );
}
