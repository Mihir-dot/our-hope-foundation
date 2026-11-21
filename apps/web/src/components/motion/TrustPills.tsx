'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PILLS = ['Registered NPO', 'Inclusive & accessible', 'Australia-wide family education'];

export function TrustPills() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="container trust-pills" aria-label="Trust">
        {PILLS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="container trust-pills" aria-label="Trust">
      {PILLS.map((label, index) => (
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
        >
          {label}
        </motion.span>
      ))}
    </div>
  );
}
