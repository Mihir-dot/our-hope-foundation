import type { Metadata } from 'next';
import { eventFormats } from '@ohf/shared';
import { EventCard } from '@/components/site/Cards';
import { FilterBar, Pager } from '@/components/site/FilterBar';
import { PageHero } from '@/components/site/PageHero';
import { EmptyState } from '@/components/ui/EmptyState';
import { first, listEvents } from '@/lib/content';
import { labelize } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Webinars and in-person gatherings for disability families across Australia.',
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const when = first(query.when) || 'upcoming';
  const format = first(query.format);
  const q = first(query.q);
  const page = Number(first(query.page) || 1);
  const result = await listEvents({ when, format, q, page, limit: 12 });

  return (
    <div className="page-main">
      <PageHero eyebrow="Gatherings" title="Events" lede="Come to learn, and leave with one thing you can try at home." />
      <section className="section page-section">
        <div className="container">
          <div className="list-toolbar">
            <form className="inline-search" action="/events" method="get">
              {format ? <input type="hidden" name="format" value={format} /> : null}
              <input type="hidden" name="when" value={when} />
              <div className="field">
                <label htmlFor="event-q">Search events</label>
                <input id="event-q" name="q" defaultValue={q} />
              </div>
              <button className="btn btn-secondary" type="submit">Search</button>
            </form>
            <div className="filter-stack">
              <FilterBar label="When" path="/events" param="when" current={when} keep={{ format, q }} hideAll options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }]} />
              <FilterBar label="Format" path="/events" param="format" current={format} keep={{ when, q }} options={eventFormats.map((item) => ({ value: item, label: labelize(item) }))} />
            </div>
          </div>
          {result.items.length ? (
            <div className="grid-cards">
              {result.items.map((event, index) => (
                <EventCard key={event.slug} event={event} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState title={when === 'past' ? 'No past events yet' : 'No upcoming events'} body="New dates are added as they are confirmed." actionHref="/programs" actionLabel="Look at programs" />
          )}
          <Pager page={result.meta?.page || page} pages={result.meta?.pages || 1} path="/events" query={{ when, format, q }} />
        </div>
      </section>
    </div>
  );
}
