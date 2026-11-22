import { serverFetch } from './api';
import { primaryNav } from './nav';
import type {
  EventItem,
  ListResult,
  MenuItem,
  PageDoc,
  Pathway,
  Program,
  Resource,
  SearchResults,
  SiteSettings,
  Story,
} from './types';

export function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function qs(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

async function list<T>(path: string, params: Record<string, string | number | undefined | null> = {}): Promise<ListResult<T>> {
  const result = await serverFetch<T[]>(`${path}${qs(params)}`);
  return { items: result?.data ?? [], meta: result?.meta };
}

export function getPage(slug: string) {
  return serverFetch<PageDoc>(`/pages/${slug}`).then((result) => result?.data ?? null);
}

export function getSettings() {
  return serverFetch<SiteSettings>('/settings/public').then((result) => result?.data ?? null);
}

export async function getMenu(location: 'header' | 'footer' | 'legal'): Promise<MenuItem[]> {
  const result = await serverFetch<{ items?: MenuItem[] }>(`/menus/${location}`);
  return result?.data?.items ?? [];
}

export function listPrograms(params: Record<string, string | number | undefined | null> = {}) {
  return list<Program>('/programs', params);
}

export function getProgram(slug: string) {
  return serverFetch<Program>(`/programs/${slug}`).then((result) => result?.data ?? null);
}

export function listEvents(params: Record<string, string | number | undefined | null> = {}) {
  return list<EventItem>('/events', params);
}

export function getEvent(slug: string) {
  return serverFetch<EventItem>(`/events/${slug}`).then((result) => result?.data ?? null);
}

export function listResources(params: Record<string, string | number | undefined | null> = {}) {
  return list<Resource>('/resources', params);
}

export function getResource(slug: string) {
  return serverFetch<Resource>(`/resources/${slug}`).then((result) => result?.data ?? null);
}

export function listStories(params: Record<string, string | number | undefined | null> = {}) {
  return list<Story>('/stories', params);
}

export function getStory(slug: string) {
  return serverFetch<Story>(`/stories/${slug}`).then((result) => result?.data ?? null);
}

export function listPathways(params: Record<string, string | number | undefined | null> = {}) {
  return list<Pathway>('/pathways', params);
}

export function getPathway(slug: string) {
  return serverFetch<Pathway>(`/pathways/${slug}`).then((result) => result?.data ?? null);
}

export function searchContent(q: string) {
  return serverFetch<SearchResults>(`/search${qs({ q })}`).then(
    (result) => result?.data ?? { programs: [], resources: [], stories: [], events: [] },
  );
}

export const fallbackHeader: MenuItem[] = [...primaryNav, { label: 'Donate', href: '/donate' }];

export const fallbackFooter: MenuItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Programs', href: '/programs' },
  { label: 'Donate', href: '/donate' },
];

export const fallbackLegal: MenuItem[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Donor terms', href: '/donor-terms' },
  { label: 'Child safety', href: '/child-safety' },
];
