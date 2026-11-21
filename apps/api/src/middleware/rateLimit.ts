import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts' } },
});

export const actionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
