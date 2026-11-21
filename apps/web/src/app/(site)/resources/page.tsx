import type { Metadata } from 'next';
import { resourceLanguages, resourceTypes, topics } from '@ohf/shared';
import { ResourceCard } from '@/components/site/Cards';
import { FilterBar, Pager } from '@/components/site/FilterBar';
import { PageHero } from '@/components/site/PageHero';
import { EmptyState } from '@/components/ui/EmptyState';
import { first, listResources } from '@/lib/content';
import { labelize } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Articles, tip sheets, and recordings families can use this week.',
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const topic = first(query.topic);
  const type = first(query.type);
  const language = first(query.language);
  const q = first(query.q);
  const page = Number(first(query.page) || 1);
  const result = await listResources({ topic, type, language, q, page, limit: 12 });

  return (
    <>
      <PageHero eyebrow="Library" title="Resources" lede="Short pieces written for the kitchen table, not the clinic." />
      <section className="section">
        <div className="container">
          <form className="inline-search" action="/resources" method="get">
            <div className="field">
              <label htmlFor="resource-q">Search resources</label>
              <input id="resource-q" name="q" defaultValue={q} />
            </div>
            <button className="btn btn-secondary" type="submit">Search</button>
          </form>
          <div className="filter-stack">
            <FilterBar label="Type" path="/resources" param="type" current={type} keep={{ topic, language, q }} options={resourceTypes.map((item) => ({ value: item, label: labelize(item) }))} />
            <FilterBar label="Topic" path="/resources" param="topic" current={topic} keep={{ type, language, q }} options={topics.map((item) => ({ value: item, label: labelize(item) }))} />
            <FilterBar label="Language" path="/resources" param="language" current={language} keep={{ topic, type, q }} options={resourceLanguages.map((item) => ({ value: item, label: item.toUpperCase() }))} />
          </div>
          {result.items.length ? (
            <div className="grid-cards">
              {result.items.map((resource, index) => (
                <ResourceCard key={resource.slug} resource={resource} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing in this filter" body="Clear a filter or search with fewer words." actionHref="/resources" actionLabel="Show everything" />
          )}
          <Pager page={result.meta?.page || page} pages={result.meta?.pages || 1} path="/resources" query={{ topic, type, language, q }} />
        </div>
      </section>
    </>
  );
}
