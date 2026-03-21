import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset to a known state
    useAuthStore.setState({ token: null });
  });

  it('has null token by default (when reset)', () => {
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('setToken updates the token', () => {
    useAuthStore.getState().setToken('test-token');
    expect(useAuthStore.getState().token).toBe('test-token');
  });

  it('clearToken sets token to null', () => {
    useAuthStore.getState().setToken('test-token');
    useAuthStore.getState().clearToken();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
