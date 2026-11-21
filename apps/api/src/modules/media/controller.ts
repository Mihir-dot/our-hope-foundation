import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { param } from '../../lib/params.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { paginationMeta, sendSuccess } from '../../lib/apiResponse.js';
import { ApiError } from '../../lib/ApiError.js';
import { writeAudit } from '../../lib/audit.js';
import { completeMedia, deleteMedia, getMedia, listMedia, mediaRoot, presignMedia, resolveMediaPath, saveLocalOrUpload } from './service.js';

const incoming = path.join(mediaRoot(), 'incoming');

export const mediaUpload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      fs.mkdirSync(incoming, { recursive: true });
      cb(null, incoming);
    },
    filename(_req, file, cb) {
      cb(null, `${nanoid(12)}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const presignSchema = z.object({
  filename: z.string().min(1).max(200),
  mime: z.string().min(1),
  bytes: z.number().int().positive(),
  alt: z.string().max(300).optional(),
  visibility: z.enum(['public', 'private']).optional(),
});

const completeSchema = z.object({
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listMedia(req.query as Record<string, unknown>);
  sendSuccess(res, result.items, paginationMeta(result.page, result.limit, result.total));
});

export const presign = asyncHandler(async (req: Request, res: Response) => {
  const data = await presignMedia(presignSchema.parse(req.body), req.user!.id);
  sendSuccess(res, data, undefined, 201);
});

export const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('Choose a file to upload');
  const media = await saveLocalOrUpload(
    req.file,
    { alt: typeof req.body.alt === 'string' ? req.body.alt : '', visibility: req.body.visibility },
    req.user!.id,
  );
  await writeAudit(req, 'media.create', 'media', String(media.id), req.file.originalname);
  sendSuccess(res, media, undefined, 201);
});

export const complete = asyncHandler(async (req: Request, res: Response) => {
  const media = await completeMedia(param(req.params.id), completeSchema.parse(req.body));
  await writeAudit(req, 'media.complete', 'media', param(req.params.id));
  sendSuccess(res, media);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteMedia(param(req.params.id));
  await writeAudit(req, 'media.delete', 'media', param(req.params.id));
  sendSuccess(res, { ok: true });
});

export const streamLocal = asyncHandler(async (req: Request, res: Response) => {
  const media = await getMedia(param(req.params.id));
  if (media.storage !== 'local') throw ApiError.notFound('File not found');
  res.setHeader('Content-Type', media.mime);
  res.setHeader('Content-Disposition', `inline; filename="${media.originalName || 'file'}"`);
  res.sendFile(resolveMediaPath(media.key));
});
