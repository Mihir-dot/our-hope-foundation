import { z } from 'zod';
import {
  audiences,
  auStates,
  contentStatuses,
  donationFrequencies,
  enquiryTypes,
  programFormats,
  resourceLanguages,
  resourceTypes,
  topics,
} from '../vocab.js';

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().trim().max(200).optional(),
});

export const seoSchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(320).optional(),
});

export const statusSchema = z.enum(contentStatuses);
export const topicSchema = z.enum(topics);
export const audienceSchema = z.enum(audiences);
export const programFormatSchema = z.enum(programFormats);
export const resourceTypeSchema = z.enum(resourceTypes);
export const resourceLanguageSchema = z.enum(resourceLanguages);
export const stateSchema = z.enum(auStates);
export const enquiryTypeSchema = z.enum(enquiryTypes);
export const donationFrequencySchema = z.enum(donationFrequencies);

export const emailSchema = z.string().trim().email().max(200);
export const nameSchema = z.string().trim().min(1).max(120);
export const phoneSchema = z.string().trim().max(40).optional().or(z.literal(''));
