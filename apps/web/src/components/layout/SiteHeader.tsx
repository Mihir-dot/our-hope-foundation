'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HopeLogo } from '@/components/brand/HopeLogo';
import { HeartPulse, MagneticButton } from '@/components/motion/MagneticButton';

const FALLBACK = [
  { label: 'Programs', href: '/programs' },
  { label: 'Resources', href: '/resources' },
  { label: 'Events', href: '/events' },
  { label: 'Stories', href: '/stories' },
  { label: 'Get involved', href: '/get-involved' },
];

export function SiteHeader({
  items,
}: {
  items?: { label: string; href: string }[];
}) {
  const links = (items?.length ? items : FALLBACK).filter((item) => item.href !== '/donate');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Link href="/" className="brand-lockup">
          <HopeLogo variant="mark" decorative className="brand-mark" />
          <span>
            <strong>Our Hope Foundation</strong>
            <small>Nurturing abilities · Inspiring futures</small>
          </span>
        </Link>
        <nav className="nav-desktop" aria-label="Primary">
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="nav-mobile">
          <summary aria-label="Open menu">Menu</summary>
          <nav aria-label="Primary mobile">
            {links.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/donate">Donate</Link>
          </nav>
        </details>
        <MagneticButton href="/donate" className="btn btn-donate btn-small btn-glow" strength={10}>
          Donate <HeartPulse />
        </MagneticButton>
      </div>
    </header>
  );
}
