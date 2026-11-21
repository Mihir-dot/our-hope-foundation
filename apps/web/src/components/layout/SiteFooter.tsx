import Link from 'next/link';
import { brand } from '@ohf/shared';
import { HopeLogo } from '@/components/brand/HopeLogo';
import { SubscribeForm } from '@/components/forms/SubscribeForm';
import { TrustPills } from '@/components/motion/TrustPills';
import { fallbackFooter, fallbackLegal, getMenu, getSettings } from '@/lib/content';

export async function SiteFooter() {
  const [settings, footer, legal] = await Promise.all([getSettings(), getMenu('footer'), getMenu('legal')]);
  const footerItems = footer.length ? footer : fallbackFooter;
  const legalItems = legal.length ? legal : fallbackLegal;
  const name = settings?.legalName || brand.legalName;
  const email = settings?.email || brand.email;

  return (
    <footer className="site-footer">
      <TrustPills />
      <div className="container footer-grid">
        <div>
          <HopeLogo variant="full" className="footer-logo" />
          <p className="ack">{settings?.acknowledgement || brand.acknowledgement}</p>
          {settings?.abn ? <p className="meta">ABN {settings.abn}</p> : null}
          {settings?.dgrEndorsed ? <p className="meta">Deductible gift recipient</p> : null}
          {settings?.ndisProvider ? null : <p className="meta">Not an NDIS provider</p>}
        </div>
        <div>
          <h2 className="eyebrow">Explore</h2>
          <nav className="footer-links" aria-label="Footer">
            {footerItems.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="eyebrow">Letters for families</h2>
          <p>Occasional notes about workshops, resources, and events. No noise.</p>
          <SubscribeForm />
          <p className="meta">
            <a href={`mailto:${email}`}>{email}</a>
            {settings?.phone ? <span> · {settings.phone}</span> : null}
          </p>
        </div>
      </div>
      <div className="container legal-row">
        <span>© {new Date().getFullYear()} {name}</span>
        {legalItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
