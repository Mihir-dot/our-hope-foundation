import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceDownload } from '@/components/forms/ResourceDownload';
import { PageHero } from '@/components/site/PageHero';
import { Prose } from '@/components/site/Prose';
import { Badge } from '@/components/ui/Badge';
import { getResource } from '@/lib/content';
import { labelize } from '@/lib/format';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResource(slug);
  return { title: resource?.seo?.title || resource?.title || 'Resource', description: resource?.seo?.description || resource?.summary };
}

export default async function ResourcePage({ params }: Params) {
  const { slug } = await params;
  const resource = await getResource(slug);
  if (!resource) notFound();
  const downloadable = Boolean(resource.externalUrl || resource.fileId || resource.type === 'pdf' || resource.type === 'tip-sheet');

  return (
    <>
      <PageHero eyebrow={resource.type ? labelize(resource.type) : 'Resource'} title={resource.title} lede={resource.summary} />
      <section className="section">
        <div className="container detail-grid">
          <div>
            <Prose text={resource.body} />
            {resource.transcript ? (
              <details className="faq">
                <summary>Transcript</summary>
                <Prose text={resource.transcript} />
              </details>
            ) : null}
          </div>
          <aside className="card">
            <div className="chips">
              {resource.language ? <Badge>{resource.language.toUpperCase()}</Badge> : null}
              {resource.minutes ? <Badge tone="info">{resource.minutes} min</Badge> : null}
              {resource.pageCount ? <Badge tone="info">{resource.pageCount} pages</Badge> : null}
              {resource.topics?.map((topic) => <Badge key={topic}>{labelize(topic)}</Badge>)}
            </div>
            {downloadable ? <ResourceDownload slug={resource.slug} externalUrl={resource.externalUrl} /> : null}
          </aside>
        </div>
      </section>
    </>
  );
}
