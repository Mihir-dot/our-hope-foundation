import type { Metadata } from 'next';
import { StoryCard } from '@/components/site/Cards';
import { Pager } from '@/components/site/FilterBar';
import { PageHero } from '@/components/site/PageHero';
import { EmptyState } from '@/components/ui/EmptyState';
import { first, listStories } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Notes from families who learned something they could use the same week.',
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const q = first(query.q);
  const page = Number(first(query.page) || 1);
  const result = await listStories({ q, page, limit: 12 });

  return (
    <>
      <PageHero eyebrow="Families" title="Stories" lede="Short accounts, shared with permission. Names are the ones families asked us to use." />
      <section className="section">
        <div className="container">
          <form className="inline-search" action="/stories" method="get">
            <div className="field">
              <label htmlFor="story-q">Search stories</label>
              <input id="story-q" name="q" defaultValue={q} />
            </div>
            <button className="btn btn-secondary" type="submit">Search</button>
          </form>
          {result.items.length ? (
            <div className="grid-cards">
              {result.items.map((story, index) => (
                <StoryCard key={story.slug} story={story} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState title="No stories match" body="Try a different word, or read a program while more stories are added." actionHref="/programs" actionLabel="See programs" />
          )}
          <Pager page={result.meta?.page || page} pages={result.meta?.pages || 1} path="/stories" query={{ q }} />
        </div>
      </section>
    </>
  );
}
