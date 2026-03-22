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

const { useAIPreemption } = await import('./useAIPreemption');

describe('useAIPreemption', () => {
  beforeEach(() => {
    resetFixtureIds();
    mockSocket = createMockSocket();
    useCollaborationStore.getState().reset();
    useCollaborationStore.getState().setMyUserId('my-user');
  });

  it('canPreempt is false when card is not locked', () => {
    const { result } = renderHook(() => useAIPreemption('c1'));
    expect(result.current.canPreempt).toBe(false);
  });

  it('canPreempt is false when locked by human', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'other-user',
      holderRole: 'human',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    const { result } = renderHook(() => useAIPreemption('c1'));
    expect(result.current.canPreempt).toBe(false);
  });

  it('canPreempt is true when locked by AI', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    const { result } = renderHook(() => useAIPreemption('c1'));
    expect(result.current.canPreempt).toBe(true);
  });

  it('preempt emits card:lock:preempt', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    const { result } = renderHook(() => useAIPreemption('c1'));

    act(() => {
      result.current.preempt();
    });

    const lastEmit = mockSocket.getLastEmit('card:lock:preempt');
    expect(lastEmit).toEqual([{ cardId: 'c1' }]);
  });

  it('isPreempting is true after preempt is called', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    const { result } = renderHook(() => useAIPreemption('c1'));

    act(() => {
      result.current.preempt();
    });

    expect(result.current.isPreempting).toBe(true);
  });

  it('isPreempting becomes false after lock is released', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    const { result } = renderHook(() => useAIPreemption('c1'));

    act(() => {
      result.current.preempt();
    });
    expect(result.current.isPreempting).toBe(true);

    act(() => {
      mockSocket.simulateEvent('card:lock:released', { cardId: 'c1' });
    });

    expect(result.current.isPreempting).toBe(false);
  });

  it('does not emit when canPreempt is false', () => {
    // No lock on card
    const { result } = renderHook(() => useAIPreemption('c1'));

    act(() => {
      result.current.preempt();
    });

    expect(mockSocket.getLastEmit('card:lock:preempt')).toBeUndefined();
  });
});
