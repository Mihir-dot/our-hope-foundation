import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

export async function verifyTurnstile(token?: string, ip?: string) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) throw ApiError.badRequest('Captcha required');

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (ip) body.set('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { success?: boolean };
  if (!data.success) throw ApiError.badRequest('Captcha failed');
  return true;
}
