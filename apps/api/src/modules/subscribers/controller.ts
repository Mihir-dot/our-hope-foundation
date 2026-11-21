import { z } from 'zod';
import type { Request, Response } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { confirmSubscription, listSubscribers, requestSubscription, subscribersCsv, unsubscribe } from './service.js';

const confirmSchema = z.object({ token: z.string().min(20) });
const unsubscribeSchema = z.object({
  token: z.string().min(20).optional(),
  email: z.string().email().optional(),
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestSubscription(req.body.email, {
    turnstileToken: req.body.turnstileToken,
    ip: req.ip,
  });
  sendSuccess(res, result, undefined, 201);
});

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await confirmSubscription(confirmSchema.parse(req.body).token));
});

export const unsubscribeHandler = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await unsubscribe(unsubscribeSchema.parse(req.body)));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listSubscribers(req.query as Record<string, unknown>);
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const csv = await subscribersCsv(req.query as Record<string, unknown>);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
  res.send(csv);
});
