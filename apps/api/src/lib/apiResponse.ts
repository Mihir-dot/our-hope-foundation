import type { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: { page?: number; limit?: number; total?: number; pages?: number },
  status = 200,
) {
  return res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}
