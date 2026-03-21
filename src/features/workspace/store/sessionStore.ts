import { create } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';
import type { CardState, SessionStore } from './types';

/**
 * Creates the session store state creator function.
 * Extracted so it can be shared between the React-bound and vanilla stores.
 */
function createSessionSlice(
  set: (
    fn: (state: SessionStore) => Partial<SessionStore>,
    replace?: boolean,
    actionName?: string
  ) => void,
  _get: () => SessionStore
): SessionStore {
  return {
    // State
    cards: new Map<string, CardState>(),
    order: [],
    activeCardId: null,
    detailCardId: null,
    streamBuffers: new Map<string, string>(),
    renderedCardIds: new Set<string>(),

    // Actions
    addCard: (card: CardState) =>
      set(
        (state) => {
          const nextCards = new Map(state.cards);
          nextCards.set(card.id, card);
          return {
            cards: nextCards,
            order: [...state.order, card.id],
          };
        },
        false,
        'addCard'
      ),

    removeCard: (id: string) =>
      set(
        (state) => {
          const removedCard = state.cards.get(id);
          const nextCards = new Map(state.cards);
          nextCards.delete(id);

          // Clean up references on other cards
          if (removedCard) {
            // Cards that this card referenced: remove this card from their referencedBy
            for (const refId of removedCard.references) {
              const refCard = nextCards.get(refId);
              if (refCard) {
                nextCards.set(refId, {
                  ...refCard,
                  referencedBy: refCard.referencedBy.filter((r) => r !== id),
                });
              }
            }
            // Cards that referenced this card: remove this card from their references
            for (const refById of removedCard.referencedBy) {
              const refCard = nextCards.get(refById);
              if (refCard) {
                nextCards.set(refById, {
                  ...refCard,
                  references: refCard.references.filter((r) => r !== id),
                });
              }
            }
          }

          const nextStreamBuffers = new Map(state.streamBuffers);
          nextStreamBuffers.delete(id);

          const nextRenderedCardIds = new Set(state.renderedCardIds);
          nextRenderedCardIds.delete(id);

          return {
            cards: nextCards,
            order: state.order.filter((o) => o !== id),
            streamBuffers: nextStreamBuffers,
            renderedCardIds: nextRenderedCardIds,
            // Clear active/detail if they point to the removed card
            activeCardId: state.activeCardId === id ? null : state.activeCardId,
            detailCardId: state.detailCardId === id ? null : state.detailCardId,
          };
        },
        false,
        'removeCard'
      ),

    updateCard: (id: string, patch: Partial<CardState>) =>
      set(
        (state) => {
          const existing = state.cards.get(id);
          if (!existing) return {};
          const nextCards = new Map(state.cards);
          nextCards.set(id, { ...existing, ...patch });
          return { cards: nextCards };
        },
        false,
        'updateCard'
      ),

    reorderCards: (fromIndex: number, toIndex: number) =>
      set(
        (state) => {
          const nextOrder = [...state.order];
          const [moved] = nextOrder.splice(fromIndex, 1);
          nextOrder.splice(toIndex, 0, moved);
          return { order: nextOrder };
        },
        false,
        'reorderCards'
      ),

    setActiveCard: (id: string | null) =>
      set(() => ({ activeCardId: id }), false, 'setActiveCard'),

    openDetail: (id: string) =>
      set(() => ({ detailCardId: id }), false, 'openDetail'),

    closeDetail: () =>
      set(() => ({ detailCardId: null }), false, 'closeDetail'),

    flushStreamBuffer: (id: string) =>
      set(
        (state) => {
          const buffer = state.streamBuffers.get(id);
          if (!buffer) return {};
          const card = state.cards.get(id);
          if (!card) return {};

          const nextCards = new Map(state.cards);
          nextCards.set(id, {
            ...card,
            content: card.content + buffer,
          });

          const nextStreamBuffers = new Map(state.streamBuffers);
          nextStreamBuffers.delete(id);

          return {
            cards: nextCards,
            streamBuffers: nextStreamBuffers,
          };
        },
        false,
        'flushStreamBuffer'
      ),

    markRendered: (id: string) =>
      set(
        (state) => {
          const nextRenderedCardIds = new Set(state.renderedCardIds);
          nextRenderedCardIds.add(id);
          return { renderedCardIds: nextRenderedCardIds };
        },
        false,
        'markRendered'
      ),
  };
}

/**
 * React-bound Zustand store for use in components via hooks.
 */
export const useSessionStore = create<SessionStore>()(
  devtools(
    (set, get) =>
      createSessionSlice(
        set as (
          fn: (state: SessionStore) => Partial<SessionStore>,
          replace?: boolean,
          actionName?: string
        ) => void,
        get
      ),
    { name: 'SessionStore', enabled: import.meta.env?.DEV ?? false }
  )
);

/**
 * Vanilla Zustand store for use outside React (SSE handlers, WebSocket listeners).
 * Supports getState() and setState() without hooks.
 */
export const sessionVanillaStore = createStore<SessionStore>()(
  devtools(
    (set, get) =>
      createSessionSlice(
        set as (
          fn: (state: SessionStore) => Partial<SessionStore>,
          replace?: boolean,
          actionName?: string
        ) => void,
        get
      ),
    { name: 'SessionStore (vanilla)', enabled: import.meta.env?.DEV ?? false }
  )
);
