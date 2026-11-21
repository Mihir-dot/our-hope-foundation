import mongoose, { Schema } from 'mongoose';
import { auStates, contentStatuses } from '@ohf/shared';

const seoSchema = new Schema(
  { title: { type: String, default: '' }, description: { type: String, default: '' } },
  { _id: false },
);

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: '' },
    body: { type: String, default: '' },
    format: { type: String, enum: ['online', 'in-person'], default: 'online' },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    timezone: { type: String, default: 'Australia/Sydney' },
    venueName: { type: String, default: '' },
    address: { type: String, default: '' },
    state: { type: String, enum: [...auStates] },
    onlineUrl: { type: String, default: '' },
    capacity: { type: Number, default: 100 },
    coverId: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    speakerIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Speaker' }], default: [] },
    status: { type: String, enum: [...contentStatuses], default: 'draft' },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true, collection: 'events' },
);

eventSchema.index({ status: 1, startAt: 1 });

export const Event = mongoose.models.Event ?? mongoose.model('Event', eventSchema);
