import mongoose, { Schema } from 'mongoose';
import { contentStatuses } from '@ohf/shared';

const seoSchema = new Schema(
  { title: { type: String, default: '' }, description: { type: String, default: '' } },
  { _id: false },
);

const storySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: '' },
    body: { type: String, default: '' },
    coverId: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    authorName: { type: String, default: '' },
    publishedAt: { type: Date },
    status: { type: String, enum: [...contentStatuses], default: 'draft' },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true, collection: 'stories' },
);

storySchema.index({ status: 1, publishedAt: -1 });

export const Story = mongoose.models.Story ?? mongoose.model('Story', storySchema);
