/**
 * Hook that registers lock event handlers and exposes lock actions.
 *
 * Architecture reference: collaboration.md section 5.
 */

import { useEffect, useCallback } from 'react';
import { getSocket } from './socketClient';
import { useCollaborationStore } from './collaborationStore';
import type {
  LockGrantedPayload,
  LockDeniedPayload,
  LockReleasedPayload,
  LockStatePayload,
  LockEntry,
} from './types';

interface LockProtocolResult {
  requestLock: (cardId: string) => void;
  releaseLock: (cardId: string) => void;
}

/**
 * Registers lock protocol event handlers and provides lock request/release.
 * Denied locks trigger an onDenied callback (for toast display).
 */
export function useLockProtocol(
  onDenied?: (holderName: string) => void
): LockProtocolResult {
  useEffect(() => {
    const socket = getSocket();

    const handleGranted = (payload: LockGrantedPayload) => {
      const store = useCollaborationStore.getState();
      store.setLock(payload.cardId, payload.holder);

      // Check if this grant is for the current user
      if (payload.holder.holderId === store.myUserId) {
        store.setMyLockedCardId(payload.cardId);
      }
    };

    const handleDenied = (payload: LockDeniedPayload) => {
      onDenied?.(payload.holder.holderName);
    };

    const handleReleased = (payload: LockReleasedPayload) => {
      const store = useCollaborationStore.getState();
      store.removeLock(payload.cardId);

      // If it was my lock, clear it
      if (store.myLockedCardId === payload.cardId) {
        store.setMyLockedCardId(null);
      }
    };

    const handleLockState = (payload: LockStatePayload) => {
      const lockMap = new Map<string, LockEntry>();
      for (const lock of payload.locks) {
        lockMap.set(lock.cardId, lock);
      }
      const store = useCollaborationStore.getState();
      store.setLocks(lockMap);

      // Check if any of the locks belong to the current user
      const myUserId = store.myUserId;
      if (myUserId) {
        let myLockFound = false;
        for (const lock of payload.locks) {
          if (lock.holderId === myUserId) {
            store.setMyLockedCardId(lock.cardId);
            myLockFound = true;
            break;
          }
        }
        if (!myLockFound) {
          store.setMyLockedCardId(null);
        }
      }
    };

    socket.on('card:lock:granted', handleGranted);
    socket.on('card:lock:denied', handleDenied);
    socket.on('card:lock:released', handleReleased);
    socket.on('card:lock:state', handleLockState);

    return () => {
      socket.off('card:lock:granted', handleGranted);
      socket.off('card:lock:denied', handleDenied);
      socket.off('card:lock:released', handleReleased);
      socket.off('card:lock:state', handleLockState);
    };
  }, [onDenied]);

  const requestLock = useCallback((cardId: string) => {
    const socket = getSocket();
    socket.emit('card:lock:request', { cardId });
  }, []);

  const releaseLock = useCallback((cardId: string) => {
    const store = useCollaborationStore.getState();
    // Only release own locks
    if (store.myLockedCardId !== cardId) {
      return;
    }
    const socket = getSocket();
    socket.emit('card:lock:release', { cardId });
  }, []);

  return { requestLock, releaseLock };
}
