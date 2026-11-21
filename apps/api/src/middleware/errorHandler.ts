import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../lib/ApiError.js';
import { logger } from '../lib/logger.js';

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound('Route not found'));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.flatten(),
      },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  const mongo = err as { code?: number; keyValue?: unknown };
  if (mongo?.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'Duplicate record', details: mongo.keyValue },
    });
  }

  logger.error({ err, requestId: req.requestId }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL', message: 'Something went wrong' },
  });
}
