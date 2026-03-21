import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

/**
 * Initialize with a fake token in dev mode.
 */
function getInitialToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const provider = import.meta.env.VITE_AUTH_PROVIDER;
      if (provider === 'dev') {
        return 'dev-token-placeholder';
      }
    } catch {
      // import.meta.env may not be available in all contexts
    }
  }
  return null;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getInitialToken(),
  setToken: (token: string) => set({ token }),
  clearToken: () => set({ token: null }),
}));

/**
 * Derived selector for authentication status.
 */
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.token !== null);
