import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceCard } from '@/components/site/Cards';
import { PageHero } from '@/components/site/PageHero';
import { getPathway } from '@/lib/content';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const pathway = await getPathway(slug);
  return { title: pathway?.title || 'Pathway', description: pathway?.summary };
}

export default async function PathwayPage({ params }: Params) {
  const { slug } = await params;
  const pathway = await getPathway(slug);
  if (!pathway) notFound();

  return (
    <div className="page-main">
      <PageHero eyebrow="Reading pathway" title={pathway.title} lede={pathway.summary} />
      <section className="section page-section">
        <div className="container">
          <div className="grid-cards">
            {(pathway.resources ?? []).map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
