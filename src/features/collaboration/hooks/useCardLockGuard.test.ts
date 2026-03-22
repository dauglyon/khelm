import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollaborationStore } from '../collaborationStore';
import { makeLockEntry, resetFixtureIds } from '../testing/fixtures';
import { useCardLockGuard } from './useCardLockGuard';

describe('useCardLockGuard', () => {
  beforeEach(() => {
    resetFixtureIds();
    useCollaborationStore.getState().reset();
    useCollaborationStore.getState().setMyUserId('my-user');
  });

  it('returns canEdit true when card is not locked', () => {
    const { result } = renderHook(() => useCardLockGuard('c1'));
    expect(result.current.canEdit).toBe(true);
    expect(result.current.isLocked).toBe(false);
    expect(result.current.isLockedByMe).toBe(false);
    expect(result.current.lockHolder).toBeNull();
  });

  it('returns canEdit true when locked by me', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'my-user',
      holderName: 'Me',
    });
    useCollaborationStore.getState().setLock('c1', lock);
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const { result } = renderHook(() => useCardLockGuard('c1'));
    expect(result.current.canEdit).toBe(true);
    expect(result.current.isLockedByMe).toBe(true);
  });

  it('returns canEdit false when locked by someone else', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'other-user',
      holderName: 'Alice',
      holderRole: 'human',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    const { result } = renderHook(() => useCardLockGuard('c1'));
    expect(result.current.canEdit).toBe(false);
    expect(result.current.isLocked).toBe(true);
    expect(result.current.lockHolder).toEqual({
      name: 'Alice',
      role: 'human',
    });
  });

  it('onEditAttempt calls onToast when card is locked by someone else', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'other-user',
      holderName: 'Alice',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    const onToast = vi.fn();
    const { result } = renderHook(() => useCardLockGuard('c1', onToast));

    act(() => {
      result.current.onEditAttempt();
    });

    expect(onToast).toHaveBeenCalledWith(
      'This card is being edited by Alice.'
    );
  });

  it('onEditAttempt does not call onToast when card is not locked', () => {
    const onToast = vi.fn();
    const { result } = renderHook(() => useCardLockGuard('c1', onToast));

    act(() => {
      result.current.onEditAttempt();
    });

    expect(onToast).not.toHaveBeenCalled();
  });

  it('onEditAttempt does not call onToast when locked by me', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'my-user',
      holderName: 'Me',
    });
    useCollaborationStore.getState().setLock('c1', lock);
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const onToast = vi.fn();
    const { result } = renderHook(() => useCardLockGuard('c1', onToast));

    act(() => {
      result.current.onEditAttempt();
    });

    expect(onToast).not.toHaveBeenCalled();
  });
});
