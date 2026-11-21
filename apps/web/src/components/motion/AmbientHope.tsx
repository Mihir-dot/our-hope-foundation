'use client';

import { useReducedMotion } from 'framer-motion';

export function AmbientHope() {
  const reduce = useReducedMotion();

  return (
    <div className={`ambient-hope ${reduce ? 'is-still' : ''}`} aria-hidden>
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
      <div className="ambient-blob ambient-blob-c" />
      <div className="ambient-grain" />
    </div>
  );
}
