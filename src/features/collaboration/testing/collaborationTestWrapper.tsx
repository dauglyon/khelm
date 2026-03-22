/**
 * React test wrapper for collaboration features.
 * Sets up stores with provided initial state and injects mock socket.
 */

import { type ReactNode, useEffect } from 'react';
import { useCollaborationStore } from '../collaborationStore';
import { useSessionStore } from '@/features/workspace/store/sessionStore';
import type { LockEntry, PresenceState } from '../types';
import type { CardState } from '@/features/workspace/store/types';

export interface CollaborationTestWrapperProps {
  children: ReactNode;
  initialLocks?: LockEntry[];
  initialParticipants?: PresenceState[];
  initialCards?: CardState[];
  myUserId?: string;
  myLockedCardId?: string | null;
  isConnected?: boolean;
}

export function CollaborationTestWrapper({
  children,
  initialLocks = [],
  initialParticipants = [],
  initialCards = [],
  myUserId = 'test-user',
  myLockedCardId = null,
  isConnected = true,
}: CollaborationTestWrapperProps) {
  useEffect(() => {
    // Set up collaboration store
    const lockMap = new Map<string, LockEntry>();
    for (const lock of initialLocks) {
      lockMap.set(lock.cardId, lock);
    }

    const participantMap = new Map<string, PresenceState>();
    for (const p of initialParticipants) {
      participantMap.set(p.userId, p);
    }

    useCollaborationStore.setState({
      locks: lockMap,
      participants: participantMap,
      myUserId,
      myLockedCardId,
      isConnected,
      isReconnecting: false,
      pendingEdits: new Map(),
    });

    // Set up workspace store
    const cardMap = new Map<string, CardState>();
    const order: string[] = [];
    for (const card of initialCards) {
      cardMap.set(card.id, card);
      order.push(card.id);
    }

    useSessionStore.setState({
      cards: cardMap,
      order,
    });

    // Cleanup: reset stores
    return () => {
      useCollaborationStore.getState().reset();
      useSessionStore.setState({
        cards: new Map(),
        order: [],
        activeCardId: null,
        detailCardId: null,
        streamBuffers: new Map(),
        renderedCardIds: new Set(),
      });
    };
  }, [
    initialLocks,
    initialParticipants,
    initialCards,
    myUserId,
    myLockedCardId,
    isConnected,
  ]);

  return <>{children}</>;
}
