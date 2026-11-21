import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { writeAudit } from '../../lib/audit.js';
import {
  archiveEvent,
  createEvent,
  getEvent,
  getPublishedEvent,
  listEvents,
  listRegistrations,
  registerForEvent,
  registrationsCsv,
  updateEvent,
  updateRegistration,
} from './service.js';

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const result = await listEvents(req.query as Record<string, unknown>, 'public');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getPublishedEvent(param(req.params.slug)));
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const item = await registerForEvent(param(req.params.slug), req.body, req.ip);
  sendSuccess(res, item, undefined, 201);
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await listEvents(req.query as Record<string, unknown>, 'admin');
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await getEvent(param(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await createEvent(req.body);
  await writeAudit(req, 'event.create', 'event', String(item.id), String(item.slug ?? ''));
  sendSuccess(res, item, undefined, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await updateEvent(param(req.params.id), req.body);
  await writeAudit(req, 'event.update', 'event', param(req.params.id));
  sendSuccess(res, item);
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  await archiveEvent(param(req.params.id));
  await writeAudit(req, 'event.archive', 'event', param(req.params.id));
  sendSuccess(res, { ok: true });
});

export const registrations = asyncHandler(async (req: Request, res: Response) => {
  const result = await listRegistrations(param(req.params.id), req.query as Record<string, unknown>);
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const exportRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const file = await registrationsCsv(param(req.params.id));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  res.send(file.csv);
});

export const patchRegistration = asyncHandler(async (req: Request, res: Response) => {
  const item = await updateRegistration(param(req.params.id), req.body.status);
  await writeAudit(req, 'registration.update', 'registration', param(req.params.id), req.body.status);
  sendSuccess(res, item);
});
