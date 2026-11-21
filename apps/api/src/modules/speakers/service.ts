import type { z } from 'zod';
import { speakerUpsertSchema } from '@ohf/shared';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery } from '../../lib/listQuery.js';
import { present } from '../../lib/present.js';
import { Speaker } from './model.js';

type SpeakerInput = z.infer<typeof speakerUpsertSchema>;

function assign(doc: { set: (key: string, value: unknown) => void }, patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) doc.set(key, value);
  }
}

export async function listSpeakers(query: Record<string, unknown>) {
  const { page, limit, skip, filter } = listQuery(query, ['name', 'role', 'organisation']);
  const [rows, total] = await Promise.all([
    Speaker.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Speaker.countDocuments(filter),
  ]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function getSpeaker(id: string) {
  const doc = await Speaker.findById(id);
  if (!doc) throw ApiError.notFound('Speaker not found');
  return present(doc);
}

export async function createSpeaker(input: SpeakerInput) {
  return present(await Speaker.create(input));
}

export async function updateSpeaker(id: string, patch: Partial<SpeakerInput>) {
  const doc = await Speaker.findById(id);
  if (!doc) throw ApiError.notFound('Speaker not found');
  assign(doc, patch);
  await doc.save();
  return present(doc);
}

export async function deleteSpeaker(id: string) {
  const doc = await Speaker.findById(id);
  if (!doc) throw ApiError.notFound('Speaker not found');
  await doc.deleteOne();
}
