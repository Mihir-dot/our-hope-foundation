import { env } from '../config/env.js';
import { logger } from './logger.js';

export async function revalidate(tags: string[]) {
  try {
    await fetch(new URL('/api/revalidate', env.WEB_ORIGIN), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': env.REVALIDATE_SECRET,
      },
      body: JSON.stringify({ tags }),
    });
  } catch (err) {
    logger.warn({ err, tags }, 'Revalidate request failed');
  }
}
