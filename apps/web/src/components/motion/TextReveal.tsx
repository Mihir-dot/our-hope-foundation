'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function TextReveal({
  children,
  as: Tag = 'h1',
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag];

  if (reduce) {
    const Static = Tag;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <MotionTag
      className={`text-reveal ${className}`.trim()}
      initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
