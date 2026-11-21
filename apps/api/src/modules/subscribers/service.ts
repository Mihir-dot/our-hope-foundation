import { env } from '../../config/env.js';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery } from '../../lib/listQuery.js';
import { sendMail } from '../../lib/mail.js';
import { present } from '../../lib/present.js';
import { verifyTurnstile } from '../../lib/turnstile.js';
import { randomToken, sha256 } from '../../lib/tokens.js';
import { sydneyStamp, toCsv } from '../../lib/csv.js';
import { Subscriber } from './model.js';

async function sendConfirm(email: string, token: string) {
  const confirm = `${env.WEB_ORIGIN}/subscribers/confirm?token=${token}`;
  const unsubscribe = `${env.WEB_ORIGIN}/subscribers/unsubscribe?token=${token}`;
  await sendMail({
    to: email,
    subject: 'Confirm your Our Hope Foundation newsletter',
    text: `Confirm your subscription: ${confirm}\n\nIf this was not you, unsubscribe: ${unsubscribe}`,
    html: `<p>Please confirm you want letters from Our Hope Foundation.</p><p><a href="${confirm}">Confirm subscription</a></p><p><a href="${unsubscribe}">Unsubscribe</a></p>`,
  });
}

export async function requestSubscription(
  email: string,
  opts?: { turnstileToken?: string; ip?: string; skipCaptcha?: boolean },
) {
  if (!opts?.skipCaptcha) await verifyTurnstile(opts?.turnstileToken, opts?.ip);
  const normalised = email.toLowerCase();
  let subscriber = await Subscriber.findOne({ email: normalised }).select('+confirmTokenHash');
  if (subscriber?.status === 'confirmed') return { ok: true as const };
  const token = randomToken();
  if (!subscriber) {
    subscriber = await Subscriber.create({
      email: normalised,
      status: 'pending',
      confirmTokenHash: sha256(token),
    });
  } else {
    subscriber.status = 'pending';
    subscriber.confirmTokenHash = sha256(token);
    await subscriber.save();
    await Subscriber.updateOne({ _id: subscriber._id }, { $unset: { confirmedAt: 1 } });
  }
  await sendConfirm(normalised, token);
  return { ok: true as const };
}

export async function confirmSubscription(token: string) {
  const subscriber = await Subscriber.findOne({ confirmTokenHash: sha256(token) }).select('+confirmTokenHash');
  if (!subscriber) throw ApiError.badRequest('Confirmation link is invalid or expired');
  if (subscriber.status !== 'confirmed') {
    subscriber.status = 'confirmed';
    subscriber.confirmedAt = new Date();
    await subscriber.save();
  }
  return { status: subscriber.status, email: subscriber.email };
}

export async function unsubscribe(input: { token?: string; email?: string }) {
  const filter: Record<string, unknown> = {};
  if (input.token) filter.confirmTokenHash = sha256(input.token);
  else if (input.email) filter.email = input.email.toLowerCase();
  else throw ApiError.badRequest('A token or email is required');
  const subscriber = await Subscriber.findOne(filter).select('+confirmTokenHash');
  if (!subscriber) throw ApiError.notFound('Subscription not found');
  subscriber.status = 'unsubscribed';
  await subscriber.save();
  return { ok: true as const };
}

export async function listSubscribers(query: Record<string, unknown>) {
  const { page, limit, skip, filter } = listQuery(query, ['email']);
  const status = typeof query.status === 'string' ? query.status : '';
  if (status) filter.status = status;
  const [rows, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Subscriber.countDocuments(filter),
  ]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function subscribersCsv(query: Record<string, unknown>) {
  const { filter } = listQuery(query, ['email']);
  const rows = await Subscriber.find(filter).sort({ createdAt: -1 }).lean();
  return toCsv([
    ['email', 'status', 'confirmedAt', 'createdAt'],
    ...rows.map((row) => [row.email, row.status, sydneyStamp(row.confirmedAt), sydneyStamp(row.createdAt)]),
  ]);
}
