import Link from 'next/link';
import { brand } from '@ohf/shared';
import { FadeIn } from '@/components/blocks/FadeIn';
import { CountUp } from '@/components/motion/CountUp';
import { JourneyPath, Whisper } from '@/components/motion/JourneyPath';
import { Stagger, StaggerItem } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { WaveDivider } from '@/components/motion/WaveDivider';
import { EventCard, ProgramCard, ResourceCard, StoryCard } from '@/components/site/Cards';
import { HeroSection } from '@/components/site/HeroSection';
import { Button } from '@/components/ui/Button';
import { getSettings, listEvents, listPrograms, listResources, listStories } from '@/lib/content';
import { sanitizeHtml } from '@/lib/format';
import { siteMedia } from '@/lib/media';
import type { ContentBlock, EventItem, Program, Resource, SiteSettings, Story } from '@/lib/types';

function JourneyIcon({ name }: { name: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'school':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M3 10l9-6 9 6-9 6-9-6z" />
          <path d="M7 12.5V17c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4.5" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.6-7 10-7 10z" />
        </svg>
      );
    case 'signpost':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M12 3v18" />
          <path d="M5 8h10l2 2-2 2H5V8z" />
          <path d="M7 14h9l2 2-2 2H7v-4z" />
        </svg>
      );
    case 'compass':
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5l-2.2 5.3-5.3 2.2 2.2-5.3 5.3-2.2z" />
        </svg>
      );
  }
}

function ImpactIcon({ index }: { index: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, width: 22, height: 22 };
  if (index % 4 === 1) {
    return <svg viewBox="0 0 24 24" aria-hidden {...common}><path d="M12 21s-7-4.4-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.6-7 10-7 10z" /></svg>;
  }
  if (index % 4 === 2) {
    return <svg viewBox="0 0 24 24" aria-hidden {...common}><path d="M12 3l2.2 4.5L19 8.2l-3.5 3.4.8 4.9L12 14.3 7.7 16.5l.8-4.9L5 8.2l4.8-.7L12 3z" /></svg>;
  }
  if (index % 4 === 3) {
    return <svg viewBox="0 0 24 24" aria-hidden {...common}><path d="M3 17c2-4 5-6 9-6s7 2 9 6" /><circle cx="12" cy="8" r="3" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden {...common}><circle cx="9" cy="9" r="3" /><circle cx="16" cy="10" r="2.5" /><path d="M3 19c1.5-3 3.8-4.5 6.5-4.5S15 16 16.5 19" /><path d="M14 19c.8-1.6 2-2.5 3.8-2.5 1.4 0 2.5.6 3.2 1.8" /></svg>;
}

function records(value: unknown) {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
}

function text(data: Record<string, unknown>, key: string, fallback = '') {
  const value = data[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function limitOf(data: Record<string, unknown>, fallback = 3) {
  const value = data.limit;
  return typeof value === 'number' && value > 0 ? value : fallback;
}

function cta(value: unknown): { label: string; href: string } | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as { label?: unknown; href?: unknown };
  if (typeof item.label === 'string' && typeof item.href === 'string') return { label: item.label, href: item.href };
  return null;
}

function Heading({ eyebrow, title, text }: { eyebrow?: string; title?: string; text?: string }) {
  if (!eyebrow && !title && !text) return null;
  return (
    <div className="narrow">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <TextReveal as="h2">{title}</TextReveal> : null}
      {text ? <p className="lede">{text}</p> : null}
    </div>
  );
}

async function renderBlock(block: ContentBlock, settings: SiteSettings | null, compact = false) {
  const data = block.data ?? {};
  const sectionClass = compact ? 'section page-section' : 'section';

  switch (block.type) {
    case 'hero': {
      const primary = cta(data.primaryCta) ?? { label: 'Explore programs', href: '/programs' };
      const secondary = cta(data.secondaryCta) ?? { label: 'Join a webinar', href: '/events' };
      return (
        <HeroSection
          eyebrow={text(data, 'eyebrow', brand.missionLine)}
          title={text(data, 'title', brand.heroHeadline)}
          text={text(
            data,
            'text',
            'Practical education, resources and connection for parents and carers of children with disability across Australia.',
          )}
          primary={primary}
          secondary={secondary}
          image={text(data, 'image', siteMedia.hero)}
          imageAlt={text(data, 'imageAlt', 'Family learning together at home')}
        />
      );
    }
    case 'richText': {
      const html = text(data, 'html') || text(data, 'text');
      if (!html) return null;
      if (compact) {
        return <div className="prose prose-page" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
      }
      return (
        <section className={sectionClass}>
          <div className="container prose prose-page" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
        </section>
      );
    }
    case 'journey': {
      const steps = records(data.steps) ?? [];
      const icons = ['compass', 'school', 'heart', 'signpost'];
      return (
        <>
          <section className="section-tight journey-wrap">
            <div className="container">
              <div className="journey-panel">
                <Whisper>You&apos;re not alone in this.</Whisper>
                <Heading title={text(data, 'title', 'Where you are in your journey')} text={text(data, 'text')} />
                <div className="journey-path-wrap">
                  <JourneyPath />
                  <Stagger className="journey">
                    {steps.map((step, index) => {
                      const href = text(step, 'href');
                      const icon = text(step, 'icon', icons[index % icons.length]);
                      const inner = (
                        <>
                          <div className="journey-icon">
                            <JourneyIcon name={icon} />
                          </div>
                          <h3>{text(step, 'title')}</h3>
                          <p>{text(step, 'text')}</p>
                        </>
                      );
                      return (
                        <StaggerItem key={text(step, 'title') || index}>
                          {href ? (
                            <Link href={href} className="journey-item">
                              {inner}
                            </Link>
                          ) : (
                            <article className="journey-item">{inner}</article>
                          )}
                        </StaggerItem>
                      );
                    })}
                  </Stagger>
                </div>
              </div>
            </div>
          </section>
          <WaveDivider />
        </>
      );
    }
    case 'cardGrid': {
      const cards = records(data.items) ?? records(data.cards) ?? [];
      return (
        <section className="section">
          <div className="container">
            <Heading eyebrow={text(data, 'eyebrow')} title={text(data, 'title')} text={text(data, 'text')} />
            <div className="grid-cards">
              {cards.map((card, index) => {
                const href = text(card, 'href');
                const body = (
                  <>
                    {text(card, 'eyebrow') ? <p className="meta">{text(card, 'eyebrow')}</p> : null}
                    <h3>{text(card, 'title')}</h3>
                    <p>{text(card, 'text')}</p>
                  </>
                );
                return href ? (
                  <Link key={index} href={href} className="card card-link">{body}</Link>
                ) : (
                  <article key={index} className="card">{body}</article>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
    case 'moduleGrid': {
      const modules = records(data.items) ?? records(data.modules) ?? [];
      return (
        <section className="section module-section">
          <div className="container">
            <Heading
              eyebrow={text(data, 'eyebrow', 'What we offer')}
              title={text(data, 'title', 'Support for every stage of family life')}
              text={text(
                data,
                'text',
                'Explore programs, learning pathways, resources and ways to get involved — hover a module to see related links.',
              )}
            />
            <Stagger className="module-grid">
              {modules.map((mod, index) => {
                const href = text(mod, 'href', '#');
                const links = records(mod.links) ?? [];
                const icon = text(mod, 'icon', 'compass');
                return (
                  <StaggerItem key={text(mod, 'title') || index}>
                    <article className="module-card" tabIndex={0}>
                      <Link href={href} className="module-card-top">
                        <div className="module-icon">
                          <JourneyIcon name={icon} />
                        </div>
                        <h3>{text(mod, 'title')}</h3>
                        <p className="module-summary">{text(mod, 'summary') || text(mod, 'text')}</p>
                        <span className="module-card-cta">Learn more →</span>
                      </Link>
                      {links.length ? (
                        <div className="module-links" aria-label={`${text(mod, 'title')} links`}>
                          {links.map((link, linkIndex) => (
                            <Link key={linkIndex} href={text(link, 'href', href)}>
                              {text(link, 'label')}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </section>
      );
    }
    case 'statRow': {
      const inline = records(data.stats) ?? records(data.items);
      const stats = inline ?? settings?.impactStats ?? [
        { label: 'Families supported', value: '3,200+', note: 'Across Australia' },
        { label: 'Webinars delivered', value: '120+', note: 'Practical family learning' },
        { label: 'Families feeling more confident', value: '98%', note: 'After joining a program' },
      ];
      return (
        <section className="section">
          <div className="container">
            <Heading title={text(data, 'title', 'Our impact')} text={text(data, 'text')} />
            <Stagger className="stat-row">
              {stats.map((stat, index) => (
                <StaggerItem key={String(stat.label)}>
                  <article className="stat">
                    <div className="impact-icon" style={{ marginBottom: '0.75rem' }}>
                      <ImpactIcon index={index} />
                    </div>
                    <strong>
                      <CountUp value={String(stat.value)} />
                    </strong>
                    <h3>{String(stat.label)}</h3>
                    {stat.note ? <p className="meta">{String(stat.note)}</p> : null}
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="impact-whisper">Every number is a family.</p>
          </div>
        </section>
      );
    }
    case 'eventList': {
      const provided = records(data.items) as EventItem[] | null;
      const items = provided ?? (await listEvents({ limit: limitOf(data), when: 'upcoming' })).items;
      const withImpact = data.withImpact === true;
      const stats = settings?.impactStats?.length
        ? settings.impactStats
        : [
            { label: 'Families supported', value: '3,200+', note: 'Across Australia' },
            { label: 'Webinars delivered', value: '120+', note: 'Practical family learning' },
            { label: 'Families feeling more confident', value: '98%', note: 'After joining a program' },
            { label: 'Reach', value: 'All across Australia', note: 'Regional, rural and metro' },
          ];

      const eventsBlock = (
        <>
          <div className="section-head">
            <Heading title={text(data, 'title', 'Upcoming webinars')} />
            <Link href="/events" className="view-all">
              View all events →
            </Link>
          </div>
          {items.length ? (
            <Stagger className="grid-cards" >
              {items.map((item, index) => (
                <StaggerItem key={item.slug}>
                  <EventCard event={item} index={index} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p>New dates will be listed here. Join the letter if you would like to hear first.</p>
          )}
        </>
      );

      if (!withImpact) {
        return (
          <section className="section">
            <div className="container">{eventsBlock}</div>
          </section>
        );
      }

      return (
        <section className="section">
          <div className="container grid-2">
            <div>{eventsBlock}</div>
            <aside className="impact-panel">
              <p className="eyebrow">Our impact</p>
              <h2>Families growing in confidence</h2>
              <div className="impact-list">
                {stats.slice(0, 4).map((stat, index) => (
                  <div className="impact-row" key={String(stat.label)}>
                    <div className="impact-icon">
                      <ImpactIcon index={index} />
                    </div>
                    <div>
                      <strong>
                        <CountUp value={String(stat.value)} />
                      </strong>
                      <span>
                        {String(stat.label)}
                        {stat.note ? ` · ${String(stat.note)}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="impact-whisper" style={{ textAlign: 'left', marginTop: '1rem' }}>
                Every number is a family.
              </p>
            </aside>
          </div>
          <WaveDivider />
        </section>
      );
    }
    case 'programList': {
      const provided = records(data.items) as Program[] | null;
      const items = provided ?? (await listPrograms({ limit: limitOf(data), featured: data.featured === true ? 'true' : undefined })).items;
      return (
        <>
          <section className="section">
            <div className="container">
              <div className="admin-top">
                <Heading title={text(data, 'title', 'Programs')} text={text(data, 'text')} />
                <Button href="/programs" variant="secondary">All programs</Button>
              </div>
              <Stagger className="grid-cards">
                {items.map((item, index) => (
                  <StaggerItem key={item.slug}>
                    <ProgramCard program={item} index={index} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
          <WaveDivider />
        </>
      );
    }
    case 'resourceList': {
      const provided = records(data.items) as Resource[] | null;
      const items = provided ?? (await listResources({ limit: limitOf(data) })).items;
      return (
        <section className="section">
          <div className="container">
            <div className="admin-top">
              <Heading title={text(data, 'title', 'From the library')} />
              <Button href="/resources" variant="secondary">All resources</Button>
            </div>
            <Stagger className="grid-cards">
              {items.map((item, index) => (
                <StaggerItem key={item.slug}>
                  <ResourceCard resource={item} index={index} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      );
    }
    case 'storyList': {
      const provided = records(data.items) as Story[] | null;
      const items = provided ?? (await listStories({ limit: limitOf(data) })).items;
      return (
        <section className="section">
          <div className="container">
            <div className="admin-top">
              <Heading title={text(data, 'title', 'Stories from families')} />
              <Button href="/stories" variant="secondary">All stories</Button>
            </div>
            <Stagger className="grid-cards">
              {items.map((item, index) => (
                <StaggerItem key={item.slug}>
                  <StoryCard story={item} index={index} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      );
    }
    case 'ctaBand': {
      const action = cta(data.cta) ?? { label: 'Donate', href: '/donate' };
      return (
        <section className="section">
          <div className="container">
            <div className="cta-band">
              <div className="cta-band-orbs" aria-hidden>
                <span className="cta-orb cta-orb-a" />
                <span className="cta-orb cta-orb-b" />
              </div>
              <TextReveal as="h2">{text(data, 'title', 'Give families more good days')}</TextReveal>
              <p>{text(data, 'text', 'Gifts fund workshops, resources, and community events.')}</p>
              <Button href={action.href} variant={action.href.includes('donate') ? 'donate' : 'secondary'}>
                {action.label}
              </Button>
            </div>
          </div>
        </section>
      );
    }
    case 'faq': {
      const items = records(data.items) ?? [];
      return (
        <section className="section">
          <div className="container narrow faq">
            <Heading title={text(data, 'title', 'Questions families ask')} />
            {items.map((item, index) => (
              <details key={index}>
                <summary>{text(item, 'question') || text(item, 'q')}</summary>
                <p>{text(item, 'answer') || text(item, 'a')}</p>
              </details>
            ))}
          </div>
        </section>
      );
    }
    case 'logoCloud': {
      const logos = records(data.logos) ?? (Array.isArray(data.logos) ? data.logos.map((name) => ({ name })) : []);
      return (
        <section className="section">
          <div className="container">
            <Heading title={text(data, 'title', 'Alongside the community')} />
            <div className="logo-cloud">
              {logos.map((logo, index) => {
                const name = text(logo, 'name') || text(logo, 'label') || String(logo);
                const href = text(logo, 'href');
                return href ? (
                  <a key={index} className="logo-pill" href={href}>{name}</a>
                ) : (
                  <span key={index} className="logo-pill">{name}</span>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
    case 'splitFeature': {
      return (
        <section className={sectionClass}>
          <div className="container page-layout-2">
            <div>
              <Heading eyebrow={text(data, 'eyebrow')} title={text(data, 'title')} text={text(data, 'text')} />
              {cta(data.cta) ? <Button href={cta(data.cta)!.href}>{cta(data.cta)!.label}</Button> : null}
            </div>
            <aside className="info-card">
              <p className="eyebrow">Our Hope</p>
              <h3>Family education first</h3>
              <p>Programs, resources and events for parents, carers, siblings and guardians — clear, practical and respectful.</p>
            </aside>
          </div>
        </section>
      );
    }
    case 'trustRow': {
      const custom = records(data.items);
      const items = custom ?? [
        { title: 'Education for families', text: 'Programs are for parents, carers, siblings, and guardians. They are not therapy and not an NDIS plan.' },
        { title: settings?.ndisProvider ? 'NDIS provider' : 'Not an NDIS provider', text: 'When a family needs a registered provider, we help them know what to ask.' },
        { title: settings?.dgrEndorsed ? 'Tax-deductible gifts' : 'Gifts in Australian dollars', text: settings?.abn ? `ABN ${settings.abn}` : 'Receipts say what the gift was for, and that no GST was charged.' },
      ];
      return (
        <section className="section">
          <div className="container">
            <Heading title={text(data, 'title', 'A charity families can read clearly')} text={text(data, 'text')} />
            <div className="trust-row">
              {items.map((item, index) => (
                <article key={index} className="card">
                  <h3>{text(item, 'title')}</h3>
                  <p>{text(item, 'text')}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }
    default:
      return null;
  }
}

export async function BlockRenderer({
  blocks,
  animate = false,
  compact = false,
}: {
  blocks: ContentBlock[];
  animate?: boolean;
  compact?: boolean;
}) {
  const needsSettings = blocks.some((block) => block.type === 'statRow' || block.type === 'trustRow' || block.type === 'hero');
  const settings = needsSettings ? await getSettings() : null;
  const nodes = await Promise.all(
    blocks.map(async (block) => {
      const content = await renderBlock(block, settings, compact);
      if (!content) return null;
      return animate ? <FadeIn key={block.id}>{content}</FadeIn> : <div key={block.id}>{content}</div>;
    }),
  );
  return compact ? <div className="page-blocks">{nodes}</div> : <>{nodes}</>;
}
