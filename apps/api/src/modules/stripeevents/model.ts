import mongoose, { Schema } from 'mongoose';

const stripeEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['processed', 'failed'], required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { collection: 'stripeevents' },
);

export const StripeEvent =
  mongoose.models.StripeEvent ?? mongoose.model('StripeEvent', stripeEventSchema);
