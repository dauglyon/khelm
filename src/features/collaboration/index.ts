// Socket client
export { connectSocket, getSocket, disconnectSocket, isSocketConnected } from './socketClient';

// Types
export type {
  LockEntry,
  PresenceState,
  SessionSnapshot,
  ServerToClientEvents,
  ClientToServerEvents,
  TypedSocket,
  CardCreatePayload,
  CardUpdatePayload,
  CardDeletePayload,
  CardReorderPayload,
  LockRequestPayload,
  LockGrantedPayload,
  LockDeniedPayload,
  LockReleasedPayload,
  LockStatePayload,
  PresenceUpdatePayload,
  PresenceSyncPayload,
  ServerErrorPayload,
} from './types';

// Store
export {
  useCollaborationStore,
  getCollaborationState,
  setCollaborationState,
  useLock,
  useIsCardLocked,
  useIsCardLockedByMe,
  useLockHolder,
  useMyLockedCardId,
  useParticipants,
  useParticipant,
  useParticipantsOnCard,
  useIsConnected,
  useIsReconnecting,
} from './collaborationStore';

// Hooks
export { useSessionRoom } from './useSessionRoom';
export { usePresenceSync } from './usePresenceSync';
export { useLockProtocol } from './useLockProtocol';
export { useLockHeartbeat } from './useLockHeartbeat';
export { useCardMutationSync } from './useCardMutationSync';
export { useAIPreemption } from './useAIPreemption';
export { useReconnectionRecovery } from './useReconnectionRecovery';
export { useCardLockGuard } from './hooks/useCardLockGuard';

// Components
export { ParticipantList } from './components/ParticipantList';
export { CardPresenceAvatars, getUserColor } from './components/CardPresenceAvatars';
export { LockBadge } from './components/LockBadge';
export { StopGeneratingButton } from './components/StopGeneratingButton';
