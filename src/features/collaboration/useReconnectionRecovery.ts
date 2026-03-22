/**
 * Hook that handles reconnection recovery: snapshot reconciliation,
 * lost-lock detection, and pending edit preservation.
 *
 * Architecture reference: collaboration.md sections 1 and 5.
 */

import { useEffect, useRef, useCallback } from 'react';
import { getSocket } from './socketClient';
import { useCollaborationStore } from './collaborationStore';
import type { LockStatePayload } from './types';
import type { CardState } from '@/features/workspace/store/types';

interface ReconnectionRecoveryOptions {
  sessionId: string;
  onLostLock?: (cardId: string, message: string) => void;
  onReconnected?: () => void;
}

/**
 * Monitors socket reconnection events and handles:
 * 1. Re-joining the session room
 * 2. Detecting lost locks
 * 3. Preserving unsaved edits
 * 4. Offering re-acquire flow
 */
export function useReconnectionRecovery({
  sessionId,
  onLostLock,
  onReconnected,
}: ReconnectionRecoveryOptions): {
  reacquireAndApply: (cardId: string) => void;
} {
  const prevLockedCardRef = useRef<string | null>(null);
  const prevLockedCardChangesRef = useRef<Partial<CardState> | null>(null);

  // Track the current locked card for comparison after reconnect
  useEffect(() => {
    const unsubscribe = useCollaborationStore.subscribe((state) => {
      if (state.myLockedCardId) {
        prevLockedCardRef.current = state.myLockedCardId;
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch {
      return;
    }

    // Detect disconnect
    const handleDisconnect = () => {
      const store = useCollaborationStore.getState();
      prevLockedCardRef.current = store.myLockedCardId;
      store.setConnected(false);
      store.setReconnecting(true);
    };

    // Handle reconnect (Socket.IO fires 'connect' on reconnect too)
    const handleConnect = () => {
      const store = useCollaborationStore.getState();

      if (!store.isReconnecting) {
        // Initial connect, not a reconnect
        store.setConnected(true);
        return;
      }

      store.setConnected(true);

      // Re-join the session room
      socket.emit('session:join', { sessionId });

      // session:state handler (task 03) will populate the stores.
      // We check for lost locks when lock:state arrives.
    };

    // Check for lost locks when lock state arrives after reconnect
    const handleLockState = (payload: LockStatePayload) => {
      const store = useCollaborationStore.getState();

      if (!store.isReconnecting) return;

      const prevCardId = prevLockedCardRef.current;

      if (prevCardId) {
        // Check if our lock still exists
        const myUserId = store.myUserId;
        const stillHeld = payload.locks.some(
          (l) => l.cardId === prevCardId && l.holderId === myUserId
        );

        if (!stillHeld) {
          // Lock was lost during disconnection
          // Preserve pending edits
          const pendingEdit = prevLockedCardChangesRef.current;
          if (pendingEdit) {
            store.setPendingEdit(prevCardId, pendingEdit);
          }

          store.setMyLockedCardId(null);

          onLostLock?.(
            prevCardId,
            'Connection interrupted. Your lock was released.'
          );
        }
      }

      prevLockedCardRef.current = null;
      prevLockedCardChangesRef.current = null;

      store.setReconnecting(false);
      onReconnected?.();
    };

    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);
    socket.on('card:lock:state', handleLockState);

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
      socket.off('card:lock:state', handleLockState);
    };
  }, [sessionId, onLostLock, onReconnected]);

  const reacquireAndApply = useCallback(
    (cardId: string) => {
      try {
        const socket = getSocket();
        const store = useCollaborationStore.getState();
        const pendingEdit = store.getPendingEdit(cardId);

        // Request the lock
        socket.emit('card:lock:request', { cardId });

        // If we get the lock and have pending edits, apply them
        if (pendingEdit) {
          // The lock:granted handler will fire, then we apply the update
          const handleGranted = (payload: {
            cardId: string;
            holder: { holderId: string };
          }) => {
            if (
              payload.cardId === cardId &&
              payload.holder.holderId === store.myUserId
            ) {
              // Apply pending edits
              socket.emit('card:update', {
                cardId,
                changes: pendingEdit,
              });
              store.clearPendingEdit(cardId);
              socket.off('card:lock:granted', handleGranted);
            }
          };

          socket.on('card:lock:granted', handleGranted);
        }
      } catch {
        // Socket not connected
      }
    },
    []
  );

  return { reacquireAndApply };
}
