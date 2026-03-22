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

const { useReconnectionRecovery } = await import('./useReconnectionRecovery');

describe('useReconnectionRecovery', () => {
  beforeEach(() => {
    resetFixtureIds();
    mockSocket = createMockSocket();
    mockSocket.connect();
    useCollaborationStore.getState().reset();
    useCollaborationStore.getState().setMyUserId('my-user');
    useCollaborationStore.getState().setConnected(true);
  });

  it('sets isReconnecting on disconnect', () => {
    renderHook(() =>
      useReconnectionRecovery({ sessionId: 'session-1' })
    );

    act(() => {
      mockSocket.simulateDisconnect();
    });

    expect(useCollaborationStore.getState().isConnected).toBe(false);
    expect(useCollaborationStore.getState().isReconnecting).toBe(true);
  });

  it('re-joins session on reconnect', () => {
    renderHook(() =>
      useReconnectionRecovery({ sessionId: 'session-1' })
    );

    // Disconnect first
    act(() => {
      mockSocket.simulateDisconnect();
    });

    mockSocket.clearEmittedEvents();

    // Reconnect
    act(() => {
      mockSocket.simulateReconnect();
    });

    const joinEmit = mockSocket.getLastEmit('session:join');
    expect(joinEmit).toEqual([{ sessionId: 'session-1' }]);
  });

  it('detects lost lock and calls onLostLock', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'my-user',
      holderName: 'Me',
    });
    useCollaborationStore.getState().setLock('c1', lock);
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const onLostLock = vi.fn();
    renderHook(() =>
      useReconnectionRecovery({
        sessionId: 'session-1',
        onLostLock,
      })
    );

    // Disconnect
    act(() => {
      mockSocket.simulateDisconnect();
    });

    // Reconnect
    act(() => {
      mockSocket.simulateReconnect();
    });

    // Server sends lock state without our lock
    act(() => {
      mockSocket.simulateEvent('card:lock:state', {
        locks: [], // our lock is gone
      });
    });

    expect(onLostLock).toHaveBeenCalledWith(
      'c1',
      'Connection interrupted. Your lock was released.'
    );
    expect(useCollaborationStore.getState().myLockedCardId).toBeNull();
  });

  it('does not call onLostLock if lock is still held', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'my-user',
      holderName: 'Me',
    });
    useCollaborationStore.getState().setLock('c1', lock);
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const onLostLock = vi.fn();
    renderHook(() =>
      useReconnectionRecovery({
        sessionId: 'session-1',
        onLostLock,
      })
    );

    act(() => {
      mockSocket.simulateDisconnect();
    });

    act(() => {
      mockSocket.simulateReconnect();
    });

    // Server sends lock state WITH our lock
    act(() => {
      mockSocket.simulateEvent('card:lock:state', {
        locks: [lock],
      });
    });

    expect(onLostLock).not.toHaveBeenCalled();
  });

  it('calls onReconnected after recovery', () => {
    const onReconnected = vi.fn();
    renderHook(() =>
      useReconnectionRecovery({
        sessionId: 'session-1',
        onReconnected,
      })
    );

    act(() => {
      mockSocket.simulateDisconnect();
    });

    act(() => {
      mockSocket.simulateReconnect();
    });

    act(() => {
      mockSocket.simulateEvent('card:lock:state', { locks: [] });
    });

    expect(onReconnected).toHaveBeenCalled();
    expect(useCollaborationStore.getState().isReconnecting).toBe(false);
  });

  it('reacquireAndApply requests lock and applies pending edits', () => {
    useCollaborationStore
      .getState()
      .setPendingEdit('c1', { content: 'unsaved' });

    const { result } = renderHook(() =>
      useReconnectionRecovery({ sessionId: 'session-1' })
    );

    act(() => {
      result.current.reacquireAndApply('c1');
    });

    const lockRequest = mockSocket.getLastEmit('card:lock:request');
    expect(lockRequest).toEqual([{ cardId: 'c1' }]);
  });

  it('sets isConnected true on initial connect (not reconnect)', () => {
    useCollaborationStore.getState().setConnected(false);
    useCollaborationStore.getState().setReconnecting(false);

    renderHook(() =>
      useReconnectionRecovery({ sessionId: 'session-1' })
    );

    act(() => {
      mockSocket.simulateEvent('connect');
    });

    expect(useCollaborationStore.getState().isConnected).toBe(true);
    expect(useCollaborationStore.getState().isReconnecting).toBe(false);
  });

  it('cleans up handlers on unmount', () => {
    const onLostLock = vi.fn();
    const { unmount } = renderHook(() =>
      useReconnectionRecovery({
        sessionId: 'session-1',
        onLostLock,
      })
    );
    unmount();

    act(() => {
      mockSocket.simulateDisconnect();
    });

    // isReconnecting should not change after unmount
    // (handlers were removed)
    expect(useCollaborationStore.getState().isReconnecting).toBe(false);
  });
});
