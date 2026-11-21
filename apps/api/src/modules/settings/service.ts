import type { z } from 'zod';
import { brand, settingsUpdateSchema } from '@ohf/shared';
import { present } from '../../lib/present.js';
import { Settings } from './model.js';

type SettingsPatch = z.infer<typeof settingsUpdateSchema>;

const PUBLIC_FIELDS = [
  'legalName',
  'tagline',
  'missionLine',
  'abn',
  'acncNumber',
  'charityStatus',
  'dgrEndorsed',
  'ndisProvider',
  'fundraisingLicences',
  'email',
  'phone',
  'address',
  'acknowledgement',
  'social',
  'donationPresetsCents',
  'impactStats',
  'seoTitle',
  'seoDescription',
] as const;

export const settingsDefaults = {
  key: 'site',
  legalName: brand.legalName,
  tagline: brand.tagline,
  missionLine: brand.missionLine,
  abn: '',
  acncNumber: '',
  charityStatus: '',
  dgrEndorsed: false,
  ndisProvider: false,
  fundraisingLicences: {},
  email: brand.email,
  phone: brand.phone,
  address: '',
  acknowledgement: brand.acknowledgement,
  social: { facebook: '', instagram: '', linkedin: '', youtube: '' },
  donationPresetsCents: [...brand.donationPresetsCents],
  impactStats: [
    { label: 'Family learning sessions', value: '120+', note: 'Workshops and webinars' },
    { label: 'Practical resources', value: '40+', note: 'Guides families can use this week' },
    { label: 'Community events', value: '24', note: 'Online and in person' },
  ],
  seoTitle: 'Our Hope Foundation',
  seoDescription: brand.tagline,
};

export async function getSettings() {
  const existing = await Settings.findOne({ key: 'site' });
  if (existing) return existing;
  return Settings.create(settingsDefaults);
}

export function toPublicSettings(doc: unknown) {
  const source = present<Record<string, unknown>>(doc);
  const out: Record<string, unknown> = {};
  for (const key of PUBLIC_FIELDS) out[key] = source[key];
  return out;
}

export async function updateSettings(patch: SettingsPatch) {
  const doc = await Settings.findOneAndUpdate(
    { key: 'site' },
    { $set: patch, $setOnInsert: { key: 'site' } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return doc;
}
