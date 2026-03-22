import { getApiBaseUrl } from '@/common/utils/env';
import { useAuthStore } from '@/common/stores/authStore';

/**
 * Custom fetch wrapper for Orval-generated hooks.
 * Orval passes (url, init) -- same signature as native fetch.
 * Returns response wrapped with status and headers for discriminated unions.
 */
export const customFetch = async <T>(
  url: string,
  init?: RequestInit
): Promise<T> => {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {
    ...(init?.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(getApiBaseUrl() + url, { ...init, headers });

  // Handle 204 No Content
  if (response.status === 204) {
    return {
      data: undefined,
      status: response.status,
      headers: response.headers,
    } as T;
  }

  const data = await response.json();

  if (!response.ok) {
    // For error responses, also wrap with status/headers
    // but throw so TanStack Query sees it as an error
    throw {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};

export default customFetch;
