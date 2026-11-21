import type { MetadataRoute } from 'next';
import { listEvents, listPathways, listPrograms, listResources, listStories } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const staticPaths = [
    '/',
    '/about',
    '/programs',
    '/learn',
    '/events',
    '/resources',
    '/stories',
    '/donate',
    '/donate/thank-you',
    '/get-involved',
    '/contact',
    '/search',
    '/privacy',
    '/terms',
    '/accessibility',
    '/donor-terms',
    '/child-safety',
    '/subscribers/confirm',
  ];
  const [programs, pathways, events, resources, stories] = await Promise.all([
    listPrograms({ limit: 50 }),
    listPathways({ limit: 50 }),
    listEvents({ limit: 50 }),
    listResources({ limit: 50 }),
    listStories({ limit: 50 }),
  ]);
  const dynamicPaths = [
    ...programs.items.map((item) => `/programs/${item.slug}`),
    ...pathways.items.map((item) => `/learn/${item.slug}`),
    ...events.items.map((item) => `/events/${item.slug}`),
    ...resources.items.map((item) => `/resources/${item.slug}`),
    ...stories.items.map((item) => `/stories/${item.slug}`),
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
