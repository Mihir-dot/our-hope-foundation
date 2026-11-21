import { nanoid } from 'nanoid';
import type Stripe from 'stripe';
import { env, hasStripe } from '../../config/env.js';
import { stripe } from '../../config/stripe.js';
import { ApiError } from '../../lib/ApiError.js';
import { sydneyStamp, toCsv } from '../../lib/csv.js';
import { listQuery, queryString } from '../../lib/listQuery.js';
import { logger } from '../../lib/logger.js';
import { sendMail } from '../../lib/mail.js';
import { present } from '../../lib/present.js';
import { verifyTurnstile } from '../../lib/turnstile.js';
import { getSettings } from '../settings/service.js';
import { StripeEvent } from '../stripeevents/model.js';
import { Donation } from './model.js';

type Loose = Record<string, any>;

function idOf(value: unknown): string | undefined {
  if (typeof value === 'string' && value) return value;
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === 'string' && id) return id;
  }
  return undefined;
}

function aud(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100);
}

async function sendReceipt(donationId: string) {
  const donation = await Donation.findById(donationId);
  if (!donation || donation.receiptSentAt || !donation.donorEmail || donation.status !== 'succeeded') return;
  const settings = await getSettings();
  let portalUrl = '';
  if (stripe && donation.stripeCustomerId) {
    try {
      const portal = await stripe.billingPortal.sessions.create({
        customer: donation.stripeCustomerId,
        return_url: `${env.WEB_ORIGIN}/donate`,
      });
      portalUrl = portal.url;
    } catch (err) {
      logger.warn({ err }, 'Stripe customer portal link was not created');
    }
  }
  const when = new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'long',
    timeZone: 'Australia/Sydney',
  }).format(new Date());
  const tax = settings.dgrEndorsed
    ? 'This donation is tax-deductible. Donation — no GST has been charged.'
    : 'Donation — no GST has been charged.';
  const abn = settings.abn ? `ABN ${settings.abn}` : '';
  const text = [
    settings.legalName,
    abn,
    `${aud(donation.amountCents)} · ${donation.frequency === 'monthly' ? 'Monthly' : 'One-off'}`,
    when,
    `Reference ${donation.id}`,
    tax,
    portalUrl ? `Manage your gift: ${portalUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  try {
    await sendMail({
      to: donation.donorEmail,
      subject: 'Thank you for your gift to Our Hope Foundation',
      text,
      html: `<p><strong>${settings.legalName}</strong> ${abn}</p><p>${aud(donation.amountCents)} · ${donation.frequency === 'monthly' ? 'Monthly' : 'One-off'}</p><p>${when}</p><p>Reference ${donation.id}</p><p>${tax}</p>${portalUrl ? `<p><a href="${portalUrl}">Manage your gift</a></p>` : ''}`,
    });
    donation.receiptSentAt = new Date();
    await donation.save();
  } catch (err) {
    logger.warn({ err, donationId }, 'Donation receipt email failed');
  }
}

export async function createCheckout(
  input: { frequency: 'one_off' | 'monthly'; amountCents: number; dedication?: string; turnstileToken?: string },
  ip?: string,
) {
  await verifyTurnstile(input.turnstileToken, ip);
  const donation = await Donation.create({
    amountCents: input.amountCents,
    currency: 'aud',
    frequency: input.frequency,
    status: 'pending',
    fund: 'general',
    dedication: input.dedication ?? '',
  });

  if (!hasStripe || !stripe) {
    const sessionId = `mock_${nanoid(16)}`;
    donation.stripeCheckoutSessionId = sessionId;
    await donation.save();
    return {
      url: `${env.WEB_ORIGIN}/donate/thank-you?session_id=${sessionId}`,
      sessionId,
    };
  }

  const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
    currency: 'aud',
    unit_amount: input.amountCents,
    ...(env.STRIPE_PRODUCT_ID
      ? { product: env.STRIPE_PRODUCT_ID }
      : { product_data: { name: 'Our Hope Foundation donation' } }),
    ...(input.frequency === 'monthly' ? { recurring: { interval: 'month' } } : {}),
  };

  const session = await stripe.checkout.sessions.create({
    mode: input.frequency === 'monthly' ? 'subscription' : 'payment',
    client_reference_id: String(donation._id),
    success_url: `${env.WEB_ORIGIN}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.WEB_ORIGIN}/donate`,
    metadata: {
      donationId: String(donation._id),
      frequency: input.frequency,
      fund: 'general',
    },
    line_items: [{ quantity: 1, price_data: priceData }],
    ...(input.frequency === 'one_off'
      ? { payment_intent_data: { statement_descriptor: 'OUR HOPE FDN' } }
      : {
          subscription_data: {
            description: 'Monthly donation to Our Hope Foundation',
            metadata: { donationId: String(donation._id), fund: 'general' },
          },
        }),
  });

  if (!session.url) throw ApiError.internal('Stripe did not return a checkout URL');
  donation.stripeCheckoutSessionId = session.id;
  await donation.save();
  return { url: session.url, sessionId: session.id };
}

export async function getCheckoutSession(sessionId: string) {
  const donation = await Donation.findOne({ stripeCheckoutSessionId: sessionId });
  if (!donation) throw ApiError.notFound('Session not found');
  if (sessionId.startsWith('mock_') && donation.status === 'pending') {
    donation.status = 'succeeded';
    await donation.save();
    await sendReceipt(String(donation._id));
  }
  return {
    status: donation.status,
    amountCents: donation.amountCents,
    frequency: donation.frequency,
  };
}

async function onCheckoutCompleted(session: Loose) {
  const donationId = session.client_reference_id || session.metadata?.donationId;
  const donation = donationId
    ? await Donation.findById(donationId)
    : await Donation.findOne({ stripeCheckoutSessionId: session.id });
  if (!donation) return;
  donation.stripeCheckoutSessionId = session.id || donation.stripeCheckoutSessionId;
  donation.stripeCustomerId = idOf(session.customer) || donation.stripeCustomerId;
  donation.donorEmail = session.customer_details?.email || donation.donorEmail;
  donation.donorName = session.customer_details?.name || donation.donorName;
  if (session.mode === 'payment') {
    donation.stripePaymentIntentId = idOf(session.payment_intent) || donation.stripePaymentIntentId;
    if (session.payment_status === 'paid') donation.status = 'succeeded';
  }
  if (session.mode === 'subscription') {
    donation.stripeSubscriptionId = idOf(session.subscription) || donation.stripeSubscriptionId;
  }
  await donation.save();
  if (donation.status === 'succeeded') await sendReceipt(String(donation._id));
}

async function onInvoicePaid(invoice: Loose) {
  const invoiceId = String(invoice.id || '');
  if (!invoiceId || (await Donation.findOne({ stripeInvoiceId: invoiceId }))) return;
  const subscriptionId = idOf(invoice.subscription) || idOf(invoice.parent?.subscription_details?.subscription);
  const customerId = idOf(invoice.customer);
  const email = String(invoice.customer_email || '');
  const amount = Number(invoice.amount_paid || 0);

  const pending = subscriptionId
    ? await Donation.findOne({ stripeSubscriptionId: subscriptionId, status: 'pending' })
    : null;
  if (pending) {
    pending.stripeInvoiceId = invoiceId;
    pending.stripePaymentIntentId = idOf(invoice.payment_intent) || pending.stripePaymentIntentId;
    pending.stripeCustomerId = customerId || pending.stripeCustomerId;
    pending.donorEmail = pending.donorEmail || email;
    if (amount > 0) pending.amountCents = amount;
    pending.status = 'succeeded';
    await pending.save();
    await sendReceipt(String(pending._id));
    return;
  }

  const previous = subscriptionId
    ? await Donation.findOne({ stripeSubscriptionId: subscriptionId }).sort({ createdAt: -1 })
    : null;
  const created = await Donation.create({
    amountCents: amount || previous?.amountCents || 0,
    currency: 'aud',
    frequency: 'monthly',
    status: 'succeeded',
    fund: 'general',
    donorName: previous?.donorName || '',
    donorEmail: email || previous?.donorEmail || '',
    dedication: previous?.dedication || '',
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    stripeInvoiceId: invoiceId,
    stripePaymentIntentId: idOf(invoice.payment_intent),
  });
  await sendReceipt(String(created._id));
}

async function onInvoiceFailed(invoice: Loose) {
  const subscriptionId = idOf(invoice.subscription) || idOf(invoice.parent?.subscription_details?.subscription);
  if (!subscriptionId) return;
  await Donation.updateMany(
    { stripeSubscriptionId: subscriptionId, status: 'pending' },
    { status: 'failed', stripeInvoiceId: invoice.id },
  );
}

async function onSubscriptionUpdated(subscription: Loose) {
  if (!subscription.id) return;
  const latest = await Donation.findOne({ stripeSubscriptionId: subscription.id }).sort({ createdAt: -1 });
  if (!latest) return;
  latest.subscriptionStatus = String(subscription.status || '');
  await latest.save();
}

async function onSubscriptionDeleted(subscription: Loose) {
  if (!subscription.id) return;
  await Donation.updateMany({ stripeSubscriptionId: subscription.id }, { subscriptionStatus: 'cancelled' });
}

async function onChargeRefunded(charge: Loose) {
  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return;
  await Donation.updateMany({ stripePaymentIntentId: paymentIntentId }, { status: 'refunded' });
}

async function dispatch(event: { type: string; data: { object: Loose } }) {
  switch (event.type) {
    case 'checkout.session.completed':
      await onCheckoutCompleted(event.data.object);
      return;
    case 'invoice.paid':
      await onInvoicePaid(event.data.object);
      return;
    case 'invoice.payment_failed':
      await onInvoiceFailed(event.data.object);
      return;
    case 'customer.subscription.updated':
      await onSubscriptionUpdated(event.data.object);
      return;
    case 'customer.subscription.deleted':
      await onSubscriptionDeleted(event.data.object);
      return;
    case 'charge.refunded':
      await onChargeRefunded(event.data.object);
      return;
    default:
      return;
  }
}

export async function handleStripeEvent(raw: Buffer, signature?: string) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) throw ApiError.badRequest('Stripe is not configured');
  if (!signature) throw ApiError.badRequest('Missing Stripe signature');
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw ApiError.badRequest('Invalid Stripe signature');
  }
  const existing = await StripeEvent.findOne({ eventId: event.id });
  if (existing?.status === 'processed') return { duplicate: true };
  try {
    await dispatch(event as unknown as { type: string; data: { object: Loose } });
    await StripeEvent.updateOne(
      { eventId: event.id },
      { type: event.type, status: 'processed', processedAt: new Date() },
      { upsert: true },
    );
  } catch (err) {
    await StripeEvent.updateOne(
      { eventId: event.id },
      { type: event.type, status: 'failed', processedAt: new Date() },
      { upsert: true },
    );
    throw err;
  }
  return { duplicate: false };
}

function donationFilter(query: Record<string, unknown>) {
  const { page, limit, skip, filter } = listQuery(query, ['donorName', 'donorEmail', 'dedication']);
  const status = queryString(query.status);
  const frequency = queryString(query.frequency);
  if (status) filter.status = status;
  if (frequency) filter.frequency = frequency;
  return { page, limit, skip, filter };
}

export async function listDonations(query: Record<string, unknown>) {
  const { page, limit, skip, filter } = donationFilter(query);
  const [rows, total] = await Promise.all([
    Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Donation.countDocuments(filter),
  ]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function getDonation(id: string) {
  const doc = await Donation.findById(id);
  if (!doc) throw ApiError.notFound('Donation not found');
  return present(doc);
}

export async function donationsCsv(query: Record<string, unknown>) {
  const { filter } = donationFilter(query);
  const rows = await Donation.find(filter).sort({ createdAt: -1 }).lean();
  return toCsv([
    ['date', 'donor', 'email', 'amountCents', 'frequency', 'status', 'dedication', 'paymentIntent', 'invoice', 'receiptSentAt'],
    ...rows.map((row) => [
      sydneyStamp(row.createdAt),
      row.donorName,
      row.donorEmail,
      row.amountCents,
      row.frequency,
      row.status,
      row.dedication,
      row.stripePaymentIntentId,
      row.stripeInvoiceId,
      sydneyStamp(row.receiptSentAt),
    ]),
  ]);
}
