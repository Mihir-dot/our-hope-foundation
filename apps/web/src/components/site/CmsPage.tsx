import type { Metadata } from 'next';
import { brand } from '@ohf/shared';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { PageHero } from '@/components/site/PageHero';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPage } from '@/lib/content';

export async function cmsMetadata(slug: string, fallback: string): Promise<Metadata> {
  const page = await getPage(slug);
  return {
    title: page?.seo?.title || page?.title || fallback,
    description: page?.seo?.description || brand.missionLine,
  };
}

export async function CmsPage({
  slug,
  eyebrow = 'Our Hope Foundation',
  fallbackTitle,
  lede,
}: {
  slug: string;
  eyebrow?: string;
  fallbackTitle: string;
  lede?: string;
}) {
  const page = await getPage(slug);
  return (
    <div className="page-main">
      <PageHero eyebrow={eyebrow} title={page?.title || fallbackTitle} lede={lede || page?.seo?.description} />
      {page?.blocks?.length ? (
        <div className="page-cms">
          <BlockRenderer blocks={page.blocks} />
        </div>
      ) : (
        <section className="section page-section">
          <div className="container">
            <EmptyState
              title="This page is being prepared"
              body="Please check back soon, or write to us if you need it now."
              actionHref="/contact"
              actionLabel="Contact"
            />
          </div>
        </section>
      )}
    </div>
  );
}
