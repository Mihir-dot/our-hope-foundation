import { brand } from '@ohf/shared';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { PageHero } from '@/components/site/PageHero';
import { cmsMetadata } from '@/components/site/CmsPage';
import { getPage, getSettings } from '@/lib/content';

export const generateMetadata = () => cmsMetadata('contact', 'Contact');

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage('contact'), getSettings()]);
  const email = settings?.email || brand.email;
  return (
    <div className="page-main">
      <PageHero
        eyebrow="Contact"
        title={page?.title || 'Contact'}
        lede="Write with a program question, a partnership idea, or a media request."
      />
      <section className="section page-section">
        <div className="container page-layout-2">
          <div className="page-primary">
            {page?.blocks?.length ? <BlockRenderer blocks={page.blocks} compact /> : null}
            <div className="form-panel">
              <h2>Send a message</h2>
              <EnquiryForm variant="contact" />
            </div>
          </div>
          <aside className="info-card">
            <p className="eyebrow">Direct</p>
            <h2>Reach the team</h2>
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            {settings?.phone ? <p>{settings.phone}</p> : null}
            {settings?.address ? <p>{settings.address}</p> : null}
            <p className="meta">We read every message. A reply may take a few days.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
