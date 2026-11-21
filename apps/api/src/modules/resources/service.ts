import type { Response } from 'express';
import type { z } from 'zod';
import { resourceUpsertSchema } from '@ohf/shared';
import { env } from '../../config/env.js';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery, queryString } from '../../lib/listQuery.js';
import { present } from '../../lib/present.js';
import { revalidate } from '../../lib/revalidate.js';
import { signedDownload } from '../media/service.js';
import { Resource } from './model.js';

type ResourceInput = z.infer<typeof resourceUpsertSchema>;

function assign(doc: { set: (key: string, value: unknown) => void }, patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) doc.set(key, value);
  }
}

function assertTranscript(doc: { type?: string; status?: string; transcript?: string }) {
  if (doc.type === 'webinar-recording' && doc.status === 'published' && !doc.transcript?.trim()) {
    throw ApiError.validation('A webinar recording needs a transcript before it can be published');
  }
}

function withFilters(query: Record<string, unknown>, filter: Record<string, unknown>) {
  const topic = queryString(query.topic);
  const audience = queryString(query.audience);
  const type = queryString(query.type);
  const language = queryString(query.language);
  if (topic) filter.topics = topic;
  if (audience) filter.audiences = audience;
  if (type) filter.type = type;
  if (language) filter.language = language;
  if (queryString(query.featured) === 'true') filter.featured = true;
  return filter;
}

export async function listResources(query: Record<string, unknown>, scope: 'public' | 'admin') {
  const { page, limit, skip, filter } = listQuery(query, ['title', 'summary', 'body'], {
    status: scope === 'public' ? 'published' : undefined,
  });
  withFilters(query, filter);
  const rowsQuery = Resource.find(filter).skip(skip).limit(limit);
  if (scope === 'public') rowsQuery.sort({ featured: -1, publishedAt: -1 });
  else rowsQuery.sort({ updatedAt: -1 });
  const [rows, total] = await Promise.all([rowsQuery.lean(), Resource.countDocuments(filter)]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function getPublishedResource(slug: string) {
  const doc = await Resource.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!doc) throw ApiError.notFound('Resource not found');
  return present(doc);
}

async function getById(id: string) {
  const doc = await Resource.findById(id);
  if (!doc) throw ApiError.notFound('Resource not found');
  return doc;
}

export async function getResource(id: string) {
  return present(await getById(id));
}

export async function createResource(input: ResourceInput) {
  assertTranscript(input);
  const doc = await Resource.create({
    ...input,
    publishedAt: input.status === 'published' ? input.publishedAt ?? new Date() : input.publishedAt,
  });
  if (doc.status === 'published') await revalidate([`resource:${doc.slug}`, 'resources']);
  return present(doc);
}

export async function updateResource(id: string, patch: Partial<ResourceInput>) {
  const doc = await getById(id);
  assign(doc, patch);
  assertTranscript(doc);
  if (doc.status === 'published' && !doc.publishedAt) doc.publishedAt = new Date();
  await doc.save();
  if (doc.status === 'published') await revalidate([`resource:${doc.slug}`, 'resources']);
  return present(doc);
}

export async function archiveResource(id: string) {
  const doc = await getById(id);
  doc.status = 'archived';
  await doc.save();
  await revalidate([`resource:${doc.slug}`, 'resources']);
}

export async function downloadResource(slug: string) {
  const doc = await Resource.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!doc) throw ApiError.notFound('Resource not found');
  doc.downloadCount += 1;
  await doc.save();
  if (doc.externalUrl) return { url: doc.externalUrl };
  if (!doc.fileId) throw ApiError.badRequest('This resource has no file yet');
  const signed = await signedDownload(String(doc.fileId));
  return { url: signed.url };
}

export async function streamResourceFile(slug: string, res: Response) {
  const doc = await Resource.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!doc) throw ApiError.notFound('Resource not found');
  if (doc.externalUrl) {
    res.redirect(doc.externalUrl);
    return;
  }
  if (!doc.fileId) throw ApiError.notFound('File not found');
  const signed = await signedDownload(String(doc.fileId));
  if (signed.storage === 's3') {
    res.redirect(signed.url);
    return;
  }
  const { resolveMediaPath } = await import('../media/service.js');
  res.setHeader('Content-Type', signed.media.mime);
  res.sendFile(resolveMediaPath(signed.media.key));
}

export function resourceFileUrl(slug: string) {
  return `${env.API_PUBLIC_URL.replace(/\/$/, '')}/api/v1/resources/${slug}/file`;
}
