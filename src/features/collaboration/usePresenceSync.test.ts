import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createMockSocket } from './testing/mockSocket';
import { useCollaborationStore } from './collaborationStore';
import { makePresenceState, resetFixtureIds } from './testing/fixtures';
import type { MockSocket } from './testing/mockSocket';

let mockSocket: MockSocket;

vi.mock('./socketClient', () => ({
  getSocket: () => mockSocket,
}));

const { usePresenceSync } = await import('./usePresenceSync');

describe('usePresenceSync', () => {
  beforeEach(() => {
    resetFixtureIds();
    mockSocket = createMockSocket();
    useCollaborationStore.getState().reset();
  });

  it('registers presence:sync handler that updates store', () => {
    renderHook(() => usePresenceSync());

    const p1 = makePresenceState({ userId: 'u1', displayName: 'Alice' });
    const p2 = makePresenceState({ userId: 'u2', displayName: 'Bob' });

    mockSocket.simulateEvent('presence:sync', {
      participants: [p1, p2],
    });

    expect(useCollaborationStore.getState().participants.get('u1')).toEqual(p1);
    expect(useCollaborationStore.getState().participants.get('u2')).toEqual(p2);
  });

  it('reportFocus emits presence:update', () => {
    const { result } = renderHook(() => usePresenceSync());

    act(() => {
      result.current.reportFocus('c1');
    });

    const lastEmit = mockSocket.getLastEmit('presence:update');
    expect(lastEmit).toEqual([{ focusedCardId: 'c1' }]);
  });

  it('reportFocus suppresses duplicate emissions', () => {
    const { result } = renderHook(() => usePresenceSync());

    act(() => {
      result.current.reportFocus('c1');
    });
    act(() => {
      result.current.reportFocus('c1');
    });

    const events = mockSocket
      .getEmittedEvents()
      .filter((e) => e.event === 'presence:update');
    expect(events).toHaveLength(1);
  });

  it('reportFocus emits when cardId changes', () => {
    const { result } = renderHook(() => usePresenceSync());

    act(() => {
      result.current.reportFocus('c1');
    });
    act(() => {
      result.current.reportFocus('c2');
    });

    const events = mockSocket
      .getEmittedEvents()
      .filter((e) => e.event === 'presence:update');
    expect(events).toHaveLength(2);
  });

  it('reportFocus emits null to clear focus', () => {
    const { result } = renderHook(() => usePresenceSync());

    act(() => {
      result.current.reportFocus('c1');
    });
    act(() => {
      result.current.reportFocus(null);
    });

    const lastEmit = mockSocket.getLastEmit('presence:update');
    expect(lastEmit).toEqual([{ focusedCardId: null }]);
  });

  it('cleans up presence:sync handler on unmount', () => {
    const { unmount } = renderHook(() => usePresenceSync());
    unmount();

    const p = makePresenceState({ userId: 'u1' });
    mockSocket.simulateEvent('presence:sync', {
      participants: [p],
    });

    expect(useCollaborationStore.getState().participants.has('u1')).toBe(false);
  });
});
