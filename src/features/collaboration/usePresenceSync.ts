/**
 * Hook that registers presence event handlers and reports focus changes.
 *
 * Architecture reference: collaboration.md section 4.
 */

import { useEffect, useRef, useCallback } from 'react';
import { getSocket } from './socketClient';
import { useCollaborationStore } from './collaborationStore';
import type { PresenceState, PresenceSyncPayload } from './types';

interface PresenceSyncResult {
  reportFocus: (cardId: string | null) => void;
}

/**
 * Registers handler for presence:sync events and provides a function
 * to report focus changes to the server.
 */
export function usePresenceSync(): PresenceSyncResult {
  const lastReportedRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const socket = getSocket();

    const handlePresenceSync = (payload: PresenceSyncPayload) => {
      const participantMap = new Map<string, PresenceState>();
      for (const p of payload.participants) {
        participantMap.set(p.userId, p);
      }
      useCollaborationStore.getState().setParticipants(participantMap);
    };

    socket.on('presence:sync', handlePresenceSync);

    return () => {
      socket.off('presence:sync', handlePresenceSync);
    };
  }, []);

  const reportFocus = useCallback((cardId: string | null) => {
    // Debounce: only emit if cardId differs from last reported value
    if (cardId === lastReportedRef.current) {
      return;
    }
    lastReportedRef.current = cardId;

    try {
      const socket = getSocket();
      socket.emit('presence:update', { focusedCardId: cardId });
    } catch {
      // Socket not connected; silently ignore
    }
  }, []);

  return { reportFocus };
}
