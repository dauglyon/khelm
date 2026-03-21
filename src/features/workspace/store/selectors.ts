import { useSessionStore } from './sessionStore';
import type { CardState } from './types';

/**
 * Returns the CardState for a single card by ID.
 * Returns undefined if the card does not exist.
 * Only re-renders when that specific card's state changes.
 */
export function useCard(id: string): CardState | undefined {
  return useSessionStore((state) => state.cards.get(id));
}

/**
 * Returns the card IDs in display order.
 * Only re-renders when the order array reference changes.
 */
export function useCardOrder(): string[] {
  return useSessionStore((state) => state.order);
}

/**
 * Returns the currently active (focused) card ID.
 * Only re-renders when activeCardId changes.
 */
export function useActiveCardId(): string | null {
  return useSessionStore((state) => state.activeCardId);
}

/**
 * Returns the card ID shown in detail view.
 * Only re-renders when detailCardId changes.
 */
export function useDetailCardId(): string | null {
  return useSessionStore((state) => state.detailCardId);
}

/**
 * Returns just the shortname for a card.
 * Only re-renders when that card's shortname changes, not other fields.
 */
export function useCardShortname(id: string): string | undefined {
  return useSessionStore((state) => state.cards.get(id)?.shortname);
}

/**
 * Returns true if this card has never been rendered in this session.
 * Used for enter animation gating.
 * Returns false once markRendered(id) has been called.
 */
export function useIsFirstRender(id: string): boolean {
  return useSessionStore((state) => !state.renderedCardIds.has(id));
}

/**
 * Returns stable action references from the store.
 * Actions in Zustand are stable (defined in the store creator), so
 * this hook can be used to access them without causing re-renders.
 */
export function useSessionActions() {
  return useSessionStore((state) => ({
    addCard: state.addCard,
    removeCard: state.removeCard,
    updateCard: state.updateCard,
    reorderCards: state.reorderCards,
    setActiveCard: state.setActiveCard,
    openDetail: state.openDetail,
    closeDetail: state.closeDetail,
    flushStreamBuffer: state.flushStreamBuffer,
    markRendered: state.markRendered,
  }));
}
