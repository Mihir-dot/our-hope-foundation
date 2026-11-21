import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { createPage, deletePage, getPage, getPublishedPage, listPages, publishPage, updatePage } from './service.js';
import { present } from '../../lib/present.js';

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPages(req.query as Record<string, unknown>, 'public');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getPublishedPage(param(req.params.slug)));
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPages(req.query as Record<string, unknown>, 'admin');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, present(await getPage(param(req.params.id))));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const page = await createPage(req.body);
  await writeAudit(req, 'page.create', 'page', String(page.id), String(page.slug ?? ''));
  sendSuccess(res, page, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const page = await updatePage(param(req.params.id), req.body);
  await writeAudit(req, 'page.update', 'page', param(req.params.id));
  sendSuccess(res, page);
});

export const publish = asyncHandler(async (req: Request, res: Response) => {
  const page = await publishPage(param(req.params.id));
  await writeAudit(req, 'page.publish', 'page', param(req.params.id));
  sendSuccess(res, page);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deletePage(param(req.params.id));
  await writeAudit(req, 'page.delete', 'page', param(req.params.id));
  sendSuccess(res, { ok: true });
});
