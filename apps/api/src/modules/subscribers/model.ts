import mongoose, { Schema } from 'mongoose';
import { subscriberStatuses } from '@ohf/shared';

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: [...subscriberStatuses], default: 'pending' },
    confirmTokenHash: { type: String, select: false },
    confirmedAt: { type: Date },
  },
  { timestamps: true, collection: 'subscribers' },
);

export const Subscriber =
  mongoose.models.Subscriber ?? mongoose.model('Subscriber', subscriberSchema);
