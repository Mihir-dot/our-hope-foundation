'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.2 });

  if (reduce) return null;

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden />;
}
