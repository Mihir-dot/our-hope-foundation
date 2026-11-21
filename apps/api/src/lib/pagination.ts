export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
  const skip = (page - 1) * limit;
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  return { page, limit, skip, q };
}
