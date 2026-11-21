import mongoose, { Schema } from 'mongoose';
import { donationFrequencies, donationStatuses } from '@ohf/shared';

const donationSchema = new Schema(
  {
    amountCents: { type: Number, required: true },
    currency: { type: String, default: 'aud' },
    frequency: { type: String, enum: [...donationFrequencies], required: true },
    status: { type: String, enum: [...donationStatuses], default: 'pending' },
    fund: { type: String, default: 'general' },
    donorName: { type: String, default: '' },
    donorEmail: { type: String, default: '', lowercase: true, trim: true },
    dedication: { type: String, default: '' },
    stripeCheckoutSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    stripeInvoiceId: { type: String },
    subscriptionStatus: { type: String, default: '' },
    receiptSentAt: { type: Date },
  },
  { timestamps: true, collection: 'donations' },
);

donationSchema.index({ stripeCheckoutSessionId: 1 }, { unique: true, sparse: true });
donationSchema.index({ stripeInvoiceId: 1 }, { unique: true, sparse: true });
donationSchema.index({ status: 1, createdAt: -1 });

export const Donation = mongoose.models.Donation ?? mongoose.model('Donation', donationSchema);
