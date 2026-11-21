import type { z } from 'zod';
import { pageUpsertSchema } from '@ohf/shared';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery } from '../../lib/listQuery.js';
import { present } from '../../lib/present.js';
import { revalidate } from '../../lib/revalidate.js';
import { Page } from './model.js';

type PageInput = z.infer<typeof pageUpsertSchema>;

function assign(doc: { set: (key: string, value: unknown) => void }, patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) doc.set(key, value);
  }
}

async function touch(slug: string) {
  await revalidate([`page:${slug}`, 'pages']);
}

export async function listPages(query: Record<string, unknown>, scope: 'public' | 'admin') {
  const { page, limit, skip, filter } = listQuery(query, ['title', 'slug'], {
    status: scope === 'public' ? 'published' : undefined,
  });
  const [rows, total] = await Promise.all([
    Page.find(filter).sort({ title: 1 }).skip(skip).limit(limit).lean(),
    Page.countDocuments(filter),
  ]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function getPublishedPage(slug: string) {
  const doc = await Page.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!doc) throw ApiError.notFound('Page not found');
  return present(doc);
}

export async function getPage(id: string) {
  const doc = await Page.findById(id);
  if (!doc) throw ApiError.notFound('Page not found');
  return doc;
}

export async function createPage(input: PageInput) {
  const doc = await Page.create(input);
  if (doc.status === 'published') await touch(doc.slug);
  return present(doc);
}

export async function updatePage(id: string, patch: Partial<PageInput>) {
  const doc = await getPage(id);
  const previous = doc.slug;
  assign(doc, patch);
  await doc.save();
  if (doc.status === 'published' || previous !== doc.slug) {
    await touch(previous);
    if (previous !== doc.slug) await touch(doc.slug);
  }
  return present(doc);
}

export async function publishPage(id: string) {
  const doc = await getPage(id);
  doc.status = 'published';
  await doc.save();
  await touch(doc.slug);
  return present(doc);
}

export async function deletePage(id: string) {
  const doc = await getPage(id);
  await doc.deleteOne();
  await touch(doc.slug);
}
