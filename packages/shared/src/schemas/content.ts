import { z } from 'zod';
import {
  audienceSchema,
  emailSchema,
  nameSchema,
  objectIdSchema,
  phoneSchema,
  programFormatSchema,
  resourceLanguageSchema,
  resourceTypeSchema,
  seoSchema,
  slugSchema,
  stateSchema,
  statusSchema,
  topicSchema,
} from './common.js';
import { blockTypes, donationFrequencies, enquiryTypes } from '../vocab.js';

export const blockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(blockTypes),
  data: z.record(z.unknown()).default({}),
});

export const pageUpsertSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema,
  status: statusSchema.default('draft'),
  seo: seoSchema.optional(),
  blocks: z.array(blockSchema).default([]),
});

export const programUpsertSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema,
  summary: z.string().max(500).default(''),
  body: z.string().default(''),
  coverId: objectIdSchema.optional().nullable(),
  audiences: z.array(audienceSchema).default([]),
  topics: z.array(topicSchema).default([]),
  format: programFormatSchema.default('webinar'),
  durationText: z.string().max(80).default(''),
  status: statusSchema.default('draft'),
  featured: z.boolean().default(false),
  seo: seoSchema.optional(),
});

export const pathwayUpsertSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema,
  summary: z.string().max(500).default(''),
  resourceIds: z.array(objectIdSchema).default([]),
  status: statusSchema.default('draft'),
});

export const speakerUpsertSchema = z.object({
  name: nameSchema,
  role: z.string().max(120).default(''),
  organisation: z.string().max(160).default(''),
  bio: z.string().max(2000).default(''),
  photoId: objectIdSchema.optional().nullable(),
});

export const eventUpsertSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema,
  summary: z.string().max(500).default(''),
  body: z.string().default(''),
  format: z.enum(['online', 'in-person']).default('online'),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  timezone: z.string().default('Australia/Sydney'),
  venueName: z.string().max(160).default(''),
  address: z.string().max(240).default(''),
  state: stateSchema.optional(),
  onlineUrl: z.string().url().optional().or(z.literal('')),
  capacity: z.number().int().min(1).max(5000).default(100),
  coverId: objectIdSchema.optional().nullable(),
  speakerIds: z.array(objectIdSchema).default([]),
  status: statusSchema.default('draft'),
  seo: seoSchema.optional(),
});

export const eventRegisterSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  accessibilityNeeds: z.string().max(500).optional().default(''),
  marketingOptIn: z.boolean().default(false),
  turnstileToken: z.string().optional(),
});

export const resourceUpsertSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema,
  summary: z.string().max(500).default(''),
  type: resourceTypeSchema,
  body: z.string().default(''),
  fileId: objectIdSchema.optional().nullable(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  transcript: z.string().default(''),
  topics: z.array(topicSchema).default([]),
  audiences: z.array(audienceSchema).default([]),
  language: resourceLanguageSchema.default('en'),
  minutes: z.number().int().min(0).optional(),
  pageCount: z.number().int().min(0).optional(),
  publishedAt: z.coerce.date().optional(),
  featured: z.boolean().default(false),
  status: statusSchema.default('draft'),
  seo: seoSchema.optional(),
});

export const storyUpsertSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema,
  excerpt: z.string().max(400).default(''),
  body: z.string().default(''),
  coverId: objectIdSchema.optional().nullable(),
  authorName: z.string().max(120).default(''),
  publishedAt: z.coerce.date().optional(),
  status: statusSchema.default('draft'),
  seo: seoSchema.optional(),
});

export const enquiryCreateSchema = z.object({
  type: z.enum(enquiryTypes).default('general'),
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().trim().min(10).max(4000),
  state: stateSchema.optional(),
  interests: z.array(z.string()).default([]),
  availability: z.string().max(240).optional(),
  organisation: z.string().max(160).optional(),
  wwcc: z.enum(['yes', 'in-progress', 'no']).optional(),
  turnstileToken: z.string().optional(),
});

export const subscriberCreateSchema = z.object({
  email: emailSchema,
  turnstileToken: z.string().optional(),
});

export const donationCheckoutSchema = z.object({
  frequency: z.enum(donationFrequencies),
  amountCents: z.number().int().min(200).max(10_000_000),
  dedication: z.string().max(240).optional().default(''),
  turnstileToken: z.string().optional(),
});

export const menuItemSchema: z.ZodType<{
  label: string;
  href: string;
  description?: string;
  children?: { label: string; href: string; description?: string; children?: unknown[] }[];
}> = z.lazy(() =>
  z.object({
    label: z.string().min(1).max(80),
    href: z.string().min(1).max(300),
    description: z.string().max(240).optional(),
    children: z.array(menuItemSchema).optional(),
  }),
);

export const menuUpdateSchema = z.object({
  items: z.array(menuItemSchema),
});

export const settingsUpdateSchema = z.object({
  legalName: z.string().min(1).max(200).optional(),
  tagline: z.string().max(240).optional(),
  missionLine: z.string().max(240).optional(),
  abn: z.string().max(40).optional(),
  acncNumber: z.string().max(40).optional(),
  charityStatus: z.string().max(120).optional(),
  dgrEndorsed: z.boolean().optional(),
  ndisProvider: z.boolean().optional(),
  fundraisingLicences: z.record(z.string()).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  address: z.string().max(300).optional(),
  acknowledgement: z.string().max(1000).optional(),
  social: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
  donationPresetsCents: z.array(z.number().int().min(200)).optional(),
  impactStats: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  seoTitle: z.string().max(120).optional(),
  seoDescription: z.string().max(320).optional(),
});
