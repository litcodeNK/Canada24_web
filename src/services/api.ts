export type PaginatedResponse<T> = { results: T[] };
export type ApiRequestOptions = RequestInit & { token?: string };

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'
).replace(/\/+$/, '');

async function parseResponse<T>(response: Response): Promise<T> {
  const ct = response.headers.get('content-type') ?? '';
  const data = ct.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const msg =
      typeof data === 'object' && data !== null && 'detail' in data
        ? String((data as Record<string, unknown>).detail)
        : `Request failed with status ${response.status}`;
    throw new ApiError(msg, response.status, data);
  }
  return data as T;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, body, ...init } = options;
  const rh = new Headers(headers);
  rh.set('Accept', 'application/json');
  if (token) rh.set('Authorization', `Bearer ${token}`);
  if (body && !(body instanceof FormData) && !rh.has('Content-Type'))
    rh.set('Content-Type', 'application/json');
  const np = path.startsWith('/') ? path : `/${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${API_BASE_URL}${np}`, { ...init, body, headers: rh, signal: controller.signal });
    return parseResponse<T>(res);
  } finally {
    clearTimeout(timer);
  }
}

export function extractList<T>(payload: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(payload)) return payload;
  return payload.results;
}
