import {
  useRef,
  type CSSProperties,
  type ReactNode,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCardOrder } from './store/selectors';
import { useColumnCount, GRID_GAP } from './hooks/useColumnCount';
import { scrollContainer, gridInner } from './MasonryGrid.css';

/** Estimated average card height in pixels (before measurement). */
const ESTIMATED_ITEM_SIZE = 280;

/** Number of items to render beyond the visible area. */
const OVERSCAN_COUNT = 10;

export interface MasonryGridProps {
  /** Render callback for each virtual item */
  renderItem: (
    cardId: string,
    style: CSSProperties,
    measureRef: (el: HTMLElement | null) => void,
    index: number
  ) => ReactNode;
}

export interface MasonryGridHandle {
  scrollToIndex: (index: number) => void;
}

export const MasonryGrid = forwardRef<MasonryGridHandle, MasonryGridProps>(
  function MasonryGrid({ renderItem }, ref) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const order = useCardOrder();
    const { columnCount, columnWidth } = useColumnCount(containerRef);

    // Track cumulative lane heights for shortest-column-first assignment
    const laneHeights = useRef<number[]>([]);

    const virtualizer = useVirtualizer({
      count: order.length,
      getScrollElement: () => scrollRef.current,
      estimateSize: () => ESTIMATED_ITEM_SIZE,
      overscan: OVERSCAN_COUNT,
      lanes: columnCount,
    });

    // Expose scrollToIndex to parent
    useImperativeHandle(ref, () => ({
      scrollToIndex: (index: number) => {
        virtualizer.scrollToIndex(index, { align: 'center' });
      },
    }));

    const virtualItems = virtualizer.getVirtualItems();

    // Reset lane heights and compute positions
    laneHeights.current = new Array(columnCount).fill(0);

    // Build a map of lane assignments by computing shortest-column-first
    // for all items up to the last virtual item index
    const maxIndex =
      virtualItems.length > 0
        ? Math.max(...virtualItems.map((vi) => vi.index))
        : -1;

    const laneAssignments: number[] = [];
    const itemTops: number[] = [];
    const cumulativeHeights = new Array(columnCount).fill(0);

    for (let i = 0; i <= maxIndex; i++) {
      // Find the lane with the smallest cumulative height
      let minLane = 0;
      let minHeight = cumulativeHeights[0];
      for (let l = 1; l < columnCount; l++) {
        if (cumulativeHeights[l] < minHeight) {
          minHeight = cumulativeHeights[l];
          minLane = l;
        }
      }
      laneAssignments[i] = minLane;
      itemTops[i] = cumulativeHeights[minLane];

      // Get measured or estimated size for this item
      const item = virtualItems.find((vi) => vi.index === i);
      const itemHeight = item ? item.size : ESTIMATED_ITEM_SIZE;
      cumulativeHeights[minLane] += itemHeight + GRID_GAP;
    }

    return (
      <div
        ref={scrollRef}
        className={scrollContainer}
        role="list"
        aria-label="Session workspace cards"
        tabIndex={0}
      >
        <div
          ref={containerRef}
          className={gridInner}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualItems.map((virtualItem) => {
            const cardId = order[virtualItem.index];
            if (!cardId) return null;

            const laneIndex =
              laneAssignments[virtualItem.index] ?? virtualItem.lane;
            const top = virtualItem.start;
            const left = laneIndex * (columnWidth + GRID_GAP);

            const itemStyle: CSSProperties = {
              position: 'absolute',
              top: `${top}px`,
              left: `${left}px`,
              width: `${columnWidth}px`,
            };

            return renderItem(
              cardId,
              itemStyle,
              virtualizer.measureElement,
              virtualItem.index
            );
          })}
        </div>
      </div>
    );
  }
);
