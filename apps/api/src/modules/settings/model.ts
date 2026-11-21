import mongoose, { Schema } from 'mongoose';

const impactStatSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    note: { type: String, default: '' },
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'site' },
    legalName: { type: String, default: 'Our Hope Foundation' },
    tagline: { type: String, default: '' },
    missionLine: { type: String, default: '' },
    abn: { type: String, default: '' },
    acncNumber: { type: String, default: '' },
    charityStatus: { type: String, default: '' },
    dgrEndorsed: { type: Boolean, default: false },
    ndisProvider: { type: Boolean, default: false },
    fundraisingLicences: { type: Schema.Types.Mixed, default: {} },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    acknowledgement: { type: String, default: '' },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    donationPresetsCents: { type: [Number], default: [2500, 5000, 10000, 25000] },
    impactStats: { type: [impactStatSchema], default: [] },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true, collection: 'settings' },
);

export const Settings = mongoose.models.Settings ?? mongoose.model('Settings', settingsSchema);
