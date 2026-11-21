import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import { createUser, deleteUser, getUser, listUsers, updateUser } from './service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listUsers(req.query as Record<string, unknown>);
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getUser(param(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  await writeAudit(req, 'user.create', 'user', user.id, user.email);
  sendSuccess(res, user, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUser(param(req.params.id), req.body, req.user!.id);
  await writeAudit(req, 'user.update', 'user', user.id, user.email);
  sendSuccess(res, user);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteUser(param(req.params.id), req.user!.id);
  await writeAudit(req, 'user.delete', 'user', param(req.params.id));
  sendSuccess(res, { ok: true });
});
