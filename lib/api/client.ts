/**
 * Typed API Client
 *
 * A typed fetch wrapper for making API requests with consistent
 * error handling, authentication, and response parsing.
 */

import { getRequestId } from '@/lib/api/middleware/request-context';

// ============================================================================
// Types
// ============================================================================

export interface APIResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    statusCode: number;
  };
}

export class APIClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

// ============================================================================
// API Client
// ============================================================================

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Build URL with query parameters
 */
function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const url = new URL(path.startsWith('/') ? path : `/${path}`, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Make an API request with proper typing and error handling
 */
async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, timeout = DEFAULT_TIMEOUT, ...init } = options;

  const url = buildUrl(path, params);

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  // Add request ID for tracing (if available)
  try {
    const requestId = getRequestId();
    if (requestId) {
      headers['x-request-id'] = requestId;
    }
  } catch {
    // Not in request context, skip
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      const error = data.error || {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        statusCode: response.status,
      };

      throw new APIClientError(
        error.message,
        error.code,
        error.statusCode || response.status,
        error.details
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof APIClientError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new APIClientError('Request timed out', 'TIMEOUT', 408);
      }
      throw new APIClientError(error.message, 'NETWORK_ERROR', 0);
    }

    throw new APIClientError('An unknown error occurred', 'UNKNOWN_ERROR', 0);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * API client with convenience methods
 */
export const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'POST', body });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'PUT', body });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'PATCH', body });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};

// ============================================================================
// React Query Helpers
// ============================================================================

/**
 * Create a query function for React Query
 */
export function createQueryFn<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  return async (): Promise<T> => {
    return api.get<T>(path, { params });
  };
}

/**
 * Create a mutation function for React Query
 */
export function createMutationFn<TData, TVariables>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  return async (variables: TVariables): Promise<TData> => {
    switch (method) {
      case 'POST':
        return api.post<TData>(path, variables);
      case 'PUT':
        return api.put<TData>(path, variables);
      case 'PATCH':
        return api.patch<TData>(path, variables);
      case 'DELETE':
        return api.delete<TData>(path);
    }
  };
}
