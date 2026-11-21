import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { getMenu, listMenus, updateMenu } from './service.js';

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getMenu(param(req.params.location)));
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await listMenus());
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const menu = await updateMenu(param(req.params.location), req.body.items);
  await writeAudit(req, 'menu.update', 'menu', param(req.params.location), param(req.params.location));
  sendSuccess(res, menu);
});
