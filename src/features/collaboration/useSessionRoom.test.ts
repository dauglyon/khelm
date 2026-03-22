import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createMockSocket } from './testing/mockSocket';
import { useCollaborationStore } from './collaborationStore';
import { useSessionStore } from '@/features/workspace/store/sessionStore';
import { makePresenceState, makeLockEntry, makeCardState, resetFixtureIds } from './testing/fixtures';
import type { MockSocket } from './testing/mockSocket';

let mockSocket: MockSocket;

vi.mock('./socketClient', () => ({
  getSocket: () => mockSocket,
}));

// Must import after mocking
const { useSessionRoom } = await import('./useSessionRoom');

describe('useSessionRoom', () => {
  beforeEach(() => {
    resetFixtureIds();
    mockSocket = createMockSocket();
    useCollaborationStore.getState().reset();
    useSessionStore.setState({
      cards: new Map(),
      order: [],
      activeCardId: null,
      detailCardId: null,
      streamBuffers: new Map(),
      renderedCardIds: new Set(),
    });
  });

  it('emits session:join on mount with sessionId', () => {
    renderHook(() => useSessionRoom('session-1'));

    const lastJoin = mockSocket.getLastEmit('session:join');
    expect(lastJoin).toEqual([{ sessionId: 'session-1' }]);
  });

  it('emits session:leave on unmount', () => {
    const { unmount } = renderHook(() => useSessionRoom('session-1'));
    unmount();

    const lastLeave = mockSocket.getLastEmit('session:leave');
    expect(lastLeave).toEqual([{ sessionId: 'session-1' }]);
  });

  it('handles session:state snapshot - populates locks and participants', () => {
    renderHook(() => useSessionRoom('session-1'));

    const lock = makeLockEntry({ cardId: 'c1' });
    const participant = makePresenceState({ userId: 'u1' });
    const card = makeCardState({ id: 'card-1' });

    mockSocket.simulateEvent('session:state', {
      locks: [lock],
      participants: [participant],
      cards: [card],
    });

    expect(useCollaborationStore.getState().locks.get('c1')).toEqual(lock);
    expect(useCollaborationStore.getState().participants.get('u1')).toEqual(
      participant
    );
    expect(useSessionStore.getState().cards.get('card-1')).toEqual(card);
  });

  it('handles session:member:joined', () => {
    renderHook(() => useSessionRoom('session-1'));

    const participant = makePresenceState({
      userId: 'new-user',
      displayName: 'New User',
    });

    mockSocket.simulateEvent('session:member:joined', {
      participant,
    });

    expect(
      useCollaborationStore.getState().participants.get('new-user')
    ).toEqual(participant);
  });

  it('handles session:member:left', () => {
    const participant = makePresenceState({ userId: 'u1' });
    useCollaborationStore.getState().setParticipant('u1', participant);

    renderHook(() => useSessionRoom('session-1'));

    mockSocket.simulateEvent('session:member:left', { userId: 'u1' });

    expect(
      useCollaborationStore.getState().participants.has('u1')
    ).toBe(false);
  });

  it('resets collaboration state on unmount', () => {
    const lock = makeLockEntry({ cardId: 'c1' });
    useCollaborationStore.getState().setLock('c1', lock);

    const { unmount } = renderHook(() => useSessionRoom('session-1'));
    unmount();

    expect(useCollaborationStore.getState().locks.size).toBe(0);
  });

  it('leaves old room and joins new room on sessionId change', () => {
    const { rerender } = renderHook(
      ({ sessionId }) => useSessionRoom(sessionId),
      { initialProps: { sessionId: 'session-1' } }
    );

    mockSocket.clearEmittedEvents();
    rerender({ sessionId: 'session-2' });

    const events = mockSocket.getEmittedEvents();
    expect(events.some((e) => e.event === 'session:leave')).toBe(true);
    expect(events.some((e) => e.event === 'session:join')).toBe(true);
  });

  it('cleans up event handlers on unmount', () => {
    const { unmount } = renderHook(() => useSessionRoom('session-1'));
    unmount();

    // Simulate events after unmount - should not throw or update store
    const participant = makePresenceState({ userId: 'late-joiner' });
    mockSocket.simulateEvent('session:member:joined', { participant });

    expect(
      useCollaborationStore.getState().participants.has('late-joiner')
    ).toBe(false);
  });
});
