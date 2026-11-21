import mongoose, { Schema } from 'mongoose';

const speakerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    organisation: { type: String, default: '' },
    bio: { type: String, default: '' },
    photoId: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
  },
  { timestamps: true, collection: 'speakers' },
);

export const Speaker = mongoose.models.Speaker ?? mongoose.model('Speaker', speakerSchema);
