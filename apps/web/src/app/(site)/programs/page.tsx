import type { Metadata } from 'next';
import { audiences, programFormats, topics } from '@ohf/shared';
import { ProgramCard } from '@/components/site/Cards';
import { FilterBar, Pager } from '@/components/site/FilterBar';
import { PageHero } from '@/components/site/PageHero';
import { EmptyState } from '@/components/ui/EmptyState';
import { first, listPrograms } from '@/lib/content';
import { labelize } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Workshops, webinars, and self-paced learning for disability families.',
};

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const topic = first(query.topic);
  const audience = first(query.audience);
  const format = first(query.format);
  const q = first(query.q);
  const page = Number(first(query.page) || 1);
  const result = await listPrograms({ topic, audience, format, q, page, limit: 12 });

  return (
    <>
      <PageHero eyebrow="Learning" title="Programs" lede="Practical education for families. A program is a place to learn, not a clinical service." />
      <section className="section">
        <div className="container">
          <form className="inline-search" action="/programs" method="get">
            <div className="field">
              <label htmlFor="program-q">Search programs</label>
              <input id="program-q" name="q" defaultValue={q} />
            </div>
            <button className="btn btn-secondary" type="submit">Search</button>
          </form>
          <div className="filter-stack">
            <FilterBar label="Topic" path="/programs" param="topic" current={topic} keep={{ audience, format, q }} options={topics.map((item) => ({ value: item, label: labelize(item) }))} />
            <FilterBar label="Who it is for" path="/programs" param="audience" current={audience} keep={{ topic, format, q }} options={audiences.map((item) => ({ value: item, label: labelize(item) }))} />
            <FilterBar label="Format" path="/programs" param="format" current={format} keep={{ topic, audience, q }} options={programFormats.map((item) => ({ value: item, label: labelize(item) }))} />
          </div>
          {result.items.length ? (
            <div className="grid-cards">
              {result.items.map((program, index) => (
                <ProgramCard key={program.slug} program={program} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState title="No programs match" body="Try another filter, or look through the resource library." actionHref="/resources" actionLabel="Browse resources" />
          )}
          <Pager page={result.meta?.page || page} pages={result.meta?.pages || 1} path="/programs" query={{ topic, audience, format, q }} />
        </div>
      </section>
    </>
  );
}
