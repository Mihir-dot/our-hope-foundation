import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { first, searchContent } from '@/lib/content';
import type { EventItem, Program, Resource, Story } from '@/lib/types';

export const metadata: Metadata = { title: 'Search', description: 'Search programs, resources, stories, and events.' };

function Group({ title, items, hrefFor, blurb }: { title: string; items: Array<Program | Resource | Story | EventItem>; hrefFor: (item: { slug: string }) => string; blurb: (item: Program & Resource & Story & EventItem) => string | undefined }) {
  if (!items.length) return null;
  return (
    <section className="search-group">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={hrefFor(item)}>{item.title}</Link>
            {blurb(item as Program & Resource & Story & EventItem) ? <p>{blurb(item as Program & Resource & Story & EventItem)}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = first((await searchParams).q)?.trim() || '';
  const results = q.length >= 2 ? await searchContent(q) : null;
  const empty = results && !results.programs.length && !results.resources.length && !results.stories.length && !results.events.length;

  return (
    <>
      <PageHero eyebrow="Search" title="Find something useful" lede="Programs, resources, stories, and events." />
      <section className="section">
        <div className="container">
          <form className="search-panel" action="/search" method="get" role="search">
            <div className="field">
              <label htmlFor="q">Search</label>
              <input id="q" name="q" defaultValue={q} minLength={2} required />
            </div>
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
          {q.length > 0 && q.length < 2 ? <p>Type at least two letters.</p> : null}
          {empty ? <p>Nothing matched “{q}”. Try a topic such as communication or NDIS.</p> : null}
          {results ? (
            <>
              <Group title="Programs" items={results.programs} hrefFor={(item) => `/programs/${item.slug}`} blurb={(item) => item.summary} />
              <Group title="Resources" items={results.resources} hrefFor={(item) => `/resources/${item.slug}`} blurb={(item) => item.summary} />
              <Group title="Stories" items={results.stories} hrefFor={(item) => `/stories/${item.slug}`} blurb={(item) => item.excerpt} />
              <Group title="Events" items={results.events} hrefFor={(item) => `/events/${item.slug}`} blurb={(item) => item.summary} />
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
