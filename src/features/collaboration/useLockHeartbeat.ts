/**
 * Hook that manages heartbeat interval for active lock and beforeunload handler.
 *
 * Architecture reference: collaboration.md section 5.
 */

import { useEffect } from 'react';
import { getSocket } from './socketClient';
import { useCollaborationStore } from './collaborationStore';

const HEARTBEAT_INTERVAL_MS = 10_000;

/**
 * While the current user holds a lock, sends heartbeat every 10s
 * and registers a beforeunload handler to release the lock on tab close.
 */
export function useLockHeartbeat(): void {
  const myLockedCardId = useCollaborationStore(
    (state) => state.myLockedCardId
  );

  useEffect(() => {
    if (!myLockedCardId) {
      return;
    }

    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch {
      return;
    }

    // Start heartbeat interval
    const intervalId = setInterval(() => {
      socket.emit('card:lock:heartbeat', { cardId: myLockedCardId });
    }, HEARTBEAT_INTERVAL_MS);

    // beforeunload handler (best-effort lock release on tab close)
    const handleBeforeUnload = () => {
      socket.emit('card:lock:release', { cardId: myLockedCardId });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [myLockedCardId]);
}
