'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function JourneyPath() {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className="journey-path-line is-still" aria-hidden role="presentation" />;
  }

  return (
    <svg className="journey-path-line" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden>
      <motion.path
        d="M20 12 H980"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 10"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.55 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function Whisper({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <p className="whisper">{children}</p>;
  return (
    <motion.p
      className="whisper"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.p>
  );
}
