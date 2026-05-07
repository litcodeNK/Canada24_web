import { ApiError, apiRequest } from './api';

export const SESSION_KEY = '@canada247_session';

export type StoredSessionRecord = {
  accessToken: string;
  refreshToken: string;
  [key: string]: unknown;
};

export function readStoredSession<T extends StoredSessionRecord = StoredSessionRecord>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function writeStoredSession<T extends StoredSessionRecord>(session: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export async function requestWithStoredSession<T, TSession extends StoredSessionRecord = StoredSessionRecord>(
  session: TSession,
  path: string,
  init: RequestInit = {},
): Promise<{ data: T; session: TSession }> {
  try {
    const data = await apiRequest<T>(path, { ...init, token: session.accessToken });
    return { data, session };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    const refreshPayload = await apiRequest<{ access: string; refresh?: string }>(
      '/auth/token/refresh/',
      { method: 'POST', body: JSON.stringify({ refresh: session.refreshToken }) },
    );

    const nextSession = {
      ...session,
      accessToken: refreshPayload.access,
      refreshToken: refreshPayload.refresh ?? session.refreshToken,
    } as TSession;

    writeStoredSession(nextSession);
    const data = await apiRequest<T>(path, { ...init, token: nextSession.accessToken });
    return { data, session: nextSession };
  }
}
