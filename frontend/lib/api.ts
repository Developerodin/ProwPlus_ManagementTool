'use client';

type Options = Omit<RequestInit, 'body'> & { body?: any };

/**
 * Resolves the `/api` base URL. In the browser, if `NEXT_PUBLIC_API_URL` is set,
 * requests go straight to the Express server (e.g. `http://localhost:3002/api`),
 * which matches DevTools and avoids relying on Next.js rewrites for API traffic.
 */
function getApiBase(): string {
  if (typeof window === 'undefined') return '/api';
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw?.trim()) return '/api';
  return `${raw.replace(/\/$/, '')}/api`;
}

async function request<T = any>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    ...opts,
    headers,
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (data && (data as any).message) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  get: <T = any>(p: string) => request<T>(p),
  post: <T = any>(p: string, body?: any) => request<T>(p, { method: 'POST', body }),
  patch: <T = any>(p: string, body?: any) => request<T>(p, { method: 'PATCH', body }),
  del: <T = any>(p: string) => request<T>(p, { method: 'DELETE' }),
};
