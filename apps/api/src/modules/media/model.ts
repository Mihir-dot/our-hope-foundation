import mongoose, { Schema } from 'mongoose';

const mediaSchema = new Schema(
  {
    key: { type: String, required: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    mime: { type: String, required: true },
    bytes: { type: Number, required: true },
    alt: { type: String, default: '' },
    width: { type: Number },
    height: { type: Number },
    originalName: { type: String, default: '' },
    url: { type: String, default: '' },
    storage: { type: String, enum: ['s3', 'local'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'media' },
);

mediaSchema.index({ createdAt: -1 });

export const Media = mongoose.models.Media ?? mongoose.model('Media', mediaSchema);
