'use client';

/**
 * HTTP client for API calls with automatic auth header injection and error handling
 */

export interface ApiErrorResponse {
  status: number;
  message: string;
  details?: Record<string, any>;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get authorization token from localStorage (client-side fallback)
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
}

/**
 * Fetch JSON from API with automatic auth header and error handling
 */
export async function fetchJson<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${path}`;
  const token = getToken();

  const headers = new Headers(options?.headers || {});
  
  // Attach auth header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Ensure Content-Type for JSON
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      const error = new ApiError(
        response.status,
        data?.message || data?.error || `HTTP ${response.status}`,
        data?.details || data
      );

      // 401 Unauthorized - auto-logout (client only)
      if (response.status === 401 && typeof window !== 'undefined') {
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          // Optionally redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } catch (e) {
          console.error('Failed to handle 401:', e);
        }
      }

      throw error;
    }

    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error
    if (error instanceof TypeError) {
      const msg = `Failed to connect to ${url}. Check API_URL and network.`;
      console.error(msg, error);
      throw new ApiError(0, msg, { originalError: error });
    }

    throw error;
  }
}

/**
 * Helper for GET requests
 */
export function apiGet<T>(path: string): Promise<T> {
  return fetchJson<T>(path, { method: 'GET' });
}

/**
 * Helper for POST requests
 */
export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return fetchJson<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for PATCH requests
 */
export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return fetchJson<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for DELETE requests
 */
export function apiDelete<T>(path: string): Promise<T> {
  return fetchJson<T>(path, { method: 'DELETE' });
}
