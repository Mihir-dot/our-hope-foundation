export const topics = [
  'autism',
  'communication',
  'behaviour',
  'ndis',
  'daily-living',
  'school',
  'wellbeing',
  'community',
] as const;

export const audiences = ['parents', 'carers', 'siblings', 'guardians'] as const;

export const programFormats = ['webinar', 'workshop', 'self-paced'] as const;

export const eventFormats = ['online', 'in-person'] as const;

export const contentStatuses = ['draft', 'published', 'archived'] as const;

export const resourceTypes = [
  'pdf',
  'tip-sheet',
  'article',
  'webinar-recording',
] as const;

export const resourceLanguages = ['en', 'ar', 'vi', 'zh', 'hi', 'pa'] as const;

export const auStates = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'] as const;

export const roles = ['owner', 'admin', 'editor', 'finance'] as const;

export const enquiryTypes = [
  'general',
  'program',
  'ndis',
  'volunteer',
  'partnership',
  'media',
] as const;

export const enquiryStatuses = ['new', 'in_progress', 'closed'] as const;

export const donationFrequencies = ['one_off', 'monthly'] as const;

export const donationStatuses = [
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'cancelled',
] as const;

export const registrationStatuses = [
  'registered',
  'waitlist',
  'cancelled',
] as const;

export const subscriberStatuses = [
  'pending',
  'confirmed',
  'unsubscribed',
] as const;

export const blockTypes = [
  'hero',
  'richText',
  'journey',
  'cardGrid',
  'moduleGrid',
  'statRow',
  'eventList',
  'programList',
  'resourceList',
  'storyList',
  'ctaBand',
  'faq',
  'logoCloud',
  'splitFeature',
  'trustRow',
] as const;

export type Topic = (typeof topics)[number];
export type Audience = (typeof audiences)[number];
export type Role = (typeof roles)[number];
export type ContentStatus = (typeof contentStatuses)[number];
