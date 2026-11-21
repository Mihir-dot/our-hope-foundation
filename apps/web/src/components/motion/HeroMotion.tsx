'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function HeroCopy({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <div>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroLine({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroPhoto({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 56]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 1.04, reduce ? 1 : 1.08]);

  return (
    <div className="hero-photo" ref={ref}>
      <motion.div
        className="hero-photo-motion"
        style={{ y, scale }}
        initial={reduce ? false : { scale: 1.04, opacity: 0.88 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image src={src} alt={alt} width={900} height={720} priority sizes="(max-width: 980px) 100vw, 48vw" />
      </motion.div>
      {!reduce ? (
        <>
          <div className="hero-photo-sheen" aria-hidden />
          <div className="hero-hope-beam" aria-hidden />
          <div className="hero-vignette" aria-hidden />
        </>
      ) : (
        <div className="hero-vignette" aria-hidden />
      )}
    </div>
  );
}
