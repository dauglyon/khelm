import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createMockSocket } from './testing/mockSocket';
import { useCollaborationStore } from './collaborationStore';
import { makeLockEntry, resetFixtureIds } from './testing/fixtures';
import type { MockSocket } from './testing/mockSocket';

let mockSocket: MockSocket;

vi.mock('./socketClient', () => ({
  getSocket: () => mockSocket,
}));

const { useLockProtocol } = await import('./useLockProtocol');

describe('useLockProtocol', () => {
  beforeEach(() => {
    resetFixtureIds();
    mockSocket = createMockSocket();
    useCollaborationStore.getState().reset();
    useCollaborationStore.getState().setMyUserId('my-user');
  });

  it('requestLock emits card:lock:request', () => {
    const { result } = renderHook(() => useLockProtocol());

    act(() => {
      result.current.requestLock('c1');
    });

    const lastEmit = mockSocket.getLastEmit('card:lock:request');
    expect(lastEmit).toEqual([{ cardId: 'c1' }]);
  });

  it('handles card:lock:granted and updates store', () => {
    renderHook(() => useLockProtocol());

    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'my-user',
      holderName: 'Me',
    });

    mockSocket.simulateEvent('card:lock:granted', {
      cardId: 'c1',
      holder: lock,
    });

    expect(useCollaborationStore.getState().locks.get('c1')).toEqual(lock);
    expect(useCollaborationStore.getState().myLockedCardId).toBe('c1');
  });

  it('handles card:lock:granted for another user (does not set myLockedCardId)', () => {
    renderHook(() => useLockProtocol());

    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'other-user',
      holderName: 'Other',
    });

    mockSocket.simulateEvent('card:lock:granted', {
      cardId: 'c1',
      holder: lock,
    });

    expect(useCollaborationStore.getState().locks.get('c1')).toEqual(lock);
    expect(useCollaborationStore.getState().myLockedCardId).toBeNull();
  });

  it('handles card:lock:denied and calls onDenied', () => {
    const onDenied = vi.fn();
    renderHook(() => useLockProtocol(onDenied));

    const holder = makeLockEntry({
      cardId: 'c1',
      holderName: 'Alice',
    });

    mockSocket.simulateEvent('card:lock:denied', {
      cardId: 'c1',
      holder,
      reason: 'held by another user',
    });

    expect(onDenied).toHaveBeenCalledWith('Alice');
  });

  it('handles card:lock:released and clears lock', () => {
    const lock = makeLockEntry({ cardId: 'c1', holderId: 'my-user' });
    useCollaborationStore.getState().setLock('c1', lock);
    useCollaborationStore.getState().setMyLockedCardId('c1');

    renderHook(() => useLockProtocol());

    mockSocket.simulateEvent('card:lock:released', { cardId: 'c1' });

    expect(useCollaborationStore.getState().locks.has('c1')).toBe(false);
    expect(useCollaborationStore.getState().myLockedCardId).toBeNull();
  });

  it('handles card:lock:state full sync', () => {
    renderHook(() => useLockProtocol());

    const lock1 = makeLockEntry({ cardId: 'c1', holderId: 'my-user' });
    const lock2 = makeLockEntry({ cardId: 'c2', holderId: 'other' });

    mockSocket.simulateEvent('card:lock:state', {
      locks: [lock1, lock2],
    });

    expect(useCollaborationStore.getState().locks.size).toBe(2);
    expect(useCollaborationStore.getState().myLockedCardId).toBe('c1');
  });

  it('releaseLock only releases own locks', () => {
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const { result } = renderHook(() => useLockProtocol());

    act(() => {
      result.current.releaseLock('c2'); // not my lock
    });

    const events = mockSocket
      .getEmittedEvents()
      .filter((e) => e.event === 'card:lock:release');
    expect(events).toHaveLength(0);
  });

  it('releaseLock emits for own lock', () => {
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const { result } = renderHook(() => useLockProtocol());

    act(() => {
      result.current.releaseLock('c1');
    });

    const lastEmit = mockSocket.getLastEmit('card:lock:release');
    expect(lastEmit).toEqual([{ cardId: 'c1' }]);
  });

  it('cleans up event handlers on unmount', () => {
    const { unmount } = renderHook(() => useLockProtocol());
    unmount();

    const lock = makeLockEntry({ cardId: 'c1', holderId: 'my-user' });
    mockSocket.simulateEvent('card:lock:granted', {
      cardId: 'c1',
      holder: lock,
    });

    // Lock should NOT be in store after unmount
    expect(useCollaborationStore.getState().locks.has('c1')).toBe(false);
  });
});
