import { useState, useEffect, type RefObject } from 'react';

/** Grid gap in pixels. Will use design token when space.gridGap is available. */
export const GRID_GAP = 16;

/** Responsive breakpoints: container width -> column count */
const BREAKPOINTS: Array<{ minWidth: number; columns: number }> = [
  { minWidth: 1440, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];

function getColumnCount(containerWidth: number): number {
  if (containerWidth <= 0) return 1;
  for (const bp of BREAKPOINTS) {
    if (containerWidth >= bp.minWidth) {
      return bp.columns;
    }
  }
  return 1;
}

function getColumnWidth(containerWidth: number, columnCount: number): number {
  if (containerWidth <= 0 || columnCount <= 0) return 0;
  return (containerWidth - (columnCount - 1) * GRID_GAP) / columnCount;
}

export interface ColumnLayout {
  columnCount: number;
  columnWidth: number;
}

/**
 * Hook that observes a container element's width via ResizeObserver
 * and returns the current column count and column width for masonry layout.
 *
 * Column count is based on container width, not viewport width.
 */
export function useColumnCount(
  containerRef: RefObject<HTMLElement | null>
): ColumnLayout {
  const [layout, setLayout] = useState<ColumnLayout>({
    columnCount: 1,
    columnWidth: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        let width: number;
        if (entry.contentBoxSize && entry.contentBoxSize.length > 0) {
          width = entry.contentBoxSize[0].inlineSize;
        } else {
          width = entry.contentRect.width;
        }

        const cols = getColumnCount(width);
        const colWidth = getColumnWidth(width, cols);
        setLayout({ columnCount: cols, columnWidth: colWidth });
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  return layout;
}
