import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { createSpeaker, deleteSpeaker, getSpeaker, listSpeakers, updateSpeaker } from './service.js';

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const result = await listSpeakers(req.query as Record<string, unknown>);
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const listAdmin = listPublic;

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getSpeaker(param(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await createSpeaker(req.body);
  await writeAudit(req, 'speaker.create', 'speaker', String(item.id), String(item.name ?? ''));
  sendSuccess(res, item, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await updateSpeaker(param(req.params.id), req.body);
  await writeAudit(req, 'speaker.update', 'speaker', param(req.params.id));
  sendSuccess(res, item);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteSpeaker(param(req.params.id));
  await writeAudit(req, 'speaker.delete', 'speaker', param(req.params.id));
  sendSuccess(res, { ok: true });
});
