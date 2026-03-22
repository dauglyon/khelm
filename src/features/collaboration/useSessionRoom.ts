/**
 * Hook that joins/leaves Socket.IO session rooms and handles state snapshots.
 * Bridge between the socket transport (task 01) and the collaboration store (task 02).
 *
 * Architecture reference: collaboration.md section 2.
 */

import { useEffect } from 'react';
import { getSocket } from './socketClient';
import { useCollaborationStore } from './collaborationStore';
import { useSessionStore } from '@/features/workspace/store/sessionStore';
import type {
  SessionSnapshot,
  MemberJoinedPayload,
  MemberLeftPayload,
  LockEntry,
  PresenceState,
} from './types';
import type { CardState } from '@/features/workspace/store/types';

/**
 * Joins the given session room on mount, leaves on unmount.
 * Handles session:state snapshot, member joined/left events.
 */
export function useSessionRoom(sessionId: string): void {
  useEffect(() => {
    const socket = getSocket();

    // Handler for full state snapshot (on join/reconnect)
    const handleSessionState = (snapshot: SessionSnapshot) => {
      // Update collaboration store with locks
      const lockMap = new Map<string, LockEntry>();
      for (const lock of snapshot.locks) {
        lockMap.set(lock.cardId, lock);
      }
      useCollaborationStore.getState().setLocks(lockMap);

      // Update collaboration store with participants
      const participantMap = new Map<string, PresenceState>();
      for (const p of snapshot.participants) {
        participantMap.set(p.userId, p);
      }
      useCollaborationStore.getState().setParticipants(participantMap);

      // Update workspace store with cards
      const cardMap = new Map<string, CardState>();
      const order: string[] = [];
      for (const card of snapshot.cards) {
        cardMap.set(card.id, card);
        order.push(card.id);
      }
      useSessionStore.setState({ cards: cardMap, order });
    };

    // Handler for new member joining
    const handleMemberJoined = (payload: MemberJoinedPayload) => {
      useCollaborationStore
        .getState()
        .setParticipant(payload.participant.userId, payload.participant);
    };

    // Handler for member leaving
    const handleMemberLeft = (payload: MemberLeftPayload) => {
      useCollaborationStore
        .getState()
        .removeParticipant(payload.userId);
    };

    // Register handlers
    socket.on('session:state', handleSessionState);
    socket.on('session:member:joined', handleMemberJoined);
    socket.on('session:member:left', handleMemberLeft);

    // Join the room
    socket.emit('session:join', { sessionId });

    return () => {
      // Leave the room
      socket.emit('session:leave', { sessionId });

      // Remove handlers
      socket.off('session:state', handleSessionState);
      socket.off('session:member:joined', handleMemberJoined);
      socket.off('session:member:left', handleMemberLeft);

      // Reset collaboration state
      useCollaborationStore.getState().reset();
    };
  }, [sessionId]);
}
