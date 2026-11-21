import mongoose, { Schema } from 'mongoose';
import { blockTypes, contentStatuses } from '@ohf/shared';

const seoSchema = new Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false },
);

const blockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: [...blockTypes], required: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const pageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: [...contentStatuses], default: 'draft' },
    seo: { type: seoSchema, default: () => ({}) },
    blocks: { type: [blockSchema], default: [] },
  },
  { timestamps: true, collection: 'pages' },
);

export const Page = mongoose.models.Page ?? mongoose.model('Page', pageSchema);
