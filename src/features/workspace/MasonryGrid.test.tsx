import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MasonryGrid } from './MasonryGrid';
import { useSessionStore } from './store/sessionStore';
import type { CardState } from './store/types';

// Mock ResizeObserver
type ResizeCallback = (entries: ResizeObserverEntry[]) => void;
let resizeCallback: ResizeCallback | null = null;

class MockResizeObserver {
  constructor(cb: ResizeCallback) {
    resizeCallback = cb;
  }
  observe(el: Element) {
    // Trigger initial resize
    if (resizeCallback) {
      resizeCallback([
        {
          target: el,
          contentBoxSize: [{ inlineSize: 1040, blockSize: 800 }],
          contentRect: {
            width: 1040,
            height: 800,
            top: 0,
            left: 0,
            right: 1040,
            bottom: 800,
            x: 0,
            y: 0,
          },
          borderBoxSize: [{ inlineSize: 1040, blockSize: 800 }],
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry,
      ]);
    }
  }
  unobserve() {}
  disconnect() {}
}

function makeCard(overrides: Partial<CardState> = {}): CardState {
  return {
    id: 'card-1',
    shortname: 'q1',
    type: 'sql',
    status: 'complete',
    content: '',
    input: 'SELECT * FROM taxa',
    references: [],
    referencedBy: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('MasonryGrid', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    resizeCallback = null;
    useSessionStore.setState({
      cards: new Map(),
      order: [],
      activeCardId: null,
      detailCardId: null,
      streamBuffers: new Map(),
      renderedCardIds: new Set(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders empty grid without errors', () => {
    const renderItem = vi.fn();
    render(<MasonryGrid renderItem={renderItem} />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(renderItem).not.toHaveBeenCalled();
  });

  it('has role="list" on the scroll container', () => {
    render(<MasonryGrid renderItem={vi.fn()} />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('has aria-label on the scroll container', () => {
    render(<MasonryGrid renderItem={vi.fn()} />);
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', 'Session workspace cards');
  });

  it('is focusable (tabIndex=0)', () => {
    render(<MasonryGrid renderItem={vi.fn()} />);
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('tabindex', '0');
  });

  it('calls renderItem for visible virtual items', () => {
    const cards = Array.from({ length: 3 }, (_, i) =>
      makeCard({ id: `card-${i}`, shortname: `q${i}` })
    );
    const cardMap = new Map(cards.map((c) => [c.id, c]));

    act(() => {
      useSessionStore.setState({
        cards: cardMap,
        order: cards.map((c) => c.id),
      });
    });

    const renderItem = vi.fn(
      (cardId: string, style: React.CSSProperties, _measureRef: (el: HTMLElement | null) => void, _index: number) => (
        <div key={cardId} style={style} data-testid={`card-${cardId}`}>
          {cardId}
        </div>
      )
    );

    render(<MasonryGrid renderItem={renderItem} />);

    // renderItem should have been called for visible cards
    expect(renderItem).toHaveBeenCalled();
  });

  it('renderItem receives correct cardId', () => {
    const cards = [makeCard({ id: 'test-card', shortname: 'tc' })];
    const cardMap = new Map(cards.map((c) => [c.id, c]));

    act(() => {
      useSessionStore.setState({
        cards: cardMap,
        order: ['test-card'],
      });
    });

    const receivedIds: string[] = [];
    const renderItem = vi.fn(
      (cardId: string, style: React.CSSProperties, _measureRef: (el: HTMLElement | null) => void, _index: number) => {
        receivedIds.push(cardId);
        return (
          <div key={cardId} style={style}>
            {cardId}
          </div>
        );
      }
    );

    render(<MasonryGrid renderItem={renderItem} />);

    expect(receivedIds).toContain('test-card');
  });

  it('renderItem receives style with position absolute', () => {
    act(() => {
      useSessionStore.setState({
        cards: new Map([['c1', makeCard({ id: 'c1' })]]),
        order: ['c1'],
      });
    });

    let receivedStyle: React.CSSProperties | null = null;
    const renderItem = vi.fn(
      (cardId: string, style: React.CSSProperties, _measureRef: (el: HTMLElement | null) => void, _index: number) => {
        receivedStyle = style;
        return (
          <div key={cardId} style={style}>
            {cardId}
          </div>
        );
      }
    );

    render(<MasonryGrid renderItem={renderItem} />);

    expect(receivedStyle).not.toBeNull();
    expect(receivedStyle!.position).toBe('absolute');
  });
});
