import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customFetch } from './fetcher';

// Mock env utilities so tests are not affected by import.meta.env.
// Return empty string so fetch receives the URL as-is (no prefix added).
vi.mock('@/common/utils/env', () => ({
  getApiBaseUrl: () => '',
}));

// Mock authStore to control token state in tests
vi.mock('@/common/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ token: null })),
  },
}));

// Helper to get the mocked useAuthStore after module resolution
async function getAuthStoreMock() {
  const mod = await import('@/common/stores/authStore');
  return mod.useAuthStore;
}

describe('customFetch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset auth store to unauthenticated by default
    import('@/common/stores/authStore').then(({ useAuthStore }) => {
      vi.mocked(useAuthStore.getState).mockReturnValue({ token: null } as never);
    });
  });

  it('returns wrapped data for 200 JSON response', async () => {
    const mockData = { id: '1', name: 'Test' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue(mockData),
      })
    );

    const result = await customFetch<{ data: typeof mockData; status: number }>('/api/test');
    expect(result).toEqual(
      expect.objectContaining({
        data: mockData,
        status: 200,
      })
    );
  });

  it('returns wrapped undefined data for 204 no-content response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      })
    );

    const result = await customFetch<{ data: undefined; status: number }>('/api/test');
    expect(result).toEqual(
      expect.objectContaining({
        data: undefined,
        status: 204,
      })
    );
  });

  it('throws wrapped error object for 400 error response', async () => {
    const errorData = { message: 'Bad Request' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue(errorData),
      })
    );

    await expect(customFetch('/api/test')).rejects.toMatchObject({
      data: errorData,
      status: 400,
    });
  });

  it('throws wrapped error object for 404 error response', async () => {
    const errorData = { message: 'Not Found' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue(errorData),
      })
    );

    await expect(customFetch('/api/test')).rejects.toMatchObject({
      data: errorData,
      status: 404,
    });
  });

  it('throws wrapped error object for 500 server error', async () => {
    const errorData = { message: 'Internal Server Error' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue(errorData),
      })
    );

    await expect(customFetch('/api/test')).rejects.toMatchObject({
      data: errorData,
      status: 500,
    });
  });

  it('throws on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    );

    await expect(customFetch('/api/test')).rejects.toThrow('Failed to fetch');
  });

  it('passes init options through to fetch (no token)', async () => {
    const { useAuthStore } = await import('@/common/stores/authStore');
    vi.mocked(useAuthStore.getState).mockReturnValue({ token: null } as never);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    const init: RequestInit = { method: 'POST', body: JSON.stringify({ foo: 'bar' }) };
    await customFetch('/api/test', init);

    // When no token, headers are merged but no Authorization added
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({ method: 'POST', body: init.body })
    );
  });

  it('attaches Authorization header when token is present', async () => {
    const { useAuthStore } = await import('@/common/stores/authStore');
    vi.mocked(useAuthStore.getState).mockReturnValue({ token: 'my-token' } as never);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    await customFetch('/api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      })
    );
  });

  it('prepends base URL from getApiBaseUrl to the path', async () => {
    // Re-mock env to return a non-empty base URL for this test
    const envMod = await import('@/common/utils/env');
    vi.spyOn(envMod, 'getApiBaseUrl').mockReturnValue('/api');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    await customFetch('/sessions');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/sessions',
      expect.anything()
    );
  });
});
