import { NavigationEffects } from '@/components/layout/NavigationEffects';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AmbientHope } from '@/components/motion/AmbientHope';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { brand } from '@ohf/shared';
import { fallbackHeader, getMenu, getSettings } from '@/lib/content';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, menu] = await Promise.all([getSettings(), getMenu('header')]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: settings?.legalName || brand.legalName,
    email: settings?.email || brand.email,
    description: brand.tagline,
    slogan: brand.heroHeadline,
    areaServed: 'AU',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AmbientHope />
      <ScrollProgress />
      <NavigationEffects />
      <div className="site-shell">
        <SiteHeader items={menu.length ? menu : fallbackHeader} />
        <main id="main">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
