import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createMockSocket } from './testing/mockSocket';
import { useCollaborationStore } from './collaborationStore';
import { resetFixtureIds } from './testing/fixtures';
import type { MockSocket } from './testing/mockSocket';

let mockSocket: MockSocket;

vi.mock('./socketClient', () => ({
  getSocket: () => mockSocket,
}));

const { useLockHeartbeat } = await import('./useLockHeartbeat');

describe('useLockHeartbeat', () => {
  beforeEach(() => {
    resetFixtureIds();
    mockSocket = createMockSocket();
    useCollaborationStore.getState().reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not emit heartbeat when no lock is held', () => {
    renderHook(() => useLockHeartbeat());

    vi.advanceTimersByTime(15_000);

    const heartbeats = mockSocket
      .getEmittedEvents()
      .filter((e) => e.event === 'card:lock:heartbeat');
    expect(heartbeats).toHaveLength(0);
  });

  it('starts heartbeat interval when myLockedCardId is set', () => {
    renderHook(() => useLockHeartbeat());

    act(() => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
    });

    vi.advanceTimersByTime(10_000);

    const heartbeats = mockSocket
      .getEmittedEvents()
      .filter((e) => e.event === 'card:lock:heartbeat');
    expect(heartbeats).toHaveLength(1);
    expect(heartbeats[0].args).toEqual([{ cardId: 'c1' }]);
  });

  it('sends heartbeat every 10 seconds', () => {
    renderHook(() => useLockHeartbeat());

    act(() => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
    });

    vi.advanceTimersByTime(30_000);

    const heartbeats = mockSocket
      .getEmittedEvents()
      .filter((e) => e.event === 'card:lock:heartbeat');
    expect(heartbeats).toHaveLength(3);
  });

  it('stops heartbeat when myLockedCardId becomes null', () => {
    renderHook(() => useLockHeartbeat());

    act(() => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
    });

    vi.advanceTimersByTime(10_000);
    expect(
      mockSocket
        .getEmittedEvents()
        .filter((e) => e.event === 'card:lock:heartbeat')
    ).toHaveLength(1);

    act(() => {
      useCollaborationStore.getState().setMyLockedCardId(null);
    });

    mockSocket.clearEmittedEvents();
    vi.advanceTimersByTime(20_000);

    const heartbeats = mockSocket
      .getEmittedEvents()
      .filter((e) => e.event === 'card:lock:heartbeat');
    expect(heartbeats).toHaveLength(0);
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = renderHook(() => useLockHeartbeat());

    act(() => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
    });

    unmount();
    mockSocket.clearEmittedEvents();
    vi.advanceTimersByTime(30_000);

    const heartbeats = mockSocket
      .getEmittedEvents()
      .filter((e) => e.event === 'card:lock:heartbeat');
    expect(heartbeats).toHaveLength(0);
  });

  it('registers beforeunload handler when lock is held', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useLockHeartbeat());

    act(() => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
    });

    expect(addSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );

    addSpy.mockRestore();
  });

  it('removes beforeunload handler when lock is released', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    renderHook(() => useLockHeartbeat());

    act(() => {
      useCollaborationStore.getState().setMyLockedCardId('c1');
    });

    act(() => {
      useCollaborationStore.getState().setMyLockedCardId(null);
    });

    expect(removeSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );

    removeSpy.mockRestore();
  });
});
