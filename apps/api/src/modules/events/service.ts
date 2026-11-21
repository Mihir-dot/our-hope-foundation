import type { z } from 'zod';
import { eventUpsertSchema, registrationStatuses } from '@ohf/shared';
import { ApiError } from '../../lib/ApiError.js';
import { sydneyStamp, toCsv } from '../../lib/csv.js';
import { listQuery, queryString } from '../../lib/listQuery.js';
import { sendMail } from '../../lib/mail.js';
import { present } from '../../lib/present.js';
import { revalidate } from '../../lib/revalidate.js';
import { verifyTurnstile } from '../../lib/turnstile.js';
import { Speaker } from '../speakers/model.js';
import { requestSubscription } from '../subscribers/service.js';
import { Event } from './model.js';
import { Registration } from '../registrations/model.js';

type EventInput = z.infer<typeof eventUpsertSchema>;

function assign(doc: { set: (key: string, value: unknown) => void }, patch: Record<string, unknown>) {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) doc.set(key, value);
  }
}

function assertDates(startAt?: Date, endAt?: Date) {
  if (startAt && endAt && endAt < startAt) throw ApiError.validation('Event end must be after the start');
}

export function toPublicEvent(doc: unknown) {
  const item = present<Record<string, unknown>>(doc);
  delete item.onlineUrl;
  return item;
}

async function attachSpeakers(doc: unknown) {
  const ids = Array.isArray((doc as { speakerIds?: unknown }).speakerIds)
    ? ((doc as { speakerIds: unknown[] }).speakerIds)
    : [];
  const speakers = await Speaker.find({ _id: { $in: ids } }).lean();
  const order = new Map(ids.map((id, index) => [String(id), index]));
  speakers.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));
  return speakers.map((speaker) => present(speaker));
}

export async function listEvents(query: Record<string, unknown>, scope: 'public' | 'admin') {
  const { page, limit, skip, filter } = listQuery(query, ['title', 'summary', 'body'], {
    status: scope === 'public' ? 'published' : undefined,
  });
  const when = queryString(query.when);
  const now = new Date();
  if (when === 'upcoming') filter.startAt = { $gte: now };
  if (when === 'past') filter.startAt = { $lt: now };
  const format = queryString(query.format);
  const state = queryString(query.state);
  if (format) filter.format = format;
  if (state) filter.state = state;
  const sort = when === 'past' ? { startAt: -1 as const } : { startAt: 1 as const };
  const finder = Event.find(filter).sort(sort).skip(skip).limit(limit);
  if (scope === 'public') finder.select('-onlineUrl');
  const [rows, total] = await Promise.all([finder.lean(), Event.countDocuments(filter)]);
  const items = rows.map((row) => (scope === 'public' ? toPublicEvent(row) : present(row)));
  return { items, total, page, limit };
}

export async function getPublishedEvent(slug: string) {
  const doc = await Event.findOne({ slug: slug.toLowerCase(), status: 'published' }).select('-onlineUrl').lean();
  if (!doc) throw ApiError.notFound('Event not found');
  return { ...toPublicEvent(doc), speakers: await attachSpeakers(doc) };
}

async function getById(id: string) {
  const doc = await Event.findById(id);
  if (!doc) throw ApiError.notFound('Event not found');
  return doc;
}

export async function getEvent(id: string) {
  const doc = await getById(id);
  return { ...present(doc), speakers: await attachSpeakers(doc) };
}

export async function createEvent(input: EventInput) {
  assertDates(input.startAt, input.endAt);
  const doc = await Event.create(input);
  if (doc.status === 'published') await revalidate([`event:${doc.slug}`, 'events']);
  return present(doc);
}

export async function updateEvent(id: string, patch: Partial<EventInput>) {
  const doc = await getById(id);
  assign(doc, patch);
  assertDates(doc.startAt, doc.endAt);
  await doc.save();
  if (doc.status === 'published') await revalidate([`event:${doc.slug}`, 'events']);
  return present(doc);
}

export async function archiveEvent(id: string) {
  const doc = await getById(id);
  doc.status = 'archived';
  await doc.save();
  await revalidate([`event:${doc.slug}`, 'events']);
}

export async function registerForEvent(
  slug: string,
  input: {
    name: string;
    email: string;
    phone?: string;
    accessibilityNeeds?: string;
    marketingOptIn?: boolean;
    turnstileToken?: string;
  },
  ip?: string,
) {
  await verifyTurnstile(input.turnstileToken, ip);
  const event = await Event.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!event) throw ApiError.notFound('Event not found');
  if (event.endAt.getTime() < Date.now()) throw ApiError.badRequest('Registration for this event has closed');

  const taken = await Registration.countDocuments({ eventId: event._id, status: 'registered' });
  const status = taken >= event.capacity ? 'waitlist' : 'registered';
  try {
    const registration = await Registration.create({
      eventId: event._id,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone ?? '',
      accessibilityNeeds: input.accessibilityNeeds ?? '',
      marketingOptIn: Boolean(input.marketingOptIn),
      status,
    });
    const link = status === 'registered' && event.format === 'online' && event.onlineUrl ? event.onlineUrl : '';
    const place = status === 'waitlist'
      ? 'You are on the waitlist. We will email you if a place opens.'
      : 'Your place is confirmed.';
    await sendMail({
      to: registration.email,
      subject: `${status === 'waitlist' ? 'Waitlist' : 'You are registered'}: ${event.title}`,
      text: `${place}\n${event.title}\n${link ? `Join link: ${link}\n` : ''}`,
      html: `<p>${place}</p><p><strong>${event.title}</strong></p>${link ? `<p><a href="${link}">Join the session</a></p>` : ''}`,
    });
    if (input.marketingOptIn) {
      await requestSubscription(registration.email, { skipCaptcha: true });
    }
    return present(registration);
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 11000) throw ApiError.conflict('This email is already registered for the event');
    throw err;
  }
}

export async function listRegistrations(eventId: string, query: Record<string, unknown>) {
  await getById(eventId);
  const { page, limit, skip, filter } = listQuery(query, ['name', 'email'], { base: { eventId } });
  const [rows, total] = await Promise.all([
    Registration.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Registration.countDocuments(filter),
  ]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function registrationsCsv(eventId: string) {
  const event = await getById(eventId);
  const rows = await Registration.find({ eventId }).sort({ createdAt: 1 }).lean();
  return {
    filename: `${event.slug}-registrations.csv`,
    csv: toCsv([
      ['name', 'email', 'phone', 'status', 'accessibilityNeeds', 'marketingOptIn', 'createdAt'],
      ...rows.map((row) => [
        row.name,
        row.email,
        row.phone,
        row.status,
        row.accessibilityNeeds,
        row.marketingOptIn ? 'yes' : 'no',
        sydneyStamp(row.createdAt),
      ]),
    ]),
  };
}

export async function updateRegistration(id: string, status: (typeof registrationStatuses)[number]) {
  const doc = await Registration.findById(id);
  if (!doc) throw ApiError.notFound('Registration not found');
  doc.status = status;
  await doc.save();
  return present(doc);
}
