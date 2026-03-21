import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { useSessionStore } from '../store/sessionStore';
import type { CardState } from '../store/types';

function makeCard(overrides: Partial<CardState> = {}): CardState {
  return {
    id: 'card-1',
    shortname: 'q1',
    type: 'sql',
    status: 'complete',
    content: '',
    input: '',
    references: [],
    referencedBy: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function setupCards(count: number) {
  const cards: CardState[] = [];
  for (let i = 0; i < count; i++) {
    cards.push(makeCard({ id: `card-${i}`, shortname: `q${i}` }));
  }
  const cardMap = new Map(cards.map((c) => [c.id, c]));
  useSessionStore.setState({
    cards: cardMap,
    order: cards.map((c) => c.id),
    activeCardId: null,
    detailCardId: null,
    streamBuffers: new Map(),
    renderedCardIds: new Set(),
  });
  return cards;
}

function fireKeyOnElement(el: HTMLElement, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);
}

describe('useKeyboardNavigation', () => {
  let containerEl: HTMLDivElement;

  beforeEach(() => {
    containerEl = document.createElement('div');
    document.body.appendChild(containerEl);

    useSessionStore.setState({
      cards: new Map(),
      order: [],
      activeCardId: null,
      detailCardId: null,
      streamBuffers: new Map(),
      renderedCardIds: new Set(),
    });
  });

  it('ArrowDown sets first card as active when no card is active', () => {
    setupCards(3);
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowDown');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-0');
  });

  it('ArrowDown moves to next card', () => {
    setupCards(3);
    useSessionStore.setState({ activeCardId: 'card-0' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowDown');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-1');
  });

  it('ArrowDown stays at last card', () => {
    setupCards(3);
    useSessionStore.setState({ activeCardId: 'card-2' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowDown');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-2');
  });

  it('ArrowUp moves to previous card', () => {
    setupCards(3);
    useSessionStore.setState({ activeCardId: 'card-1' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowUp');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-0');
  });

  it('ArrowUp stays at first card', () => {
    setupCards(3);
    useSessionStore.setState({ activeCardId: 'card-0' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowUp');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-0');
  });

  it('ArrowRight skips by columnCount', () => {
    setupCards(6);
    useSessionStore.setState({ activeCardId: 'card-1' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 3 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowRight');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-4');
  });

  it('ArrowLeft skips by columnCount', () => {
    setupCards(6);
    useSessionStore.setState({ activeCardId: 'card-4' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 3 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowLeft');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-1');
  });

  it('Enter opens detail for active card', () => {
    setupCards(3);
    useSessionStore.setState({ activeCardId: 'card-1' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'Enter');
    });

    expect(useSessionStore.getState().detailCardId).toBe('card-1');
  });

  it('Enter does nothing when no active card', () => {
    setupCards(3);
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'Enter');
    });

    expect(useSessionStore.getState().detailCardId).toBeNull();
  });

  it('Escape clears active card', () => {
    setupCards(3);
    useSessionStore.setState({ activeCardId: 'card-1' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'Escape');
    });

    expect(useSessionStore.getState().activeCardId).toBeNull();
  });

  it('Escape closes detail if open', () => {
    setupCards(3);
    useSessionStore.setState({
      activeCardId: 'card-1',
      detailCardId: 'card-1',
    });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'Escape');
    });

    expect(useSessionStore.getState().detailCardId).toBeNull();
  });

  it('Home moves to first card', () => {
    setupCards(5);
    useSessionStore.setState({ activeCardId: 'card-3' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'Home');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-0');
  });

  it('End moves to last card', () => {
    setupCards(5);
    useSessionStore.setState({ activeCardId: 'card-1' });
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'End');
    });

    expect(useSessionStore.getState().activeCardId).toBe('card-4');
  });

  it('calls scrollToIndex when navigating', () => {
    setupCards(3);
    useSessionStore.setState({ activeCardId: 'card-0' });
    const ref = { current: containerEl };
    const scrollToIndex = vi.fn();

    renderHook(() =>
      useKeyboardNavigation({
        containerRef: ref,
        columnCount: 2,
        scrollToIndex,
      })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowDown');
    });

    expect(scrollToIndex).toHaveBeenCalledWith(1);
  });

  it('does nothing with empty order', () => {
    const ref = { current: containerEl };

    renderHook(() =>
      useKeyboardNavigation({ containerRef: ref, columnCount: 2 })
    );

    act(() => {
      fireKeyOnElement(containerEl, 'ArrowDown');
    });

    expect(useSessionStore.getState().activeCardId).toBeNull();
  });
});
