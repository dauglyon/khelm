import { create } from 'zustand';

interface SessionState {
  activeSessionId: string | null;
  setActiveSession: (id: string | null) => void;
}

/**
 * Client-side session UI state.
 * Session data lives in TanStack Query cache; this store holds
 * only derived/UI-only state like which session is active.
 */
export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  setActiveSession: (id: string | null) => set({ activeSessionId: id }),
}));
