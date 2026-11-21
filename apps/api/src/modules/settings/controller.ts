import type { Request, Response } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { sendSuccess } from '../../lib/apiResponse.js';
import { present } from '../../lib/present.js';
import { writeAudit } from '../../lib/audit.js';
import { getSettings, toPublicSettings, updateSettings } from './service.js';

export const getPublic = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, toPublicSettings(await getSettings()));
});

export const getAdmin = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, present(await getSettings()));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const doc = await updateSettings(req.body);
  await writeAudit(req, 'settings.update', 'settings', String(doc._id), 'site');
  sendSuccess(res, present(doc));
});
