'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

function parseStat(value: string) {
  const match = value.match(/^([^0-9]*)([0-9][0-9,]*)(.*)$/);
  if (!match) return { prefix: '', num: null as number | null, suffix: value };
  return {
    prefix: match[1],
    num: Number(match[2].replace(/,/g, '')),
    suffix: match[3],
  };
}

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  const reduce = useReducedMotion();
  const parsed = parseStat(value);
  const [n, setN] = useState(reduce || parsed.num == null ? parsed.num : 0);

  useEffect(() => {
    if (!inView || parsed.num == null || reduce) {
      setN(parsed.num);
      return;
    }
    const target = parsed.num;
    const start = performance.now();
    const duration = 1100;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, parsed.num, reduce]);

  if (parsed.num == null) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {(n ?? 0).toLocaleString('en-AU')}
      {parsed.suffix}
    </span>
  );
}
