import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { archivePathway, createPathway, getPathway, getPublishedPathway, listPathways, updatePathway } from './service.js';

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPathways(req.query as Record<string, unknown>, 'public');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getPublishedPathway(param(req.params.slug)));
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPathways(req.query as Record<string, unknown>, 'admin');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getPathway(param(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await createPathway(req.body);
  await writeAudit(req, 'pathway.create', 'pathway', String(item.id));
  sendSuccess(res, item, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await updatePathway(param(req.params.id), req.body);
  await writeAudit(req, 'pathway.update', 'pathway', param(req.params.id));
  sendSuccess(res, item);
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  await archivePathway(param(req.params.id));
  await writeAudit(req, 'pathway.archive', 'pathway', param(req.params.id));
  sendSuccess(res, { ok: true });
});
