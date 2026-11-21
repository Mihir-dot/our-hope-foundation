'use client';

import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useRef } from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
};

export function MagneticButton({ href, children, className = '', strength = 12 }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.3 });

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set((dx / rect.width) * strength);
    y.set((dy / rect.height) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  if (reduce) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <motion.div style={{ x: springX, y: springY }} className="magnetic-wrap">
      <Link
        ref={ref}
        href={href}
        className={className}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function HeartPulse({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`heart-pulse ${reduce ? 'is-still' : ''} ${className}`.trim()} aria-hidden>
      ♥
    </span>
  );
}
