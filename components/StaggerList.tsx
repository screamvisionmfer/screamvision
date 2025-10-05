'use client';
import { motion } from 'framer-motion';
import React from 'react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerList<T>({ items, render, active, className }: { items: T[]; render: (t: T, i: number) => React.ReactNode; active: boolean; className?: string; }) {
  return (
    <motion.ul variants={container} initial="hidden" animate={active ? 'show' : 'hidden'} className={className}>
      {items.map((t, i) => (
        <motion.li key={i} variants={item}>
          {render(t, i)}
        </motion.li>
      ))}
    </motion.ul>
  );
}
