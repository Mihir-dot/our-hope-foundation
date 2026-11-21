import mongoose, { Schema } from 'mongoose';
import {
  audiences,
  contentStatuses,
  resourceLanguages,
  resourceTypes,
  topics,
} from '@ohf/shared';

const seoSchema = new Schema(
  { title: { type: String, default: '' }, description: { type: String, default: '' } },
  { _id: false },
);

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: '' },
    type: { type: String, enum: [...resourceTypes], required: true },
    body: { type: String, default: '' },
    fileId: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    externalUrl: { type: String, default: '' },
    transcript: { type: String, default: '' },
    topics: { type: [String], enum: [...topics], default: [] },
    audiences: { type: [String], enum: [...audiences], default: [] },
    language: { type: String, enum: [...resourceLanguages], default: 'en' },
    minutes: { type: Number },
    pageCount: { type: Number },
    publishedAt: { type: Date },
    featured: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },
    status: { type: String, enum: [...contentStatuses], default: 'draft' },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true, collection: 'resources' },
);

resourceSchema.index({ status: 1, publishedAt: -1 });

export const Resource = mongoose.models.Resource ?? mongoose.model('Resource', resourceSchema);
