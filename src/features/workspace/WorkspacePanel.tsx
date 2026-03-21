import { useRef, useCallback, useState, useEffect, type ReactNode } from 'react';
import { useCardOrder, useCard } from './store/selectors';
import { useSessionStore } from './store/sessionStore';
import { useColumnCount } from './hooks/useColumnCount';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { MasonryGrid, type MasonryGridHandle } from './MasonryGrid';
import { CardContainer } from './CardContainer';
import { DetailOverlay } from './DetailOverlay';

export interface WorkspacePanelProps {
  /** Optional render callback for card content (from card domain) */
  renderCard?: (cardId: string) => ReactNode;
  /** Optional render callback for detail content (from card domain) */
  renderDetail?: (cardId: string) => ReactNode;
}

/** Default placeholder when card domain is not yet integrated */
function DefaultCardPlaceholder({ cardId }: { cardId: string }) {
  const card = useCard(cardId);
  if (!card) return <div>Loading...</div>;
  return (
    <div
      style={{
        padding: '16px',
        minHeight: '100px',
        backgroundColor: 'var(--surface, #F9FAF7)',
        borderRadius: '8px',
        border: '1px solid var(--border, #D5DAD0)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
        {card.shortname}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.6 }}>{card.type}</div>
      <div style={{ fontSize: '12px', opacity: 0.6 }}>{card.status}</div>
    </div>
  );
}

/**
 * Top-level composition component for the workspace domain.
 * Assembles MasonryGrid, CardContainer, DetailOverlay, and keyboard navigation.
 */
export function WorkspacePanel({
  renderCard,
  renderDetail,
}: WorkspacePanelProps) {
  const gridRef = useRef<MasonryGridHandle>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const order = useCardOrder();
  const { columnCount } = useColumnCount(scrollContainerRef);

  // Status change live region
  const [liveMessage, setLiveMessage] = useState('');

  // Subscribe to card status changes for live region announcements
  const prevStatusesRef = useRef(new Map<string, string>());
  useEffect(() => {
    const unsubscribe = useSessionStore.subscribe((state) => {
      const prevStatuses = prevStatusesRef.current;
      const nextStatuses = new Map<string, string>();
      state.cards.forEach((card) => {
        nextStatuses.set(card.id, card.status);
        const prevStatus = prevStatuses.get(card.id);
        if (prevStatus && prevStatus !== card.status) {
          setLiveMessage(`Card ${card.shortname} status: ${card.status}`);
        }
      });
      prevStatusesRef.current = nextStatuses;
    });
    return unsubscribe;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      gridRef.current?.scrollToIndex(index);
    },
    []
  );

  // Wire keyboard navigation to the scroll container inside the grid
  // The MasonryGrid's scroll container has the role="list" and tabIndex,
  // so we attach keyboard events at the workspace level via a wrapper ref.
  // We re-use scrollContainerRef which wraps the grid.
  useKeyboardNavigation({
    containerRef: scrollContainerRef,
    columnCount,
    scrollToIndex,
  });

  const renderItem = useCallback(
    (
      cardId: string,
      style: React.CSSProperties,
      measureRef: (el: HTMLElement | null) => void,
      index: number
    ) => {
      return (
        <CardContainer
          key={cardId}
          cardId={cardId}
          style={style}
          onMeasure={measureRef}
          totalCount={order.length}
          orderIndex={index}
        >
          {renderCard ? (
            renderCard(cardId)
          ) : (
            <DefaultCardPlaceholder cardId={cardId} />
          )}
        </CardContainer>
      );
    },
    [order.length, renderCard]
  );

  return (
    <div
      ref={scrollContainerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      tabIndex={0}
      onKeyDown={() => {
        /* keyboard events handled by useKeyboardNavigation */
      }}
    >
      <MasonryGrid ref={gridRef} renderItem={renderItem} />
      <DetailOverlay renderDetail={renderDetail} />
      {/* Visually hidden live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {liveMessage}
      </div>
    </div>
  );
}
