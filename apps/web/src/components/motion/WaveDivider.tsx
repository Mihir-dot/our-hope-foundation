'use client';

import { useReducedMotion } from 'framer-motion';

export function WaveDivider({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={`wave-divider ${reduce ? 'is-still' : ''} ${className}`.trim()} aria-hidden>
      <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="wave-divider-svg">
        <path
          className="wave-path wave-path-a"
          d="M0 28 C150 8 300 48 450 28 C600 8 750 48 900 28 C1050 8 1125 20 1200 28 L1200 48 L0 48 Z"
          fill="currentColor"
        />
        <path
          className="wave-path wave-path-b"
          d="M0 32 C180 48 320 12 480 32 C640 52 780 16 960 32 C1080 42 1140 28 1200 34 L1200 48 L0 48 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
