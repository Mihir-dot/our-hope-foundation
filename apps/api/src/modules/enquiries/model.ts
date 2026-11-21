import mongoose, { Schema } from 'mongoose';
import { auStates, enquiryStatuses, enquiryTypes } from '@ohf/shared';

const enquirySchema = new Schema(
  {
    type: { type: String, enum: [...enquiryTypes], default: 'general' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    message: { type: String, required: true },
    state: { type: String, enum: [...auStates] },
    interests: { type: [String], default: [] },
    availability: { type: String, default: '' },
    organisation: { type: String, default: '' },
    wwcc: { type: String, enum: ['yes', 'in-progress', 'no'] },
    status: { type: String, enum: [...enquiryStatuses], default: 'new' },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, collection: 'enquiries' },
);

enquirySchema.index({ status: 1, createdAt: -1 });

export const Enquiry = mongoose.models.Enquiry ?? mongoose.model('Enquiry', enquirySchema);
