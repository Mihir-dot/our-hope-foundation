import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { createEnquiry, getEnquiry, listEnquiries, updateEnquiry } from './service.js';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await createEnquiry(req.body, req.ip);
  sendSuccess(res, item, undefined, 201);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listEnquiries(req.query as Record<string, unknown>);
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getEnquiry(param(req.params.id)));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await updateEnquiry(param(req.params.id), req.body);
  await writeAudit(req, 'enquiry.update', 'enquiry', param(req.params.id), req.body.status);
  sendSuccess(res, item);
});
