import { getAccessToken, setAccessToken } from './auth-token';
import type { ApiMeta, SessionUser } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function apiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

type Success<T> = { data: T; meta?: ApiMeta };

async function readBody<T>(res: Response): Promise<Success<T>> {
  const text = await res.text();
  let json: { success?: boolean; data?: T; meta?: ApiMeta; error?: { message?: string; details?: unknown } } = {};
  if (text) {
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      throw new ApiError('The server returned an unexpected response', res.status);
    }
  }
  if (!res.ok || json.success === false) {
    throw new ApiError(json.error?.message || 'Something went wrong', res.status, json.error?.details);
  }
  return { data: json.data as T, meta: json.meta };
}

export function errorText(error: unknown) {
  if (error instanceof ApiError) {
    const details = error.details as { fieldErrors?: Record<string, string[]> } | undefined;
    const fieldErrors = details?.fieldErrors;
    if (fieldErrors) {
      const first = Object.entries(fieldErrors).find(([, messages]) => messages?.length);
      if (first?.[1]?.[0]) return `${first[0]}: ${first[1][0]}`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export async function serverFetch<T>(
  path: string,
  revalidate = process.env.NODE_ENV === 'development' ? 0 : 60,
): Promise<Success<T> | null> {
  try {
    const res = await fetch(apiUrl(path), {
      headers: { Accept: 'application/json' },
      ...(revalidate === 0 ? { cache: 'no-store' as const } : { next: { revalidate } }),
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await readBody<T>(res);
  } catch {
    return null;
  }
}

let refreshLock: Promise<SessionUser | null> | null = null;

export function refreshSession() {
  if (!refreshLock) {
    refreshLock = (async () => {
      try {
        const res = await fetch(apiUrl('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const json = (await res.json()) as { data?: { accessToken?: string; user?: SessionUser } };
        if (!json.data?.accessToken || !json.data.user) {
          setAccessToken(null);
          return null;
        }
        setAccessToken(json.data.accessToken);
        return json.data.user;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        refreshLock = null;
      }
    })();
  }
  return refreshLock;
}

type ClientInit = RequestInit & { auth?: boolean; retry?: boolean };

export async function clientFetch<T>(path: string, init: ClientInit = {}): Promise<Success<T>> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !isForm && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (init.auth !== false) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && init.auth !== false && init.retry !== false) {
    const user = await refreshSession();
    if (user) return clientFetch<T>(path, { ...init, retry: false });
  }

  return readBody<T>(res);
}

export async function downloadAuthed(path: string, filename: string) {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let res = await fetch(apiUrl(path), { credentials: 'include', headers });
  if (res.status === 401) {
    const user = await refreshSession();
    if (!user) throw new ApiError('Please sign in again', 401);
    const retryHeaders = new Headers();
    const next = getAccessToken();
    if (next) retryHeaders.set('Authorization', `Bearer ${next}`);
    res = await fetch(apiUrl(path), { credentials: 'include', headers: retryHeaders });
  }
  if (!res.ok) throw new ApiError('Download failed', res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
