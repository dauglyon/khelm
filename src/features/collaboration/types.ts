/**
 * Shared TypeScript types for all Socket.IO collaboration events and payloads.
 * Architecture reference: collaboration.md
 */

import type { CardState } from '@/features/workspace/store/types';

// ---------------------------------------------------------------------------
// Lock types
// ---------------------------------------------------------------------------

export interface LockEntry {
  cardId: string;
  holderId: string;
  holderName: string;
  holderRole: 'human' | 'ai';
  acquiredAt: number;
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// Presence types
// ---------------------------------------------------------------------------

export interface PresenceState {
  userId: string;
  displayName: string;
  avatarUrl: string;
  status: 'online' | 'idle' | 'offline';
  focusedCardId: string | null;
  role: 'human' | 'ai';
}

// ---------------------------------------------------------------------------
// Session snapshot
// ---------------------------------------------------------------------------

export interface SessionSnapshot {
  cards: CardState[];
  locks: LockEntry[];
  participants: PresenceState[];
}

// ---------------------------------------------------------------------------
// Event payloads
// ---------------------------------------------------------------------------

export interface SessionJoinPayload {
  sessionId: string;
}

export interface SessionLeavePayload {
  sessionId: string;
}

export interface MemberJoinedPayload {
  participant: PresenceState;
}

export interface MemberLeftPayload {
  userId: string;
}

export interface CardCreatePayload {
  type: CardState['type'];
  shortname: string;
  content: string;
  input: string;
  references?: string[];
}

export interface CardUpdatePayload {
  cardId: string;
  changes: Partial<CardState>;
}

export interface CardDeletePayload {
  cardId: string;
}

export interface CardReorderPayload {
  cardId: string;
  position: number;
}

export interface CardCreatedPayload {
  card: CardState;
}

export interface CardUpdatedPayload {
  cardId: string;
  changes: Partial<CardState>;
}

export interface CardDeletedPayload {
  cardId: string;
}

export interface CardReorderedPayload {
  order: string[];
}

export interface LockRequestPayload {
  cardId: string;
}

export interface LockGrantedPayload {
  cardId: string;
  holder: LockEntry;
}

export interface LockDeniedPayload {
  cardId: string;
  holder: LockEntry;
  reason: string;
}

export interface LockReleasedPayload {
  cardId: string;
}

export interface LockHeartbeatPayload {
  cardId: string;
}

export interface LockPreemptPayload {
  cardId: string;
}

export interface LockStatePayload {
  locks: LockEntry[];
}

export interface PresenceUpdatePayload {
  focusedCardId: string | null;
}

export interface PresenceSyncPayload {
  participants: PresenceState[];
}

export interface ChatSendPayload {
  message: string;
}

export interface ChatMessagePayload {
  id: string;
  userId: string;
  message: string;
  timestamp: number;
}

export interface ServerErrorPayload {
  code: string;
  message: string;
  cardId?: string;
}

// ---------------------------------------------------------------------------
// Socket.IO typed event interfaces
// ---------------------------------------------------------------------------

export interface ServerToClientEvents {
  'session:state': (snapshot: SessionSnapshot) => void;
  'session:member:joined': (payload: MemberJoinedPayload) => void;
  'session:member:left': (payload: MemberLeftPayload) => void;
  'card:created': (payload: CardCreatedPayload) => void;
  'card:updated': (payload: CardUpdatedPayload) => void;
  'card:deleted': (payload: CardDeletedPayload) => void;
  'card:reordered': (payload: CardReorderedPayload) => void;
  'card:lock:granted': (payload: LockGrantedPayload) => void;
  'card:lock:denied': (payload: LockDeniedPayload) => void;
  'card:lock:released': (payload: LockReleasedPayload) => void;
  'card:lock:state': (payload: LockStatePayload) => void;
  'presence:sync': (payload: PresenceSyncPayload) => void;
  'chat:message': (payload: ChatMessagePayload) => void;
  error: (payload: ServerErrorPayload) => void;
}

export interface ClientToServerEvents {
  'session:join': (payload: SessionJoinPayload) => void;
  'session:leave': (payload: SessionLeavePayload) => void;
  'card:create': (payload: CardCreatePayload) => void;
  'card:update': (payload: CardUpdatePayload) => void;
  'card:delete': (payload: CardDeletePayload) => void;
  'card:reorder': (payload: CardReorderPayload) => void;
  'card:lock:request': (payload: LockRequestPayload) => void;
  'card:lock:release': (payload: LockRequestPayload) => void;
  'card:lock:heartbeat': (payload: LockHeartbeatPayload) => void;
  'card:lock:preempt': (payload: LockPreemptPayload) => void;
  'presence:update': (payload: PresenceUpdatePayload) => void;
  'chat:send': (payload: ChatSendPayload) => void;
}

export type TypedSocket = import('socket.io-client').Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
