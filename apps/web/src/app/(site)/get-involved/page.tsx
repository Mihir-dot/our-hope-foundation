import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { PageHero } from '@/components/site/PageHero';
import { cmsMetadata } from '@/components/site/CmsPage';
import { getPage } from '@/lib/content';

export const generateMetadata = () => cmsMetadata('get-involved', 'Get involved');

export default async function GetInvolvedPage() {
  const page = await getPage('get-involved');
  return (
    <div className="page-main">
      <PageHero
        eyebrow="Take part"
        title={page?.title || 'Get involved'}
        lede="Families, volunteers, and partner organisations are welcome."
      />
      <section className="section page-section">
        <div className="container page-layout-2">
          <div className="page-primary">
            {page?.blocks?.length ? <BlockRenderer blocks={page.blocks} compact /> : null}
            <div className="form-panel">
              <h2>Tell us how you would like to help</h2>
              <p className="footer-blurb">
                Volunteers who may be around people under 18 need a Working with Children Check before they start.
              </p>
              <EnquiryForm variant="involve" />
            </div>
          </div>
          <aside className="info-card">
            <p className="eyebrow">What happens next</p>
            <h2>A real reply</h2>
            <p>
              A person from the foundation reads every message. We reply when we have a real next step, not an automatic
              note.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}