/**
 * Hook that registers card mutation event handlers and exposes mutation actions.
 * All card mutations flow through socket events for server-authoritative state.
 *
 * Architecture reference: collaboration.md section 3.
 */

import { useEffect, useCallback, useRef } from 'react';
import { getSocket } from './socketClient';
import { useCollaborationStore } from './collaborationStore';
import { useSessionStore } from '@/features/workspace/store/sessionStore';
import type {
  CardCreatePayload,
  CardCreatedPayload,
  CardUpdatedPayload,
  CardDeletedPayload,
  CardReorderedPayload,
  ServerErrorPayload,
} from './types';
import type { CardState } from '@/features/workspace/store/types';

interface CardMutationSyncResult {
  createCard: (data: CardCreatePayload) => void;
  updateCard: (cardId: string, changes: Partial<CardState>) => void;
  deleteCard: (cardId: string) => void;
  reorderCard: (cardId: string, position: number) => void;
}

let tempIdCounter = 0;

/**
 * Registers card mutation broadcast handlers and provides mutation actions.
 */
export function useCardMutationSync(): CardMutationSyncResult {
  // Map of temporary IDs to their original state (for revert on error)
  const pendingCreatesRef = useRef<Map<string, string>>(new Map());
  // Map of cardId -> previous state for revert
  const pendingUpdatesRef = useRef<Map<string, CardState>>(new Map());
  const pendingDeletesRef = useRef<Map<string, CardState>>(new Map());

  useEffect(() => {
    const socket = getSocket();

    const handleCreated = (payload: CardCreatedPayload) => {
      const sessionStore = useSessionStore.getState();

      // Find and replace temp ID if we have one pending
      for (const [tempId] of pendingCreatesRef.current) {
        // Remove the temp card and add the real one
        sessionStore.removeCard(tempId);
        pendingCreatesRef.current.delete(tempId);
        break;
      }

      sessionStore.addCard(payload.card);
    };

    const handleUpdated = (payload: CardUpdatedPayload) => {
      const sessionStore = useSessionStore.getState();
      sessionStore.updateCard(payload.cardId, payload.changes);
      pendingUpdatesRef.current.delete(payload.cardId);
    };

    const handleDeleted = (payload: CardDeletedPayload) => {
      const sessionStore = useSessionStore.getState();
      sessionStore.removeCard(payload.cardId);
      pendingDeletesRef.current.delete(payload.cardId);
    };

    const handleReordered = (payload: CardReorderedPayload) => {
      // Apply server-resolved order directly via Zustand's setState
      useSessionStore.setState({ order: payload.order });
    };

    const handleError = (payload: ServerErrorPayload) => {
      // Revert optimistic updates on server rejection
      if (payload.cardId) {
        const sessionStore = useSessionStore.getState();

        // Revert pending update
        const prevState = pendingUpdatesRef.current.get(payload.cardId);
        if (prevState) {
          sessionStore.updateCard(payload.cardId, prevState);
          pendingUpdatesRef.current.delete(payload.cardId);
        }

        // Revert pending delete (restore card)
        const deletedCard = pendingDeletesRef.current.get(payload.cardId);
        if (deletedCard) {
          sessionStore.addCard(deletedCard);
          pendingDeletesRef.current.delete(payload.cardId);
        }

        // Revert pending create (remove temp card)
        if (pendingCreatesRef.current.has(payload.cardId)) {
          sessionStore.removeCard(payload.cardId);
          pendingCreatesRef.current.delete(payload.cardId);
        }
      }
    };

    socket.on('card:created', handleCreated);
    socket.on('card:updated', handleUpdated);
    socket.on('card:deleted', handleDeleted);
    socket.on('card:reordered', handleReordered);
    socket.on('error', handleError);

    return () => {
      socket.off('card:created', handleCreated);
      socket.off('card:updated', handleUpdated);
      socket.off('card:deleted', handleDeleted);
      socket.off('card:reordered', handleReordered);
      socket.off('error', handleError);
    };
  }, []);

  const createCard = useCallback((data: CardCreatePayload) => {
    const socket = getSocket();
    const tempId = `temp-${++tempIdCounter}`;

    // Optimistic: add card in 'thinking' status with temp ID
    const tempCard: CardState = {
      id: tempId,
      shortname: data.shortname,
      type: data.type,
      status: 'thinking',
      content: data.content,
      input: data.input,
      references: data.references ?? [],
      referencedBy: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    useSessionStore.getState().addCard(tempCard);
    pendingCreatesRef.current.set(tempId, tempId);

    socket.emit('card:create', data);
  }, []);

  const updateCard = useCallback(
    (cardId: string, changes: Partial<CardState>) => {
      const store = useCollaborationStore.getState();

      // Client-side pre-check: must hold lock
      if (store.myLockedCardId !== cardId) {
        console.warn(
          `Cannot update card ${cardId}: lock not held`
        );
        return;
      }

      const sessionStore = useSessionStore.getState();
      const currentCard = sessionStore.cards.get(cardId);

      // Save current state for potential revert
      if (currentCard) {
        pendingUpdatesRef.current.set(cardId, { ...currentCard });
      }

      // Optimistic update
      sessionStore.updateCard(cardId, changes);

      const socket = getSocket();
      socket.emit('card:update', { cardId, changes });
    },
    []
  );

  const deleteCard = useCallback((cardId: string) => {
    const store = useCollaborationStore.getState();

    // Client-side pre-check: must hold lock
    if (store.myLockedCardId !== cardId) {
      console.warn(
        `Cannot delete card ${cardId}: lock not held`
      );
      return;
    }

    const sessionStore = useSessionStore.getState();
    const currentCard = sessionStore.cards.get(cardId);

    // Save current state for potential revert
    if (currentCard) {
      pendingDeletesRef.current.set(cardId, { ...currentCard });
    }

    // Optimistic delete
    sessionStore.removeCard(cardId);

    const socket = getSocket();
    socket.emit('card:delete', { cardId });
  }, []);

  const reorderCard = useCallback(
    (cardId: string, position: number) => {
      const socket = getSocket();
      // Lock-free per architecture
      socket.emit('card:reorder', { cardId, position });
    },
    []
  );

  return { createCard, updateCard, deleteCard, reorderCard };
}
