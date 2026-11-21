import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { archiveResource, createResource, downloadResource, getPublishedResource, getResource, listResources, streamResourceFile, updateResource } from './service.js';

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const result = await listResources(req.query as Record<string, unknown>, 'public');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getPublishedResource(param(req.params.slug)));
});

export const download = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await downloadResource(param(req.params.slug)));
});

export const file = asyncHandler(async (req: Request, res: Response) => {
  await streamResourceFile(param(req.params.slug), res);
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await listResources(req.query as Record<string, unknown>, 'admin');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getResource(param(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await createResource(req.body);
  await writeAudit(req, 'resource.create', 'resource', String(item.id), String(item.slug ?? ''));
  sendSuccess(res, item, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await updateResource(param(req.params.id), req.body);
  await writeAudit(req, 'resource.update', 'resource', param(req.params.id));
  sendSuccess(res, item);
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  await archiveResource(param(req.params.id));
  await writeAudit(req, 'resource.archive', 'resource', param(req.params.id));
  sendSuccess(res, { ok: true });
});
