import { API_BASE_URL } from '@/lib/config';
import { ApiError } from '@/lib/errors';
import { tokenStore } from '@/lib/storage';
import type { ApiEnvelope } from '@/types/api';

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
  timeoutMs?: number;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await request(path, options);
  return unwrap<T>(res.body, res.status);
}

async function request(path: string, options: RequestOptions) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.auth !== false) {
    const access = tokenStore.access;
    if (access) headers.set('Authorization', `Bearer ${access}`);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 30000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      cache: 'no-store'
    });
    const text = await response.text();
    const body = safeJson(text);

    if (response.status === 401 && options.auth !== false && options.retry !== false) {
      const code = extractCode(body);
      if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
        await refreshTokens();
        return request(path, { ...options, retry: false });
      }
    }

    if (!response.ok) {
      throw toApiError(body, response.status);
    }

    return { status: response.status, body };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('REQUEST_TIMEOUT', 'Wigope servers took too long to respond. Please retry.', undefined, {
        url
      });
    }
    throw new ApiError('NETWORK', "We couldn't reach Wigope servers. Please check your connection and retry.", undefined, {
      url,
      cause: error instanceof Error ? error.message : 'Unknown network error'
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function safeJson(text: string) {
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError('JSON_PARSE_FAILED', 'Server returned invalid JSON.');
  }
}

function unwrap<T>(body: unknown, status?: number): T {
  const envelope = body as ApiEnvelope<T>;
  if (envelope?.ok === false || envelope?.success === false) {
    throw toApiError(body, status);
  }
  if ('data' in (envelope ?? {})) return envelope.data as T;
  return body as T;
}

function toApiError(body: unknown, status?: number) {
  const envelope = body as ApiEnvelope<unknown>;
  const error = envelope?.error;
  const message =
    error?.message ||
    (typeof (body as { message?: unknown })?.message === 'string' ? String((body as { message?: unknown }).message) : '') ||
    `Request failed with status ${status ?? 'unknown'}.`;
  return new ApiError(
    error?.code ?? 'API_ERROR',
    message,
    status,
    error?.details
  );
}

function extractCode(body: unknown) {
  return (body as ApiEnvelope<unknown>)?.error?.code;
}

async function refreshTokens() {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) throw new ApiError('INVALID_TOKEN', 'Missing refresh token.', 401);
  const data = await api<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
    method: 'POST',
    auth: false,
    retry: false,
    body: JSON.stringify({ refreshToken })
  });
  tokenStore.save(data.accessToken, data.refreshToken);
}
