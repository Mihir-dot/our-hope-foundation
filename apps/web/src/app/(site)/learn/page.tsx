import type { Metadata } from 'next';
import { PathwayCard } from '@/components/site/Cards';
import { PageHero } from '@/components/site/PageHero';
import { EmptyState } from '@/components/ui/EmptyState';
import { listPathways } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Learn',
  description: 'Short reading pathways for families. A pathway is a list, not an online course.',
};

export default async function LearnPage() {
  const result = await listPathways({ limit: 24 });
  return (
    <>
      <PageHero eyebrow="Reading pathways" title="Learn" lede="Start with a short list. Each pathway points to resources you can use this week." />
      <section className="section">
        <div className="container">
          {result.items.length ? (
            <div className="grid-cards">
              {result.items.map((pathway) => (
                <PathwayCard key={pathway.slug} pathway={pathway} />
              ))}
            </div>
          ) : (
            <EmptyState title="Pathways are on the way" body="The resource library is open while these lists are prepared." actionHref="/resources" actionLabel="Browse resources" />
          )}
        </div>
      </section>
    </>
  );
}
