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
      <div className="footer-trust">
        <TrustPills />
      </div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="footer-brand-lockup">
            <HopeLogo variant="mark" decorative className="footer-mark" />
            <span>
              <strong>{name}</strong>
              <small>Nurturing abilities · Inspiring futures</small>
            </span>
          </Link>
          <p className="ack">{settings?.acknowledgement || brand.acknowledgement}</p>
          <div className="footer-meta">
            {settings?.abn ? <span>ABN {settings.abn}</span> : null}
            {settings?.dgrEndorsed ? <span>Deductible gift recipient</span> : null}
            {settings?.ndisProvider ? null : <span>Not an NDIS provider</span>}
          </div>
        </div>
        <div className="footer-col">
          <h2 className="eyebrow">Explore</h2>
          <nav className="footer-links" aria-label="Footer">
            {footerItems.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-col">
          <h2 className="eyebrow">Letters for families</h2>
          <p className="footer-blurb">Occasional notes about workshops, resources, and events. No noise.</p>
          <SubscribeForm />
          <p className="footer-contact">
            <a href={`mailto:${email}`}>{email}</a>
            {settings?.phone ? <span> · {settings.phone}</span> : null}
          </p>
        </div>
      </div>
      <div className="container legal-row">
        <span>
          © {new Date().getFullYear()} {name}
        </span>
        <nav className="legal-links" aria-label="Legal">
          {legalItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
