import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env, hasS3 } from '../../config/env.js';
import { s3 } from '../../config/s3.js';
import { ApiError } from '../../lib/ApiError.js';
import { listQuery } from '../../lib/listQuery.js';
import { present } from '../../lib/present.js';
import { Event } from '../events/model.js';
import { Page } from '../pages/model.js';
import { Program } from '../programs/model.js';
import { Resource } from '../resources/model.js';
import { Speaker } from '../speakers/model.js';
import { Story } from '../stories/model.js';
import { Media } from './model.js';

const IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PDF = 'application/pdf';

export function mediaRoot() {
  return path.resolve(process.cwd(), env.LOCAL_MEDIA_DIR);
}

export function resolveMediaPath(key: string) {
  const root = mediaRoot();
  const full = path.resolve(root, key);
  if (full !== root && !full.startsWith(root + path.sep)) throw ApiError.badRequest('Invalid media path');
  return full;
}

function assertFile(mime: string, bytes: number, alt?: string) {
  if (IMAGES.has(mime)) {
    if (bytes > 5 * 1024 * 1024) throw ApiError.badRequest('Images must be 5 MB or smaller');
    if (!alt?.trim()) throw ApiError.badRequest('Alt text is required for images');
    return;
  }
  if (mime === PDF) {
    if (bytes > 25 * 1024 * 1024) throw ApiError.badRequest('PDFs must be 25 MB or smaller');
    return;
  }
  throw ApiError.badRequest('Use a JPEG, PNG, WebP, or PDF');
}

function visibilityFor(mime: string, requested?: string) {
  if (requested === 'public' || requested === 'private') return requested;
  return mime === PDF ? 'private' : 'public';
}

function publicUrl(visibility: string, filename: string) {
  if (visibility !== 'public') return '';
  return `${env.LOCAL_MEDIA_PUBLIC_URL.replace(/\/$/, '')}/${filename}`;
}

export async function listMedia(query: Record<string, unknown>) {
  const { page, limit, skip, filter } = listQuery(query, ['originalName', 'alt', 'mime']);
  const [rows, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);
  return { items: rows.map((row) => present(row)), total, page, limit };
}

export async function getMedia(id: string) {
  const media = await Media.findById(id);
  if (!media) throw ApiError.notFound('Media not found');
  return media;
}

export async function presignMedia(
  input: { filename: string; mime: string; bytes: number; alt?: string; visibility?: 'public' | 'private' },
  userId: string,
) {
  assertFile(input.mime, input.bytes, input.alt);
  if (!hasS3 || !s3) {
    return { mode: 'local' as const, uploadUrl: '/api/v1/admin/media/upload' };
  }
  const visibility = visibilityFor(input.mime, input.visibility);
  const ext = path.extname(input.filename).toLowerCase().slice(0, 8);
  const key = `${visibility}/${nanoid(16)}${ext}`;
  const media = await Media.create({
    key,
    visibility,
    mime: input.mime,
    bytes: input.bytes,
    alt: input.alt?.trim() ?? '',
    originalName: input.filename,
    storage: 's3',
    url: '',
    createdBy: userId,
  });
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: input.mime,
      ContentLength: input.bytes,
    }),
    { expiresIn: 300 },
  );
  return { mode: 's3' as const, uploadUrl, media: present(media) };
}

export async function saveLocalOrUpload(
  file: Express.Multer.File,
  meta: { alt?: string; visibility?: string },
  userId: string,
) {
  assertFile(file.mimetype, file.size, meta.alt);
  const visibility = visibilityFor(file.mimetype, meta.visibility);
  const filename = `${nanoid(16)}${path.extname(file.originalname).toLowerCase().slice(0, 8)}`;
  const key = `${visibility}/${filename}`;

  if (hasS3 && s3) {
    const body = await fs.readFile(file.path);
    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: file.mimetype,
      }),
    );
    await fs.unlink(file.path).catch(() => undefined);
    const base = env.S3_PUBLIC_BASE_URL.replace(/\/$/, '');
    const media = await Media.create({
      key,
      visibility,
      mime: file.mimetype,
      bytes: file.size,
      alt: meta.alt?.trim() ?? '',
      originalName: file.originalname,
      storage: 's3',
      url: visibility === 'public' && base ? `${base}/${key}` : '',
      createdBy: userId,
    });
    return present(media);
  }

  const dir = path.join(mediaRoot(), visibility);
  await fs.mkdir(dir, { recursive: true });
  await fs.rename(file.path, path.join(dir, filename));
  const media = await Media.create({
    key,
    visibility,
    mime: file.mimetype,
    bytes: file.size,
    alt: meta.alt?.trim() ?? '',
    originalName: file.originalname,
    storage: 'local',
    url: publicUrl(visibility, filename),
    createdBy: userId,
  });
  return present(media);
}

export async function completeMedia(id: string, input: { width?: number; height?: number }) {
  const media = await getMedia(id);
  if (input.width) media.width = input.width;
  if (input.height) media.height = input.height;
  if (media.storage === 's3' && media.visibility === 'public' && env.S3_PUBLIC_BASE_URL) {
    media.url = `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${media.key}`;
  }
  if (media.storage === 'local' && media.visibility === 'public') {
    media.url = publicUrl('public', path.basename(media.key));
  }
  await media.save();
  return present(media);
}

async function isReferenced(id: string) {
  const [program, event, story, speaker, resource, page] = await Promise.all([
    Program.exists({ coverId: id }),
    Event.exists({ coverId: id }),
    Story.exists({ coverId: id }),
    Speaker.exists({ photoId: id }),
    Resource.exists({ fileId: id }),
    Page.exists({
      $or: [
        { 'blocks.data.imageId': id },
        { 'blocks.data.mediaId': id },
        { 'blocks.data.coverId': id },
        { 'blocks.data.fileId': id },
      ],
    }),
  ]);
  return Boolean(program || event || story || speaker || resource || page);
}

export async function deleteMedia(id: string) {
  const media = await getMedia(id);
  if (await isReferenced(id)) throw ApiError.conflict('This file is still used by published content');
  if (media.storage === 's3' && s3) {
    await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: media.key }));
  } else {
    await fs.unlink(resolveMediaPath(media.key)).catch(() => undefined);
  }
  await media.deleteOne();
}

export async function signedDownload(mediaId: string) {
  const media = await getMedia(mediaId);
  if (media.storage === 'local') {
    return { url: `${env.API_PUBLIC_URL.replace(/\/$/, '')}/api/v1/media/local/${media.id}`, storage: 'local' as const, media };
  }
  if (!s3) throw ApiError.internal('File storage is not available');
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: media.key }),
    { expiresIn: 120 },
  );
  return { url, storage: 's3' as const, media };
}
