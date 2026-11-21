import type { z } from 'zod';
import { programUpsertSchema } from '@ohf/shared';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery, queryString } from '../../lib/listQuery.js';
import { present } from '../../lib/present.js';
import { revalidate } from '../../lib/revalidate.js';
import { Program } from './model.js';

type ProgramInput = z.infer<typeof programUpsertSchema>;

function assign(doc: { set: (key: string, value: unknown) => void }, patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) doc.set(key, value);
  }
}

function withFilters(query: Record<string, unknown>, filter: Record<string, unknown>) {
  const topic = queryString(query.topic);
  const audience = queryString(query.audience);
  const format = queryString(query.format);
  if (topic) filter.topics = topic;
  if (audience) filter.audiences = audience;
  if (format) filter.format = format;
  if (queryString(query.featured) === 'true') filter.featured = true;
  return filter;
}

export async function listPrograms(query: Record<string, unknown>, scope: 'public' | 'admin') {
  const { page, limit, skip, filter } = listQuery(query, ['title', 'summary', 'body'], {
    status: scope === 'public' ? 'published' : undefined,
  });
  withFilters(query, filter);
  const [rows, total] = await Promise.all([
    Program.find(filter).sort({ featured: -1, title: 1 }).skip(skip).limit(limit).lean(),
    Program.countDocuments(filter),
  ]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function getPublishedProgram(slug: string) {
  const doc = await Program.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!doc) throw ApiError.notFound('Program not found');
  return present(doc);
}

async function getById(id: string) {
  const doc = await Program.findById(id);
  if (!doc) throw ApiError.notFound('Program not found');
  return doc;
}

export async function getProgram(id: string) {
  return present(await getById(id));
}

export async function createProgram(input: ProgramInput) {
  const doc = await Program.create(input);
  if (doc.status === 'published') await revalidate([`program:${doc.slug}`, 'programs']);
  return present(doc);
}

export async function updateProgram(id: string, patch: Partial<ProgramInput>) {
  const doc = await getById(id);
  assign(doc, patch);
  await doc.save();
  if (doc.status === 'published') await revalidate([`program:${doc.slug}`, 'programs']);
  return present(doc);
}

export async function archiveProgram(id: string) {
  const doc = await getById(id);
  doc.status = 'archived';
  await doc.save();
  await revalidate([`program:${doc.slug}`, 'programs']);
}
