import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSessions } from './useSessions';
import { createWrapper } from '@/test/renderWithProviders';

describe('useSessions', () => {
  it('returns session list from MSW mock', async () => {
    const { result } = renderHook(() => useSessions(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(Array.isArray(result.current.sessions)).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('sessions have expected shape', async () => {
    const { result } = renderHook(() => useSessions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    if (result.current.sessions.length > 0) {
      const session = result.current.sessions[0];
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('title');
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('status');
    }
  });
});
