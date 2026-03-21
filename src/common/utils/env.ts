/**
 * Typed accessors for Vite environment variables.
 * All env vars are prefixed with VITE_ and accessed via import.meta.env.
 */

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? '/api';
}

export function isMocksEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_MOCKS === 'true';
}

export function getWsUrl(): string {
  return import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';
}

export function getAuthProvider(): 'dev' | 'kbase' {
  const provider = import.meta.env.VITE_AUTH_PROVIDER;
  return provider === 'kbase' ? 'kbase' : 'dev';
}

export function getOllamaUrl(): string {
  return import.meta.env.VITE_OLLAMA_URL ?? '';
}
