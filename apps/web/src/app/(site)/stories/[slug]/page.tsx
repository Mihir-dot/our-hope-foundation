import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/site/PageHero';
import { Prose } from '@/components/site/Prose';
import { getStory } from '@/lib/content';
import { formatSydneyDate } from '@/lib/format';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  return { title: story?.seo?.title || story?.title || 'Story', description: story?.seo?.description || story?.excerpt };
}

export default async function StoryPage({ params }: Params) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  return (
    <>
      <PageHero eyebrow="Story" title={story.title} lede={story.excerpt} />
      <section className="section">
        <div className="container narrow">
          <p className="meta">
            {story.authorName || 'A family'}
            {story.publishedAt ? ` · ${formatSydneyDate(story.publishedAt, false)}` : ''}
          </p>
          <Prose text={story.body} />
        </div>
      </section>
    </>
  );
}
