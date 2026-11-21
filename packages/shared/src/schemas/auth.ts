import { z } from 'zod';
import { emailSchema, nameSchema } from './common.js';
import { roles } from '../vocab.js';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(10).max(128),
});

export const createUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: z.string().min(10).max(128),
  role: z.enum(roles),
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  role: z.enum(roles).optional(),
  disabled: z.boolean().optional(),
  password: z.string().min(10).max(128).optional(),
});
