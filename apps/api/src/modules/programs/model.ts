import mongoose, { Schema } from 'mongoose';
import { audiences, contentStatuses, programFormats, topics } from '@ohf/shared';

const seoSchema = new Schema(
  { title: { type: String, default: '' }, description: { type: String, default: '' } },
  { _id: false },
);

const programSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: '' },
    body: { type: String, default: '' },
    coverId: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    audiences: { type: [String], enum: [...audiences], default: [] },
    topics: { type: [String], enum: [...topics], default: [] },
    format: { type: String, enum: [...programFormats], default: 'webinar' },
    durationText: { type: String, default: '' },
    status: { type: String, enum: [...contentStatuses], default: 'draft' },
    featured: { type: Boolean, default: false },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true, collection: 'programs' },
);

programSchema.index({ status: 1, featured: -1 });

export const Program = mongoose.models.Program ?? mongoose.model('Program', programSchema);
