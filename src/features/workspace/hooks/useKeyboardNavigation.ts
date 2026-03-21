import { useEffect, useCallback, type RefObject } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { useCardOrder, useActiveCardId, useDetailCardId } from '../store/selectors';

export interface UseKeyboardNavigationOptions {
  /** The scroll container element ref for attaching keyboard listeners */
  containerRef: RefObject<HTMLElement | null>;
  /** Number of columns in the current layout (for ArrowLeft/Right navigation) */
  columnCount: number;
  /** Optional callback to scroll a card into view by order index */
  scrollToIndex?: (index: number) => void;
}

/**
 * Hook that handles keyboard navigation within the masonry grid.
 *
 * Key bindings:
 * - ArrowDown: next card in order
 * - ArrowUp: previous card in order
 * - ArrowRight: skip by columnCount positions forward
 * - ArrowLeft: skip by columnCount positions backward
 * - Enter: open detail view for active card
 * - Escape: close detail or clear active card
 * - Home: first card
 * - End: last card
 */
export function useKeyboardNavigation({
  containerRef,
  columnCount,
  scrollToIndex,
}: UseKeyboardNavigationOptions) {
  const order = useCardOrder();
  const activeCardId = useActiveCardId();
  const detailCardId = useDetailCardId();
  const setActiveCard = useSessionStore((s) => s.setActiveCard);
  const openDetail = useSessionStore((s) => s.openDetail);
  const closeDetail = useSessionStore((s) => s.closeDetail);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (order.length === 0) return;

      const currentIndex = activeCardId
        ? order.indexOf(activeCardId)
        : -1;

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIndex < 0) {
            nextIndex = 0;
          } else if (currentIndex < order.length - 1) {
            nextIndex = currentIndex + 1;
          } else {
            nextIndex = currentIndex; // Stay at last
          }
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex <= 0) {
            nextIndex = 0;
          } else {
            nextIndex = currentIndex - 1;
          }
          break;
        }

        case 'ArrowRight': {
          e.preventDefault();
          if (currentIndex < 0) {
            nextIndex = 0;
          } else {
            nextIndex = Math.min(
              currentIndex + columnCount,
              order.length - 1
            );
          }
          break;
        }

        case 'ArrowLeft': {
          e.preventDefault();
          if (currentIndex < 0) {
            nextIndex = 0;
          } else {
            nextIndex = Math.max(currentIndex - columnCount, 0);
          }
          break;
        }

        case 'Enter': {
          e.preventDefault();
          if (activeCardId) {
            openDetail(activeCardId);
          }
          return;
        }

        case 'Escape': {
          e.preventDefault();
          if (detailCardId) {
            closeDetail();
          } else {
            setActiveCard(null);
          }
          return;
        }

        case 'Home': {
          e.preventDefault();
          nextIndex = 0;
          break;
        }

        case 'End': {
          e.preventDefault();
          nextIndex = order.length - 1;
          break;
        }

        default:
          return;
      }

      if (nextIndex !== null && nextIndex >= 0 && nextIndex < order.length) {
        setActiveCard(order[nextIndex]);
        scrollToIndex?.(nextIndex);
      }
    },
    [
      order,
      activeCardId,
      detailCardId,
      columnCount,
      setActiveCard,
      openDetail,
      closeDetail,
      scrollToIndex,
    ]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, handleKeyDown]);
}
