import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnCount, GRID_GAP } from './useColumnCount';
import { type RefObject } from 'react';

// Mock ResizeObserver
type ResizeCallback = (entries: ResizeObserverEntry[]) => void;
let resizeCallback: ResizeCallback | null = null;
let observedElement: Element | null = null;

const mockDisconnect = vi.fn();
const mockObserve = vi.fn();

class MockResizeObserver {
  constructor(cb: ResizeCallback) {
    resizeCallback = cb;
  }
  observe(el: Element) {
    observedElement = el;
    mockObserve(el);
  }
  unobserve() {}
  disconnect() {
    mockDisconnect();
  }
}

function triggerResize(width: number) {
  if (!resizeCallback || !observedElement) return;
  const entry = {
    target: observedElement,
    contentBoxSize: [{ inlineSize: width, blockSize: 800 }],
    contentRect: { width, height: 800, top: 0, left: 0, right: width, bottom: 800, x: 0, y: 0 },
    borderBoxSize: [{ inlineSize: width, blockSize: 800 }],
    devicePixelContentBoxSize: [],
  } as unknown as ResizeObserverEntry;
  resizeCallback([entry]);
}

describe('useColumnCount', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    resizeCallback = null;
    observedElement = null;
    mockDisconnect.mockClear();
    mockObserve.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns initial values before observation', () => {
    const ref = { current: null } as RefObject<HTMLElement | null>;
    const { result } = renderHook(() => useColumnCount(ref));
    expect(result.current.columnCount).toBe(1);
    expect(result.current.columnWidth).toBe(0);
  });

  it('handles null ref gracefully', () => {
    const ref = { current: null } as RefObject<HTMLElement | null>;
    const { result } = renderHook(() => useColumnCount(ref));
    expect(result.current).toEqual({ columnCount: 1, columnWidth: 0 });
  });

  it('returns 1 column for narrow containers (< 640px)', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    act(() => {
      triggerResize(500);
    });

    expect(result.current.columnCount).toBe(1);
  });

  it('returns 2 columns for 640px', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    act(() => {
      triggerResize(640);
    });

    expect(result.current.columnCount).toBe(2);
  });

  it('returns 2 columns for 1023px', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    act(() => {
      triggerResize(1023);
    });

    expect(result.current.columnCount).toBe(2);
  });

  it('returns 3 columns for 1024px', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    act(() => {
      triggerResize(1024);
    });

    expect(result.current.columnCount).toBe(3);
  });

  it('returns 3 columns for 1439px', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    act(() => {
      triggerResize(1439);
    });

    expect(result.current.columnCount).toBe(3);
  });

  it('returns 4 columns for 1440px', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    act(() => {
      triggerResize(1440);
    });

    expect(result.current.columnCount).toBe(4);
  });

  it('returns 1 column for zero-width container', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    act(() => {
      triggerResize(0);
    });

    expect(result.current.columnCount).toBe(1);
  });

  it('computes column width correctly', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    // 1040px, 3 columns: (1040 - 2*16) / 3 = 336
    act(() => {
      triggerResize(1040);
    });

    expect(result.current.columnCount).toBe(3);
    expect(result.current.columnWidth).toBeCloseTo(
      (1040 - 2 * GRID_GAP) / 3,
      2
    );
  });

  it('reacts to container resize', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { result } = renderHook(() => useColumnCount(ref));

    act(() => {
      triggerResize(800);
    });
    expect(result.current.columnCount).toBe(2);

    act(() => {
      triggerResize(1200);
    });
    expect(result.current.columnCount).toBe(3);
  });

  it('disconnects ResizeObserver on unmount', () => {
    const el = document.createElement('div');
    const ref = { current: el } as RefObject<HTMLElement>;
    const { unmount } = renderHook(() => useColumnCount(ref));

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
