'use client';

import { HopeLogo } from '@/components/brand/HopeLogo';
import { TextReveal } from '@/components/motion/TextReveal';

export function PageHero({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: string }) {
  return (
    <header className="page-hero">
      <div className="container page-hero-inner">
        <HopeLogo variant="mark" decorative className="page-hero-mark" />
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <TextReveal as="h1">{title}</TextReveal>
          {lede ? <p className="lede">{lede}</p> : null}
        </div>
      </div>
    </header>
  );
}
