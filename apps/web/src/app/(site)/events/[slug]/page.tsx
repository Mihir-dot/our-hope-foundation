import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventRegisterForm } from '@/components/forms/EventRegisterForm';
import { PageHero } from '@/components/site/PageHero';
import { Prose } from '@/components/site/Prose';
import { Badge } from '@/components/ui/Badge';
import { getEvent } from '@/lib/content';
import { formatSydneyDate, labelize } from '@/lib/format';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return { title: event?.seo?.title || event?.title || 'Event', description: event?.seo?.description || event?.summary };
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const open = event.endAt ? new Date(event.endAt).getTime() > Date.now() : true;
  const place = [event.venueName, event.address, event.state].filter(Boolean).join(', ');

  return (
    <>
      <PageHero eyebrow={event.format ? labelize(event.format) : 'Event'} title={event.title} lede={event.summary} />
      <section className="section">
        <div className="container detail-grid">
          <div>
            <p className="meta">
              {formatSydneyDate(event.startAt)}
              {event.endAt ? ` – ${formatSydneyDate(event.endAt)}` : ''} · Australia/Sydney
            </p>
            <Prose text={event.body} />
            {event.speakers?.length ? (
              <div>
                <h2>With</h2>
                {event.speakers.map((speaker) => (
                  <p key={speaker.name}>
                    <strong>{speaker.name}</strong>
                    {speaker.role ? ` · ${speaker.role}` : ''}
                    {speaker.organisation ? `, ${speaker.organisation}` : ''}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          <aside className="card">
            {event.format ? <Badge tone="info">{labelize(event.format)}</Badge> : null}
            {place ? <p>{place}</p> : <p>The joining details arrive by email after you register.</p>}
            {open ? <EventRegisterForm slug={event.slug} /> : <p className="notice">Registration for this event has closed.</p>}
          </aside>
        </div>
      </section>
    </>
  );
}
