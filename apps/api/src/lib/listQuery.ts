import { parsePagination } from './pagination.js';

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function queryString(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].trim();
  return '';
}

export function listQuery(
  query: Record<string, unknown>,
  fields: string[],
  opts?: { status?: string; base?: Record<string, unknown> },
) {
  const { page, limit, skip, q } = parsePagination(query);
  const filter: Record<string, unknown> = { ...(opts?.base ?? {}) };
  if (opts?.status) filter.status = opts.status;
  else {
    const status = queryString(query.status);
    if (status) filter.status = status;
  }
  if (q && fields.length) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = fields.map((field) => ({ [field]: rx }));
  }
  return { page, limit, skip, q, filter };
}
