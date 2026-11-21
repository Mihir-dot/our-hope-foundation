import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { PageHero } from '@/components/site/PageHero';
import { Prose } from '@/components/site/Prose';
import { getProgram } from '@/lib/content';
import { labelize } from '@/lib/format';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  return {
    title: program?.seo?.title || program?.title || 'Program',
    description: program?.seo?.description || program?.summary,
  };
}

export default async function ProgramPage({ params }: Params) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  return (
    <>
      <PageHero eyebrow={program.format ? labelize(program.format) : 'Program'} title={program.title} lede={program.summary} />
      <section className="section">
        <div className="container detail-grid">
          <Prose text={program.body} />
          <aside className="card">
            {program.durationText ? <p><strong>Time</strong><br />{program.durationText}</p> : null}
            {program.audiences?.length ? (
              <div className="chips">{program.audiences.map((item) => <Badge key={item}>{labelize(item)}</Badge>)}</div>
            ) : null}
            {program.topics?.length ? (
              <div className="chips">{program.topics.map((item) => <Badge key={item} tone="info">{labelize(item)}</Badge>)}</div>
            ) : null}
            <p className="meta">Our Hope Foundation is not an NDIS provider. This program is family education.</p>
            <a className="btn btn-secondary" href="/events">See related events</a>
          </aside>
        </div>
      </section>
    </>
  );
}
