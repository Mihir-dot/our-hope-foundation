import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { createCheckout, donationsCsv, getCheckoutSession, getDonation, handleStripeEvent, listDonations } from './service.js';

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const result = await createCheckout(req.body, req.ip);
  sendSuccess(res, result, undefined, 201);
});

export const session = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getCheckoutSession(param(req.params.sessionId)));
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  const result = await handleStripeEvent(req.body as Buffer, typeof signature === 'string' ? signature : undefined);
  sendSuccess(res, { received: true, ...result });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listDonations(req.query as Record<string, unknown>);
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getDonation(param(req.params.id)));
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const csv = await donationsCsv(req.query as Record<string, unknown>);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
  res.send(csv);
});
