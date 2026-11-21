import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { archiveProgram, createProgram, getProgram, getPublishedProgram, listPrograms, updateProgram } from './service.js';

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPrograms(req.query as Record<string, unknown>, 'public');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getPublishedProgram(param(req.params.slug)));
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPrograms(req.query as Record<string, unknown>, 'admin');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getProgram(param(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await createProgram(req.body);
  await writeAudit(req, 'program.create', 'program', String(item.id), String(item.slug ?? ''));
  sendSuccess(res, item, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await updateProgram(param(req.params.id), req.body);
  await writeAudit(req, 'program.update', 'program', param(req.params.id));
  sendSuccess(res, item);
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  await archiveProgram(param(req.params.id));
  await writeAudit(req, 'program.archive', 'program', param(req.params.id));
  sendSuccess(res, { ok: true });
});
