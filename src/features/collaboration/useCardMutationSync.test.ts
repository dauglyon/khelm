import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createMockSocket } from './testing/mockSocket';
import { useCollaborationStore } from './collaborationStore';
import { useSessionStore } from '@/features/workspace/store/sessionStore';
import { makeCardState, resetFixtureIds } from './testing/fixtures';
import type { MockSocket } from './testing/mockSocket';

let mockSocket: MockSocket;

vi.mock('./socketClient', () => ({
  getSocket: () => mockSocket,
}));

const { useCardMutationSync } = await import('./useCardMutationSync');

describe('useCardMutationSync', () => {
  beforeEach(() => {
    resetFixtureIds();
    mockSocket = createMockSocket();
    useCollaborationStore.getState().reset();
    useCollaborationStore.getState().setMyUserId('my-user');
    useSessionStore.setState({
      cards: new Map(),
      order: [],
      activeCardId: null,
      detailCardId: null,
      streamBuffers: new Map(),
      renderedCardIds: new Set(),
    });
  });

  it('createCard emits card:create and adds optimistic card', () => {
    const { result } = renderHook(() => useCardMutationSync());

    act(() => {
      result.current.createCard({
        type: 'note',
        shortname: 'Test Note',
        content: 'Hello',
        input: '',
      });
    });

    const lastEmit = mockSocket.getLastEmit('card:create');
    expect(lastEmit).toBeDefined();

    // Optimistic card should be in session store
    const cards = useSessionStore.getState().cards;
    expect(cards.size).toBe(1);
    const card = Array.from(cards.values())[0];
    expect(card.status).toBe('thinking');
    expect(card.shortname).toBe('Test Note');
  });

  it('card:created handler replaces temp card with server card', () => {
    const { result } = renderHook(() => useCardMutationSync());

    act(() => {
      result.current.createCard({
        type: 'note',
        shortname: 'Test Note',
        content: 'Hello',
        input: '',
      });
    });

    const serverCard = makeCardState({
      id: 'server-card-1',
      shortname: 'Test Note',
      type: 'note',
      status: 'complete',
    });

    mockSocket.simulateEvent('card:created', { card: serverCard });

    const cards = useSessionStore.getState().cards;
    expect(cards.has('server-card-1')).toBe(true);
    // Temp card should be gone (only server card remains)
    expect(cards.size).toBe(1);
  });

  it('updateCard checks lock ownership before emitting', () => {
    const card = makeCardState({ id: 'c1' });
    useSessionStore.getState().addCard(card);

    const { result } = renderHook(() => useCardMutationSync());

    // No lock held - should warn and not emit
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    act(() => {
      result.current.updateCard('c1', { content: 'updated' });
    });

    expect(warnSpy).toHaveBeenCalled();
    expect(mockSocket.getLastEmit('card:update')).toBeUndefined();

    warnSpy.mockRestore();
  });

  it('updateCard emits when lock is held', () => {
    const card = makeCardState({ id: 'c1' });
    useSessionStore.getState().addCard(card);
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const { result } = renderHook(() => useCardMutationSync());

    act(() => {
      result.current.updateCard('c1', { content: 'updated' });
    });

    const lastEmit = mockSocket.getLastEmit('card:update');
    expect(lastEmit).toEqual([
      { cardId: 'c1', changes: { content: 'updated' } },
    ]);
  });

  it('card:updated handler applies changes to workspace store', () => {
    const card = makeCardState({ id: 'c1', content: 'original' });
    useSessionStore.getState().addCard(card);

    renderHook(() => useCardMutationSync());

    mockSocket.simulateEvent('card:updated', {
      cardId: 'c1',
      changes: { content: 'from-server' },
    });

    const updated = useSessionStore.getState().cards.get('c1');
    expect(updated?.content).toBe('from-server');
  });

  it('deleteCard checks lock ownership', () => {
    const card = makeCardState({ id: 'c1' });
    useSessionStore.getState().addCard(card);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useCardMutationSync());

    act(() => {
      result.current.deleteCard('c1');
    });

    expect(warnSpy).toHaveBeenCalled();
    expect(mockSocket.getLastEmit('card:delete')).toBeUndefined();

    warnSpy.mockRestore();
  });

  it('card:deleted handler removes card from workspace store', () => {
    const card = makeCardState({ id: 'c1' });
    useSessionStore.getState().addCard(card);

    renderHook(() => useCardMutationSync());

    mockSocket.simulateEvent('card:deleted', { cardId: 'c1' });

    expect(useSessionStore.getState().cards.has('c1')).toBe(false);
  });

  it('reorderCard emits card:reorder (lock-free)', () => {
    const { result } = renderHook(() => useCardMutationSync());

    act(() => {
      result.current.reorderCard('c1', 2);
    });

    const lastEmit = mockSocket.getLastEmit('card:reorder');
    expect(lastEmit).toEqual([{ cardId: 'c1', position: 2 }]);
  });

  it('card:reordered handler updates order', () => {
    const c1 = makeCardState({ id: 'c1' });
    const c2 = makeCardState({ id: 'c2' });
    useSessionStore.getState().addCard(c1);
    useSessionStore.getState().addCard(c2);

    renderHook(() => useCardMutationSync());

    mockSocket.simulateEvent('card:reordered', {
      order: ['c2', 'c1'],
    });

    expect(useSessionStore.getState().order).toEqual(['c2', 'c1']);
  });

  it('error handler reverts optimistic update', () => {
    const card = makeCardState({ id: 'c1', content: 'original' });
    useSessionStore.getState().addCard(card);
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const { result } = renderHook(() => useCardMutationSync());

    act(() => {
      result.current.updateCard('c1', { content: 'optimistic' });
    });

    // Verify optimistic update applied
    expect(useSessionStore.getState().cards.get('c1')?.content).toBe(
      'optimistic'
    );

    // Server rejects
    mockSocket.simulateEvent('error', {
      code: 'LOCK_EXPIRED',
      message: 'Lock expired',
      cardId: 'c1',
    });

    // Should be reverted
    expect(useSessionStore.getState().cards.get('c1')?.content).toBe(
      'original'
    );
  });

  it('cleans up handlers on unmount', () => {
    const { unmount } = renderHook(() => useCardMutationSync());
    unmount();

    const card = makeCardState({ id: 'c1' });
    mockSocket.simulateEvent('card:created', { card });

    // Should not be in store after unmount
    expect(useSessionStore.getState().cards.has('c1')).toBe(false);
  });
});
