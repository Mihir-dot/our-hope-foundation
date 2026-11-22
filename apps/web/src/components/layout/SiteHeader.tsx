'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { HopeLogo } from '@/components/brand/HopeLogo';
import { HeartPulse, MagneticButton } from '@/components/motion/MagneticButton';
import { primaryNav } from '@/lib/nav';
import type { MenuItem } from '@/lib/types';

function hasChildren(item: MenuItem) {
  return Boolean(item.children?.length);
}

export function SiteHeader({ items }: { items?: MenuItem[] }) {
  const source = (items?.length ? items : primaryNav).filter((item) => item.href !== '/donate');
  const [scrolled, setScrolled] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const mobileRef = useRef<HTMLDetailsElement>(null);
  const panelId = useId();
  const pathname = usePathname();

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenKey(null), 150);
  }, []);

  const openPanel = useCallback((key: string) => {
    clearCloseTimer();
    setOpenKey(key);
  }, []);

  const closeMobile = useCallback(() => {
    if (mobileRef.current) mobileRef.current.open = false;
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const syncHeaderHeight = () => {
      if (!rootRef.current) return;
      document.documentElement.style.setProperty(
        '--site-header-h',
        `${rootRef.current.offsetHeight}px`,
      );
    };
    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);
    return () => window.removeEventListener('resize', syncHeaderHeight);
  }, [mobileOpen, scrolled]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenKey(null);
        closeMobile();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenKey(null);
        closeMobile();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [closeMobile]);

  useEffect(() => {
    document.body.classList.toggle('nav-mobile-open', mobileOpen);
    return () => document.body.classList.remove('nav-mobile-open');
  }, [mobileOpen]);

  useEffect(() => {
    setOpenKey(null);
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => () => clearCloseTimer(), []);

  const openItem = source.find((item) => `${item.label}:${item.href}` === openKey);

  return (
    <header
      ref={rootRef}
      className={`site-header ${scrolled ? 'is-scrolled' : ''} ${openKey || mobileOpen ? 'is-open' : ''}`}
      onMouseLeave={scheduleClose}
    >
      <div className="container header-inner">
        <Link href="/" className="brand-lockup" onFocus={() => setOpenKey(null)}>
          <HopeLogo variant="mark" decorative className="brand-mark" />
          <span>
            <strong>Our Hope Foundation</strong>
            <small>Nurturing abilities · Inspiring futures</small>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Primary" onMouseEnter={clearCloseTimer}>
          {source.map((item) => {
            const key = `${item.label}:${item.href}`;
            const nested = hasChildren(item);
            const isOpen = openKey === key;

            if (!nested) {
              return (
                <div className="nav-item" key={key}>
                  <Link className="nav-trigger" href={item.href} onMouseEnter={() => setOpenKey(null)}>
                    {item.label}
                  </Link>
                </div>
              );
            }

            return (
              <div
                className="nav-item"
                key={key}
                onMouseEnter={() => openPanel(key)}
                onFocus={() => openPanel(key)}
              >
                <button
                  type="button"
                  className="nav-trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenKey(isOpen ? null : key)}
                >
                  {item.label}
                  <span className="nav-chevron" aria-hidden />
                </button>
              </div>
            );
          })}
        </nav>

        <details
          ref={mobileRef}
          className="nav-mobile"
          onToggle={(event) => {
            setMobileOpen((event.currentTarget as HTMLDetailsElement).open);
            setOpenKey(null);
          }}
        >
          <summary aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
            <span className="nav-mobile-icon" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            Menu
          </summary>
          <nav aria-label="Primary mobile">
            {source.map((item) => {
              if (!hasChildren(item)) {
                return (
                  <Link
                    key={`${item.label}:${item.href}`}
                    href={item.href}
                    onClick={closeMobile}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <details key={`${item.label}:${item.href}`} className="nav-mobile-group">
                  <summary>{item.label}</summary>
                  <nav>
                    <Link href={item.href} onClick={closeMobile}>
                      Overview
                    </Link>
                    {item.children!.map((child) => (
                      <Link
                        key={`${child.label}:${child.href}`}
                        href={child.href}
                        onClick={closeMobile}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </nav>
                </details>
              );
            })}
            <Link href="/donate" onClick={closeMobile}>
              Donate
            </Link>
          </nav>
        </details>

        <MagneticButton href="/donate" className="btn btn-donate btn-small" strength={0}>
          Donate <HeartPulse />
        </MagneticButton>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          className="nav-mobile-backdrop"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <div
        id={panelId}
        className={`mega-panel ${openItem ? 'is-open' : ''}`}
        role="region"
        aria-label={openItem ? `${openItem.label} menu` : 'Submenu'}
        aria-hidden={!openItem}
        onMouseEnter={clearCloseTimer}
      >
        {openItem ? (
          <div className="container mega-panel-inner">
            <div className="mega-blurb">
              <h3>{openItem.label}</h3>
              {openItem.description ? <p>{openItem.description}</p> : null}
              <Link href={openItem.href}>View all {openItem.label.toLowerCase()} →</Link>
            </div>
            <div className="mega-links">
              {openItem.children!.map((child) => (
                <Link
                  key={`${child.label}:${child.href}`}
                  href={child.href}
                  onClick={() => setOpenKey(null)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
            <div className="mega-panel-footer" style={{ gridColumn: '1 / -1' }}>
              <Link href="/donate" onClick={() => setOpenKey(null)}>
                Donate
              </Link>
              <Link href="/contact" onClick={() => setOpenKey(null)}>
                Contact
              </Link>
              <Link href="/search" onClick={() => setOpenKey(null)}>
                Search
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
