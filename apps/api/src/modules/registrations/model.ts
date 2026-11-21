import mongoose, { Schema } from 'mongoose';
import { registrationStatuses } from '@ohf/shared';

const registrationSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    accessibilityNeeds: { type: String, default: '' },
    marketingOptIn: { type: Boolean, default: false },
    status: { type: String, enum: [...registrationStatuses], default: 'registered' },
  },
  { timestamps: true, collection: 'registrations' },
);

registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

export const Registration =
  mongoose.models.Registration ?? mongoose.model('Registration', registrationSchema);
