import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { PageHero } from '@/components/site/PageHero';
import { cmsMetadata } from '@/components/site/CmsPage';
import { getPage } from '@/lib/content';

export const generateMetadata = () => cmsMetadata('get-involved', 'Get involved');

export default async function GetInvolvedPage() {
  const page = await getPage('get-involved');
  return (
    <>
      <PageHero eyebrow="Take part" title={page?.title || 'Get involved'} lede="Families, volunteers, and partner organisations are welcome." />
      {page?.blocks?.length ? <BlockRenderer blocks={page.blocks} /> : null}
      <section className="section">
        <div className="container grid-2">
          <div>
            <h2>Tell us how you would like to help</h2>
            <p>Volunteers who may be around people under 18 need a Working with Children Check before they start.</p>
            <EnquiryForm variant="involve" />
          </div>
          <aside className="mist-panel">
            <h2>What happens next</h2>
            <p>A person from the foundation reads every message. We reply when we have a real next step, not an automatic note.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
