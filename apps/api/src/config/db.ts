import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../lib/logger.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  logger.info({ uri: env.MONGODB_URI.replace(/\/\/.*@/, '//***@') }, 'MongoDB connected');
}
