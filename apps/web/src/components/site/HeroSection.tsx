'use client';

import { Button } from '@/components/ui/Button';
import { HeroCopy, HeroLine, HeroPhoto } from '@/components/motion/HeroMotion';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { siteMedia } from '@/lib/media';

type Cta = { label: string; href: string };

export function HeroSection({
  eyebrow,
  title,
  text,
  primary,
  secondary,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  text: string;
  primary: Cta;
  secondary: Cta;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <HeroCopy>
          <HeroLine>
            <p className="eyebrow">{eyebrow}</p>
          </HeroLine>
          <HeroLine>
            <h1>{title}</h1>
          </HeroLine>
          <HeroLine>
            <p className="lede">{text}</p>
          </HeroLine>
          <HeroLine>
            <div className="hero-actions">
              <MagneticButton href={primary.href} className="btn btn-primary" strength={0}>
                {primary.label} →
              </MagneticButton>
              <Button href={secondary.href} variant="secondary">
                {secondary.label} →
              </Button>
            </div>
          </HeroLine>
        </HeroCopy>
        <HeroPhoto src={image || siteMedia.hero} alt={imageAlt || 'Family learning together'} />
      </div>
    </section>
  );
}
