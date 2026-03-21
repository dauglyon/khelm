import { useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';

/**
 * Hook that returns a function to scroll the workspace to a given card.
 * Uses the card's data-card-id attribute to find and scroll to it.
 */
export function useScrollToCard() {
  const setActiveCard = useSessionStore((s) => s.setActiveCard);

  const scrollToCard = useCallback(
    (cardId: string) => {
      setActiveCard(cardId);

      // Find the card's DOM element by data attribute
      const el = document.querySelector(`[data-card-id="${cardId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [setActiveCard]
  );

  return scrollToCard;
}
