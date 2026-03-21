import { describe, it, expect } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCreateSessionMutation } from './useCreateSession';
import { createWrapper } from '@/test/renderWithProviders';

describe('useCreateSession', () => {
  it('creates a session and returns it', async () => {
    const { result } = renderHook(() => useCreateSessionMutation(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isCreating).toBe(false);

    await act(async () => {
      await result.current.createSession('My Test Session');
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
      expect(result.current.createdSession).toBeDefined();
    });

    expect(result.current.createdSession).toHaveProperty('id');
    expect(result.current.createdSession).toHaveProperty('title');
  });

  it('starts with isCreating false', () => {
    const { result } = renderHook(() => useCreateSessionMutation(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isCreating).toBe(false);
    expect(result.current.createdSession).toBeUndefined();
  });
});
