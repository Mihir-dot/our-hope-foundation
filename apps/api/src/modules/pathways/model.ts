import mongoose, { Schema } from 'mongoose';
import { contentStatuses } from '@ohf/shared';

const pathwaySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: '' },
    resourceIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Resource' }], default: [] },
    status: { type: String, enum: [...contentStatuses], default: 'draft' },
  },
  { timestamps: true, collection: 'pathways' },
);

export const Pathway = mongoose.models.Pathway ?? mongoose.model('Pathway', pathwaySchema);
