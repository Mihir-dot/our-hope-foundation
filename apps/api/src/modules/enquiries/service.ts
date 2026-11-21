import type { z } from 'zod';
import { enquiryCreateSchema, enquiryStatuses } from '@ohf/shared';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery, queryString } from '../../lib/listQuery.js';
import { sendMail } from '../../lib/mail.js';
import { present } from '../../lib/present.js';
import { verifyTurnstile } from '../../lib/turnstile.js';
import { getSettings } from '../settings/service.js';
import { Enquiry } from './model.js';

type EnquiryInput = z.infer<typeof enquiryCreateSchema>;

export async function createEnquiry(input: EnquiryInput, ip?: string) {
  await verifyTurnstile(input.turnstileToken, ip);
  const doc = await Enquiry.create({
    type: input.type,
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone ?? '',
    message: input.message,
    state: input.state,
    interests: input.interests ?? [],
    availability: input.availability ?? '',
    organisation: input.organisation ?? '',
    wwcc: input.wwcc,
    status: 'new',
  });
  const settings = await getSettings();
  const inbox = settings.email || 'hello@ourhopefoundation.org.au';
  await sendMail({
    to: inbox,
    subject: `New ${doc.type} enquiry from ${doc.name}`,
    text: `${doc.name} <${doc.email}>\n${doc.phone}\n\n${doc.message}`,
    html: `<p><strong>${doc.name}</strong> &lt;${doc.email}&gt;</p><p>${doc.message}</p>`,
  });
  await sendMail({
    to: doc.email,
    subject: 'We received your message — Our Hope Foundation',
    text: `Thank you ${doc.name}. We have your ${doc.type} enquiry and will reply from ${inbox}.`,
    html: `<p>Thank you ${doc.name}. We have your enquiry and will reply from ${inbox}.</p>`,
  });
  return present(doc);
}

export async function listEnquiries(query: Record<string, unknown>) {
  const { page, limit, skip, filter } = listQuery(query, ['name', 'email', 'message', 'organisation']);
  const type = queryString(query.type);
  if (type) filter.type = type;
  const [rows, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Enquiry.countDocuments(filter),
  ]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function getEnquiry(id: string) {
  const doc = await Enquiry.findById(id);
  if (!doc) throw ApiError.notFound('Enquiry not found');
  return present(doc);
}

export async function updateEnquiry(
  id: string,
  patch: { status?: (typeof enquiryStatuses)[number]; assigneeId?: string | null },
) {
  const doc = await Enquiry.findById(id);
  if (!doc) throw ApiError.notFound('Enquiry not found');
  if (patch.status) doc.status = patch.status;
  if (patch.assigneeId !== undefined) doc.assigneeId = patch.assigneeId;
  await doc.save();
  return present(doc);
}
