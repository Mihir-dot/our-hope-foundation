export function present<T = Record<string, unknown>>(doc: unknown): T {
  if (doc == null) return doc as T;
  const source =
    typeof doc === 'object' &&
    doc !== null &&
    'toObject' in doc &&
    typeof (doc as { toObject?: unknown }).toObject === 'function'
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : { ...(doc as Record<string, unknown>) };

  const obj: Record<string, unknown> = { ...source };
  if (obj._id != null) obj.id = String(obj._id);
  delete obj._id;
  delete obj.__v;
  delete obj.passwordHash;
  delete obj.resetTokenHash;
  delete obj.resetTokenExpires;
  delete obj.confirmTokenHash;
  return obj as T;
}
