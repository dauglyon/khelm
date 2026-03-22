import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useCollaborationStore,
  useLock,
  useIsCardLocked,
  useIsCardLockedByMe,
  useLockHolder,
  useMyLockedCardId,
  useParticipants,
  useParticipant,
  useParticipantsOnCard,
  useIsConnected,
  useIsReconnecting,
} from './collaborationStore';
import { makeLockEntry, makePresenceState, resetFixtureIds } from './testing/fixtures';

describe('collaborationStore', () => {
  beforeEach(() => {
    resetFixtureIds();
    useCollaborationStore.getState().reset();
  });

  // ---- Lock actions ----

  describe('lock actions', () => {
    it('setLock adds a lock entry', () => {
      const lock = makeLockEntry({ cardId: 'c1' });
      useCollaborationStore.getState().setLock('c1', lock);
      expect(useCollaborationStore.getState().locks.get('c1')).toEqual(lock);
    });

    it('removeLock removes a lock entry', () => {
      const lock = makeLockEntry({ cardId: 'c1' });
      useCollaborationStore.getState().setLock('c1', lock);
      useCollaborationStore.getState().removeLock('c1');
      expect(useCollaborationStore.getState().locks.has('c1')).toBe(false);
    });

    it('setLocks replaces entire lock map', () => {
      const lock1 = makeLockEntry({ cardId: 'c1' });
      const lock2 = makeLockEntry({ cardId: 'c2' });
      useCollaborationStore.getState().setLock('c1', lock1);

      const newMap = new Map([['c2', lock2]]);
      useCollaborationStore.getState().setLocks(newMap);

      expect(useCollaborationStore.getState().locks.has('c1')).toBe(false);
      expect(useCollaborationStore.getState().locks.has('c2')).toBe(true);
    });

    it('setMyLockedCardId tracks current user lock', () => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
      expect(useCollaborationStore.getState().myLockedCardId).toBe('c1');
    });
  });

  // ---- Presence actions ----

  describe('presence actions', () => {
    it('setParticipant adds a participant', () => {
      const p = makePresenceState({ userId: 'u1' });
      useCollaborationStore.getState().setParticipant('u1', p);
      expect(useCollaborationStore.getState().participants.get('u1')).toEqual(p);
    });

    it('removeParticipant removes a participant', () => {
      const p = makePresenceState({ userId: 'u1' });
      useCollaborationStore.getState().setParticipant('u1', p);
      useCollaborationStore.getState().removeParticipant('u1');
      expect(useCollaborationStore.getState().participants.has('u1')).toBe(false);
    });

    it('setParticipants replaces entire participant map', () => {
      const p1 = makePresenceState({ userId: 'u1' });
      const p2 = makePresenceState({ userId: 'u2' });
      useCollaborationStore.getState().setParticipant('u1', p1);

      const newMap = new Map([['u2', p2]]);
      useCollaborationStore.getState().setParticipants(newMap);

      expect(useCollaborationStore.getState().participants.has('u1')).toBe(false);
      expect(useCollaborationStore.getState().participants.has('u2')).toBe(true);
    });
  });

  // ---- Connection actions ----

  describe('connection actions', () => {
    it('setConnected updates connection status', () => {
      useCollaborationStore.getState().setConnected(true);
      expect(useCollaborationStore.getState().isConnected).toBe(true);
    });

    it('setReconnecting updates reconnecting status', () => {
      useCollaborationStore.getState().setReconnecting(true);
      expect(useCollaborationStore.getState().isReconnecting).toBe(true);
    });
  });

  // ---- Pending edits ----

  describe('pending edits', () => {
    it('setPendingEdit stores changes', () => {
      useCollaborationStore
        .getState()
        .setPendingEdit('c1', { content: 'updated' });
      expect(useCollaborationStore.getState().getPendingEdit('c1')).toEqual({
        content: 'updated',
      });
    });

    it('clearPendingEdit removes stored changes', () => {
      useCollaborationStore
        .getState()
        .setPendingEdit('c1', { content: 'updated' });
      useCollaborationStore.getState().clearPendingEdit('c1');
      expect(
        useCollaborationStore.getState().getPendingEdit('c1')
      ).toBeUndefined();
    });
  });

  // ---- Reset ----

  describe('reset', () => {
    it('clears all state', () => {
      const lock = makeLockEntry({ cardId: 'c1' });
      const p = makePresenceState({ userId: 'u1' });
      const store = useCollaborationStore.getState();
      store.setLock('c1', lock);
      store.setParticipant('u1', p);
      store.setMyLockedCardId('c1');
      store.setConnected(true);
      store.setPendingEdit('c1', { content: 'x' });

      store.reset();

      const state = useCollaborationStore.getState();
      expect(state.locks.size).toBe(0);
      expect(state.participants.size).toBe(0);
      expect(state.myLockedCardId).toBeNull();
      expect(state.isConnected).toBe(false);
      expect(state.pendingEdits.size).toBe(0);
    });
  });

  // ---- Selectors ----

  describe('selectors', () => {
    it('useLock returns lock for card', () => {
      const lock = makeLockEntry({ cardId: 'c1' });
      useCollaborationStore.getState().setLock('c1', lock);

      const { result } = renderHook(() => useLock('c1'));
      expect(result.current).toEqual(lock);
    });

    it('useLock returns undefined for unlocked card', () => {
      const { result } = renderHook(() => useLock('c1'));
      expect(result.current).toBeUndefined();
    });

    it('useIsCardLocked returns true when locked', () => {
      const lock = makeLockEntry({ cardId: 'c1' });
      useCollaborationStore.getState().setLock('c1', lock);

      const { result } = renderHook(() => useIsCardLocked('c1'));
      expect(result.current).toBe(true);
    });

    it('useIsCardLocked returns false when not locked', () => {
      const { result } = renderHook(() => useIsCardLocked('c1'));
      expect(result.current).toBe(false);
    });

    it('useIsCardLockedByMe returns true when I hold the lock', () => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
      const { result } = renderHook(() => useIsCardLockedByMe('c1'));
      expect(result.current).toBe(true);
    });

    it('useIsCardLockedByMe returns false when someone else holds it', () => {
      useCollaborationStore.getState().setMyLockedCardId('c2');
      const { result } = renderHook(() => useIsCardLockedByMe('c1'));
      expect(result.current).toBe(false);
    });

    it('useLockHolder returns holder info', () => {
      const lock = makeLockEntry({
        cardId: 'c1',
        holderName: 'Alice',
        holderRole: 'human',
      });
      useCollaborationStore.getState().setLock('c1', lock);

      const { result } = renderHook(() => useLockHolder('c1'));
      expect(result.current).toEqual({ name: 'Alice', role: 'human' });
    });

    it('useLockHolder returns null when no lock', () => {
      const { result } = renderHook(() => useLockHolder('c1'));
      expect(result.current).toBeNull();
    });

    it('useMyLockedCardId returns current locked card', () => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
      const { result } = renderHook(() => useMyLockedCardId());
      expect(result.current).toBe('c1');
    });

    it('useParticipants returns all participants', () => {
      const p1 = makePresenceState({ userId: 'u1' });
      const p2 = makePresenceState({ userId: 'u2' });
      useCollaborationStore.getState().setParticipant('u1', p1);
      useCollaborationStore.getState().setParticipant('u2', p2);

      const { result } = renderHook(() => useParticipants());
      expect(result.current).toHaveLength(2);
    });

    it('useParticipant returns specific participant', () => {
      const p = makePresenceState({ userId: 'u1', displayName: 'Alice' });
      useCollaborationStore.getState().setParticipant('u1', p);

      const { result } = renderHook(() => useParticipant('u1'));
      expect(result.current?.displayName).toBe('Alice');
    });

    it('useParticipantsOnCard filters by focusedCardId', () => {
      const p1 = makePresenceState({
        userId: 'u1',
        focusedCardId: 'c1',
        status: 'online',
      });
      const p2 = makePresenceState({
        userId: 'u2',
        focusedCardId: 'c2',
        status: 'online',
      });
      const p3 = makePresenceState({
        userId: 'u3',
        focusedCardId: 'c1',
        status: 'online',
      });
      useCollaborationStore.getState().setParticipant('u1', p1);
      useCollaborationStore.getState().setParticipant('u2', p2);
      useCollaborationStore.getState().setParticipant('u3', p3);

      const { result } = renderHook(() => useParticipantsOnCard('c1'));
      expect(result.current).toHaveLength(2);
    });

    it('useParticipantsOnCard excludes offline participants', () => {
      const p1 = makePresenceState({
        userId: 'u1',
        focusedCardId: 'c1',
        status: 'offline',
      });
      useCollaborationStore.getState().setParticipant('u1', p1);

      const { result } = renderHook(() => useParticipantsOnCard('c1'));
      expect(result.current).toHaveLength(0);
    });

    it('useIsConnected returns connection status', () => {
      const { result } = renderHook(() => useIsConnected());
      expect(result.current).toBe(false);

      act(() => {
        useCollaborationStore.getState().setConnected(true);
      });
      expect(result.current).toBe(true);
    });

    it('useIsReconnecting returns reconnecting status', () => {
      const { result } = renderHook(() => useIsReconnecting());
      expect(result.current).toBe(false);

      act(() => {
        useCollaborationStore.getState().setReconnecting(true);
      });
      expect(result.current).toBe(true);
    });
  });
});
