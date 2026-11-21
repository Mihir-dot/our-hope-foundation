import type { z } from 'zod';
import { pathwayUpsertSchema } from '@ohf/shared';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery } from '../../lib/listQuery.js';
import { present } from '../../lib/present.js';
import { revalidate } from '../../lib/revalidate.js';
import { Resource } from '../resources/model.js';
import { Pathway } from './model.js';

type PathwayInput = z.infer<typeof pathwayUpsertSchema>;

function assign(doc: { set: (key: string, value: unknown) => void }, patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) doc.set(key, value);
  }
}

async function withResources(doc: unknown, publishedOnly: boolean) {
  const source = present<Record<string, unknown>>(doc);
  const ids = Array.isArray(source.resourceIds) ? source.resourceIds : [];
  const filter: Record<string, unknown> = { _id: { $in: ids } };
  if (publishedOnly) filter.status = 'published';
  const resources = await Resource.find(filter).lean();
  const order = new Map(ids.map((id, index) => [String(id), index]));
  resources.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));
  return {
    ...source,
    resources: resources.map((item) => present(item)),
  } as Record<string, unknown>;
}

export async function listPathways(query: Record<string, unknown>, scope: 'public' | 'admin') {
  const { page, limit, skip, filter } = listQuery(query, ['title', 'summary'], {
    status: scope === 'public' ? 'published' : undefined,
  });
  const [rows, total] = await Promise.all([
    Pathway.find(filter).sort({ title: 1 }).skip(skip).limit(limit).lean(),
    Pathway.countDocuments(filter),
  ]);
  const items = await Promise.all(rows.map((row) => withResources(row, scope === 'public')));
  return { items, total, page, limit };
}

export async function getPublishedPathway(slug: string) {
  const doc = await Pathway.findOne({ slug: slug.toLowerCase(), status: 'published' }).lean();
  if (!doc) throw ApiError.notFound('Pathway not found');
  return withResources(doc, true);
}

async function getById(id: string) {
  const doc = await Pathway.findById(id);
  if (!doc) throw ApiError.notFound('Pathway not found');
  return doc;
}

export async function getPathway(id: string) {
  return withResources(await getById(id), false);
}

export async function createPathway(input: PathwayInput) {
  const doc = await Pathway.create(input);
  if (doc.status === 'published') await revalidate([`pathway:${doc.slug}`, 'pathways']);
  return withResources(doc, false);
}

export async function updatePathway(id: string, patch: Partial<PathwayInput>) {
  const doc = await getById(id);
  assign(doc, patch);
  await doc.save();
  if (doc.status === 'published') await revalidate([`pathway:${doc.slug}`, 'pathways']);
  return withResources(doc, false);
}

export async function archivePathway(id: string) {
  const doc = await getById(id);
  doc.status = 'archived';
  await doc.save();
  await revalidate([`pathway:${doc.slug}`, 'pathways']);
}
