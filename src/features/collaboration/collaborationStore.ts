/**
 * Collaboration Zustand store.
 * Holds lock entries, presence entries, connection state, and pending edits.
 * Socket event handlers (tasks 03-11) call setState on this store.
 *
 * Architecture reference: collaboration.md section 10.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { LockEntry, PresenceState } from './types';
import type { CardState } from '@/features/workspace/store/types';

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

export interface CollaborationState {
  // Lock state
  locks: Map<string, LockEntry>; // cardId -> LockEntry
  myLockedCardId: string | null;

  // Presence state
  participants: Map<string, PresenceState>; // userId -> PresenceState
  myUserId: string | null;

  // Connection state
  isConnected: boolean;
  isReconnecting: boolean;

  // Pending edits (for reconnection recovery)
  pendingEdits: Map<string, Partial<CardState>>;
}

export interface CollaborationActions {
  // Lock actions
  setLocks: (locks: Map<string, LockEntry>) => void;
  setLock: (cardId: string, entry: LockEntry) => void;
  removeLock: (cardId: string) => void;
  setMyLockedCardId: (cardId: string | null) => void;

  // Presence actions
  setParticipants: (participants: Map<string, PresenceState>) => void;
  setParticipant: (userId: string, state: PresenceState) => void;
  removeParticipant: (userId: string) => void;
  setMyUserId: (userId: string | null) => void;

  // Connection actions
  setConnected: (flag: boolean) => void;
  setReconnecting: (flag: boolean) => void;

  // Pending edits actions
  setPendingEdit: (cardId: string, changes: Partial<CardState>) => void;
  clearPendingEdit: (cardId: string) => void;
  getPendingEdit: (cardId: string) => Partial<CardState> | undefined;

  // Reset
  reset: () => void;
}

type CollaborationStore = CollaborationState & CollaborationActions;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: CollaborationState = {
  locks: new Map(),
  myLockedCardId: null,
  participants: new Map(),
  myUserId: null,
  isConnected: false,
  isReconnecting: false,
  pendingEdits: new Map(),
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCollaborationStore = create<CollaborationStore>((set, get) => ({
  ...initialState,

  // Lock actions
  setLocks: (locks) => set({ locks }),

  setLock: (cardId, entry) =>
    set((state) => {
      const next = new Map(state.locks);
      next.set(cardId, entry);
      return { locks: next };
    }),

  removeLock: (cardId) =>
    set((state) => {
      const next = new Map(state.locks);
      next.delete(cardId);
      return { locks: next };
    }),

  setMyLockedCardId: (cardId) => set({ myLockedCardId: cardId }),

  // Presence actions
  setParticipants: (participants) => set({ participants }),

  setParticipant: (userId, presenceState) =>
    set((state) => {
      const next = new Map(state.participants);
      next.set(userId, presenceState);
      return { participants: next };
    }),

  removeParticipant: (userId) =>
    set((state) => {
      const next = new Map(state.participants);
      next.delete(userId);
      return { participants: next };
    }),

  setMyUserId: (userId) => set({ myUserId: userId }),

  // Connection actions
  setConnected: (flag) => set({ isConnected: flag }),
  setReconnecting: (flag) => set({ isReconnecting: flag }),

  // Pending edits actions
  setPendingEdit: (cardId, changes) =>
    set((state) => {
      const next = new Map(state.pendingEdits);
      next.set(cardId, changes);
      return { pendingEdits: next };
    }),

  clearPendingEdit: (cardId) =>
    set((state) => {
      const next = new Map(state.pendingEdits);
      next.delete(cardId);
      return { pendingEdits: next };
    }),

  getPendingEdit: (cardId) => get().pendingEdits.get(cardId),

  // Reset
  reset: () => set({ ...initialState }),
}));

// ---------------------------------------------------------------------------
// External access (for socket handlers outside React)
// ---------------------------------------------------------------------------

export const {
  getState: getCollaborationState,
  setState: setCollaborationState,
} = useCollaborationStore;

// ---------------------------------------------------------------------------
// Selectors (custom hooks for render isolation)
// ---------------------------------------------------------------------------

export function useLock(cardId: string): LockEntry | undefined {
  return useCollaborationStore((state) => state.locks.get(cardId));
}

export function useIsCardLocked(cardId: string): boolean {
  return useCollaborationStore((state) => state.locks.has(cardId));
}

export function useIsCardLockedByMe(cardId: string): boolean {
  return useCollaborationStore(
    (state) => state.myLockedCardId === cardId
  );
}

export function useLockHolder(
  cardId: string
): { name: string; role: 'human' | 'ai' } | null {
  const holderName = useCollaborationStore(
    (state) => state.locks.get(cardId)?.holderName ?? null
  );
  const holderRole = useCollaborationStore(
    (state) => state.locks.get(cardId)?.holderRole ?? null
  );
  if (!holderName || !holderRole) return null;
  return { name: holderName, role: holderRole };
}

export function useMyLockedCardId(): string | null {
  return useCollaborationStore((state) => state.myLockedCardId);
}

export function useParticipants(): PresenceState[] {
  return useCollaborationStore(
    useShallow((state) => Array.from(state.participants.values()))
  );
}

export function useParticipant(
  userId: string
): PresenceState | undefined {
  return useCollaborationStore((state) =>
    state.participants.get(userId)
  );
}

export function useParticipantsOnCard(cardId: string): PresenceState[] {
  return useCollaborationStore(
    useShallow((state) =>
      Array.from(state.participants.values()).filter(
        (p) => p.focusedCardId === cardId && p.status !== 'offline'
      )
    )
  );
}

export function useIsConnected(): boolean {
  return useCollaborationStore((state) => state.isConnected);
}

export function useIsReconnecting(): boolean {
  return useCollaborationStore((state) => state.isReconnecting);
}
