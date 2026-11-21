import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
loadEnv({ path: path.join(root, '.env') });
loadEnv({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),
  API_PUBLIC_URL: z.string().default('http://localhost:4000'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/ohf'),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  SEED_OWNER_EMAIL: z.string().email().default('owner@ourhopefoundation.org.au'),
  SEED_OWNER_PASSWORD: z.string().min(8).default('ChangeMeOwner123!'),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  STRIPE_PRODUCT_ID: z.string().optional().default(''),
  AWS_REGION: z.string().default('ap-southeast-2'),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  S3_BUCKET: z.string().optional().default(''),
  S3_PUBLIC_BASE_URL: z.string().optional().default(''),
  SES_FROM_EMAIL: z.string().default('hello@ourhopefoundation.org.au'),
  TURNSTILE_SECRET_KEY: z.string().optional().default(''),
  REVALIDATE_SECRET: z.string().default('dev-revalidate'),
  LOG_LEVEL: z.string().default('info'),
  LOCAL_MEDIA_DIR: z.string().default('./uploads'),
  LOCAL_MEDIA_PUBLIC_URL: z.string().default('http://localhost:4000/uploads'),
});

export const env = envSchema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';
export const hasStripe = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.startsWith('sk_'));
export const hasS3 = Boolean(env.AWS_ACCESS_KEY_ID && env.S3_BUCKET);
