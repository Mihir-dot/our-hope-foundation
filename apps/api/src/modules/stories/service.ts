import type { z } from 'zod';
import { storyUpsertSchema } from '@ohf/shared';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery } from '../../lib/listQuery.js';
import { present } from '../../lib/present.js';
import { revalidate } from '../../lib/revalidate.js';
import { Story } from './model.js';

type StoryInput = z.infer<typeof storyUpsertSchema>;

function assign(doc: { set: (key: string, value: unknown) => void }, patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) doc.set(key, value);
  }
}

export async function listStories(query: Record<string, unknown>, scope: 'public' | 'admin') {
  const { page, limit, skip, filter } = listQuery(query, ['title', 'excerpt', 'body'], {
    status: scope === 'public' ? 'published' : undefined,
  });
  const rowsQuery = Story.find(filter).skip(skip).limit(limit);
  if (scope === 'public') rowsQuery.sort({ publishedAt: -1 });
  else rowsQuery.sort({ updatedAt: -1 });
  const [rows, total] = await Promise.all([rowsQuery.lean(), Story.countDocuments(filter)]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function getPublishedStory(slug: string) {
  const doc = await Story.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!doc) throw ApiError.notFound('Story not found');
  return present(doc);
}

async function getById(id: string) {
  const doc = await Story.findById(id);
  if (!doc) throw ApiError.notFound('Story not found');
  return doc;
}

export async function getStory(id: string) {
  return present(await getById(id));
}

export async function createStory(input: StoryInput) {
  const doc = await Story.create({
    ...input,
    publishedAt: input.status === 'published' ? input.publishedAt ?? new Date() : input.publishedAt,
  });
  if (doc.status === 'published') await revalidate([`story:${doc.slug}`, 'stories']);
  return present(doc);
}

export async function updateStory(id: string, patch: Partial<StoryInput>) {
  const doc = await getById(id);
  assign(doc, patch);
  if (doc.status === 'published' && !doc.publishedAt) doc.publishedAt = new Date();
  await doc.save();
  if (doc.status === 'published') await revalidate([`story:${doc.slug}`, 'stories']);
  return present(doc);
}

export async function archiveStory(id: string) {
  const doc = await getById(id);
  doc.status = 'archived';
  await doc.save();
  await revalidate([`story:${doc.slug}`, 'stories']);
}
