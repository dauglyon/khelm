/**
 * Hook for AI preemption ("Stop generating") flow.
 * Allows users to interrupt AI mid-stream and take over a card.
 *
 * Architecture reference: collaboration.md section 8.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getSocket } from './socketClient';
import { useLock, useCollaborationStore } from './collaborationStore';

interface AIPreemptionResult {
  canPreempt: boolean;
  preempt: () => void;
  isPreempting: boolean;
}

/**
 * Provides AI preemption controls for a specific card.
 * canPreempt is true only when the card is locked by an AI participant.
 */
export function useAIPreemption(cardId: string): AIPreemptionResult {
  const lock = useLock(cardId);
  const [isPreempting, setIsPreempting] = useState(false);
  const cardIdRef = useRef(cardId);
  cardIdRef.current = cardId;

  const canPreempt = lock?.holderRole === 'ai' && !isPreempting;

  // Listen for lock:granted which signals preemption is complete
  useEffect(() => {
    if (!isPreempting) return;

    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch {
      setIsPreempting(false);
      return;
    }

    const handleGranted = () => {
      const myUserId = useCollaborationStore.getState().myUserId;
      const currentLock = useCollaborationStore
        .getState()
        .locks.get(cardIdRef.current);

      // Preemption is complete when the lock holder changes (AI released)
      if (!currentLock || currentLock.holderId === myUserId) {
        setIsPreempting(false);
      }
    };

    const handleReleased = () => {
      // Lock was released (AI's lock gone)
      setIsPreempting(false);
    };

    socket.on('card:lock:granted', handleGranted);
    socket.on('card:lock:released', handleReleased);

    return () => {
      socket.off('card:lock:granted', handleGranted);
      socket.off('card:lock:released', handleReleased);
    };
  }, [isPreempting]);

  const preempt = useCallback(() => {
    if (!canPreempt) return;

    setIsPreempting(true);

    try {
      const socket = getSocket();
      socket.emit('card:lock:preempt', { cardId: cardIdRef.current });
    } catch {
      setIsPreempting(false);
    }
  }, [canPreempt]);

  return { canPreempt, preempt, isPreempting };
}
