/**
 * Card domain Zustand store.
 * Holds rich card records, per-card streaming content, and per-card chat state.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { Card, CardStatus, CardResult, CardError, Message } from './types';

// Enable Map/Set support in Immer
enableMapSet();

// ---------------------------------------------------------------------------
// Chat state shape
// ---------------------------------------------------------------------------

export interface ChatState {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface CardStoreState {
  cards: Map<string, Card>;
  streamingContent: Map<string, string>;
  chatStates: Map<string, ChatState>;
}

interface CardStoreActions {
  // Card CRUD
  setCard: (card: Card) => void;
  updateCard: (id: string, patch: Partial<Card>) => void;
  removeCard: (id: string) => void;
  setCardStatus: (id: string, status: CardStatus) => void;
  setCardResult: (id: string, result: CardResult) => void;
  setCardError: (id: string, error: CardError) => void;

  // Streaming
  appendStreamContent: (id: string, chunk: string) => void;
  finalizeStream: (id: string) => void;
  clearStreamContent: (id: string) => void;

  // Chat
  initChat: (id: string) => void;
  clearChat: (id: string) => void;
  setChatMessages: (
    id: string,
    updater: (prev: Message[]) => Message[]
  ) => void;
  setChatStreamingContent: (id: string, content: string) => void;
  setChatIsStreaming: (id: string, isStreaming: boolean) => void;
  setChatError: (id: string, error: string | null) => void;
}

type CardStore = CardStoreState & CardStoreActions;

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

export const useCardStore = create<CardStore>()(
  immer((set) => ({
    cards: new Map(),
    streamingContent: new Map(),
    chatStates: new Map(),

    // ---- Card CRUD ----
    setCard: (card) =>
      set((state) => {
        state.cards.set(card.id, card);
      }),

    updateCard: (id, patch) =>
      set((state) => {
        const card = state.cards.get(id);
        if (card) {
          Object.assign(card, patch);
          card.updatedAt = new Date().toISOString();
        }
      }),

    removeCard: (id) =>
      set((state) => {
        state.cards.delete(id);
        state.streamingContent.delete(id);
        state.chatStates.delete(id);
      }),

    setCardStatus: (id, status) =>
      set((state) => {
        const card = state.cards.get(id);
        if (card) {
          card.status = status;
          card.updatedAt = new Date().toISOString();
        }
      }),

    setCardResult: (id, result) =>
      set((state) => {
        const card = state.cards.get(id);
        if (card) {
          card.result = result;
          card.updatedAt = new Date().toISOString();
        }
      }),

    setCardError: (id, error) =>
      set((state) => {
        const card = state.cards.get(id);
        if (card) {
          card.error = error;
          card.status = 'error';
          card.updatedAt = new Date().toISOString();
        }
      }),

    // ---- Streaming ----
    appendStreamContent: (id, chunk) =>
      set((state) => {
        const existing = state.streamingContent.get(id) ?? '';
        state.streamingContent.set(id, existing + chunk);
      }),

    finalizeStream: (id) =>
      set((state) => {
        const content = state.streamingContent.get(id);
        if (content !== undefined) {
          state.streamingContent.delete(id);
        }
      }),

    clearStreamContent: (id) =>
      set((state) => {
        state.streamingContent.delete(id);
      }),

    // ---- Chat ----
    initChat: (id) =>
      set((state) => {
        if (!state.chatStates.has(id)) {
          state.chatStates.set(id, {
            messages: [],
            streamingContent: '',
            isStreaming: false,
            error: null,
          });
        }
      }),

    clearChat: (id) =>
      set((state) => {
        state.chatStates.delete(id);
      }),

    setChatMessages: (id, updater) =>
      set((state) => {
        const chat = state.chatStates.get(id);
        if (chat) {
          chat.messages = updater(chat.messages);
        }
      }),

    setChatStreamingContent: (id, content) =>
      set((state) => {
        const chat = state.chatStates.get(id);
        if (chat) {
          chat.streamingContent = content;
        }
      }),

    setChatIsStreaming: (id, isStreaming) =>
      set((state) => {
        const chat = state.chatStates.get(id);
        if (chat) {
          chat.isStreaming = isStreaming;
        }
      }),

    setChatError: (id, error) =>
      set((state) => {
        const chat = state.chatStates.get(id);
        if (chat) {
          chat.error = error;
        }
      }),
  }))
);

// ---------------------------------------------------------------------------
// External access (for SSE handlers, intervals outside React)
// ---------------------------------------------------------------------------

export const { getState: getCardState, setState: setCardState } =
  useCardStore;

// ---------------------------------------------------------------------------
// Selectors (custom hooks for render isolation)
// ---------------------------------------------------------------------------

export function useCardData(id: string): Card | undefined {
  return useCardStore((state) => state.cards.get(id));
}

export function useCardStatus(id: string): CardStatus | undefined {
  return useCardStore((state) => state.cards.get(id)?.status);
}

export function useCardResult(id: string): CardResult | null | undefined {
  return useCardStore((state) => state.cards.get(id)?.result);
}

export function useCardStreamingContent(id: string): string | undefined {
  return useCardStore((state) => state.streamingContent.get(id));
}

export function useChatState(id: string): ChatState | undefined {
  return useCardStore((state) => state.chatStates.get(id));
}
