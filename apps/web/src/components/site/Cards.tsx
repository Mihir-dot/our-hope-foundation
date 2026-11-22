import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { eventImage, programImage, resourceImage, storyImage } from '@/lib/media';
import { formatSydneyDate, labelize } from '@/lib/format';
import type { EventItem, Pathway, Program, Resource, Story } from '@/lib/types';

function MediaCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="card-media">
      <Image
        src={src}
        alt={alt}
        fill
        quality={85}
        sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 400px"
        className="card-media-img"
      />
    </div>
  );
}

export function ProgramCard({ program, index = 0 }: { program: Program; index?: number }) {
  return (
    <Card href={`/programs/${program.slug}`} className="card-premium">
      <MediaCover src={programImage(program.slug, index)} alt={program.title} />
      <div className="card-body">
        <div className="card-top">
          {program.topics?.[0] ? <Badge tone="good">{labelize(program.topics[0])}</Badge> : null}
          {program.format ? <Badge tone="info">{labelize(program.format)}</Badge> : null}
        </div>
        <h3>{program.title}</h3>
        {program.summary ? <p>{program.summary}</p> : null}
        <span className="learn-more">Learn more →</span>
      </div>
    </Card>
  );
}

export function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  return (
    <Card href={`/events/${event.slug}`} className="card-premium">
      <MediaCover src={eventImage(event.slug, index)} alt={event.title} />
      <div className="card-body">
        <div className="card-top">
          {event.format ? <Badge tone="info">{labelize(event.format)}</Badge> : null}
          {event.state ? <span className="meta">{event.state}</span> : null}
        </div>
        <p className="meta">{formatSydneyDate(event.startAt)}</p>
        <h3>{event.title}</h3>
        {event.summary ? <p>{event.summary}</p> : null}
        <span className="learn-more">View event →</span>
      </div>
    </Card>
  );
}

export function ResourceCard({ resource, index = 0 }: { resource: Resource; index?: number }) {
  const length = resource.minutes ? `${resource.minutes} min` : resource.pageCount ? `${resource.pageCount} pages` : '';
  return (
    <Card href={`/resources/${resource.slug}`} className="card-premium">
      <MediaCover src={resourceImage(resource.slug, index)} alt={resource.title} />
      <div className="card-body">
        <div className="card-top">
          {resource.type ? <Badge>{labelize(resource.type)}</Badge> : null}
          {length ? <span className="meta">{length}</span> : null}
        </div>
        <h3>{resource.title}</h3>
        {resource.summary ? <p>{resource.summary}</p> : null}
        <span className="learn-more">Open resource →</span>
      </div>
    </Card>
  );
}

export function StoryCard({ story, index = 0 }: { story: Story; index?: number }) {
  return (
    <Card href={`/stories/${story.slug}`} className="card-premium">
      <MediaCover src={storyImage(index)} alt={story.title} />
      <div className="card-body">
        <p className="meta">{story.authorName || formatSydneyDate(story.publishedAt, false)}</p>
        <h3>{story.title}</h3>
        {story.excerpt ? <p>{story.excerpt}</p> : null}
        <span className="learn-more">Read story →</span>
      </div>
    </Card>
  );
}

export function PathwayCard({ pathway }: { pathway: Pathway }) {
  const count = pathway.resources?.length;
  return (
    <Card href={`/learn/${pathway.slug}`} className="card-premium">
      <MediaCover src={programImage(pathway.slug, 0)} alt={pathway.title} />
      <div className="card-body">
        <p className="meta">{count ? `${count} reads` : 'Reading pathway'}</p>
        <h3>{pathway.title}</h3>
        {pathway.summary ? <p>{pathway.summary}</p> : null}
        <span className="learn-more">Open pathway →</span>
      </div>
    </Card>
  );
}
