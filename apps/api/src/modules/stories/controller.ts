import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { archiveStory, createStory, getPublishedStory, getStory, listStories, updateStory } from './service.js';

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const result = await listStories(req.query as Record<string, unknown>, 'public');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getPublishedStory(param(req.params.slug)));
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await listStories(req.query as Record<string, unknown>, 'admin');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getStory(param(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await createStory(req.body);
  await writeAudit(req, 'story.create', 'story', String(item.id), String(item.slug ?? ''));
  sendSuccess(res, item, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await updateStory(param(req.params.id), req.body);
  await writeAudit(req, 'story.update', 'story', param(req.params.id));
  sendSuccess(res, item);
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  await archiveStory(param(req.params.id));
  await writeAudit(req, 'story.archive', 'story', param(req.params.id));
  sendSuccess(res, { ok: true });
});
