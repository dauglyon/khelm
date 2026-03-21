import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LazyMotionProvider } from '@/common/animations/LazyMotionProvider';
import { WorkspacePanel } from './WorkspacePanel';
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

function renderWithMotion(ui: React.ReactNode) {
  return render(<LazyMotionProvider>{ui}</LazyMotionProvider>);
}

describe('WorkspacePanel', () => {
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

  it('renders empty workspace without errors', () => {
    renderWithMotion(<WorkspacePanel />);
    // The list container should exist
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('renders cards from the store with default placeholders', () => {
    const cards = [
      makeCard({ id: 'c1', shortname: 'q1', type: 'sql' }),
      makeCard({ id: 'c2', shortname: 'q2', type: 'python' }),
      makeCard({ id: 'c3', shortname: 'q3', type: 'literature' }),
    ];
    const cardMap = new Map(cards.map((c) => [c.id, c]));

    act(() => {
      useSessionStore.setState({
        cards: cardMap,
        order: ['c1', 'c2', 'c3'],
      });
    });

    renderWithMotion(<WorkspacePanel />);

    // Default placeholder shows shortname
    expect(screen.getByText('q1')).toBeInTheDocument();
    expect(screen.getByText('q2')).toBeInTheDocument();
    expect(screen.getByText('q3')).toBeInTheDocument();
  });

  it('uses custom renderCard when provided', () => {
    act(() => {
      useSessionStore.setState({
        cards: new Map([['c1', makeCard({ id: 'c1' })]]),
        order: ['c1'],
      });
    });

    const renderCard = vi.fn((cardId: string) => (
      <div data-testid="custom-card">{cardId}</div>
    ));

    renderWithMotion(<WorkspacePanel renderCard={renderCard} />);

    expect(renderCard).toHaveBeenCalledWith('c1');
    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });

  it('shows detail overlay when detailCardId is set', () => {
    act(() => {
      useSessionStore.setState({
        cards: new Map([['c1', makeCard({ id: 'c1' })]]),
        order: ['c1'],
        detailCardId: 'c1',
      });
    });

    renderWithMotion(<WorkspacePanel />);
    expect(screen.getByTestId('detail-backdrop')).toBeInTheDocument();
  });

  it('has live region for status announcements', () => {
    renderWithMotion(<WorkspacePanel />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
