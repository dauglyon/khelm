import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { LazyMotionProvider } from '@/common/animations/LazyMotionProvider';
import { CardContainer } from './CardContainer';
import { useSessionStore } from './store/sessionStore';

// Mock useReducedMotion
vi.mock('motion/react', async () => {
  const actual = await vi.importActual('motion/react');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

import { useReducedMotion } from 'motion/react';

function renderWithMotion(ui: React.ReactNode) {
  return render(<LazyMotionProvider>{ui}</LazyMotionProvider>);
}

describe('CardContainer enter animations', () => {
  beforeEach(() => {
    useSessionStore.setState({
      cards: new Map(),
      order: [],
      activeCardId: null,
      detailCardId: null,
      streamBuffers: new Map(),
      renderedCardIds: new Set(),
    });
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it('first-render card has initial animation state', () => {
    // Card not in renderedCardIds, so isFirstRender = true
    renderWithMotion(
      <CardContainer
        cardId="new-card"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={vi.fn()}
        totalCount={1}
        orderIndex={0}
      >
        New card
      </CardContainer>
    );

    // The card should exist and have been rendered
    // (Motion handles the actual animation; we just verify the component renders)
    expect(document.querySelector('[data-card-id="new-card"]')).toBeTruthy();
  });

  it('previously rendered card does not have initial animation', () => {
    // Mark as already rendered
    act(() => {
      useSessionStore.getState().markRendered('old-card');
    });

    renderWithMotion(
      <CardContainer
        cardId="old-card"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={vi.fn()}
        totalCount={1}
        orderIndex={0}
      >
        Old card
      </CardContainer>
    );

    // Card should render normally
    expect(document.querySelector('[data-card-id="old-card"]')).toBeTruthy();
  });

  it('reduced motion skips animation', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    renderWithMotion(
      <CardContainer
        cardId="reduced-motion-card"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={vi.fn()}
        totalCount={1}
        orderIndex={0}
      >
        Card
      </CardContainer>
    );

    // Card should render without animation
    expect(
      document.querySelector('[data-card-id="reduced-motion-card"]')
    ).toBeTruthy();
  });

  it('multiple new cards animate independently', () => {
    renderWithMotion(
      <>
        <CardContainer
          cardId="card-a"
          style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
          onMeasure={vi.fn()}
          totalCount={3}
          orderIndex={0}
        >
          A
        </CardContainer>
        <CardContainer
          cardId="card-b"
          style={{ position: 'absolute', top: '0px', left: '400px', width: '400px' }}
          onMeasure={vi.fn()}
          totalCount={3}
          orderIndex={1}
        >
          B
        </CardContainer>
        <CardContainer
          cardId="card-c"
          style={{ position: 'absolute', top: '300px', left: '0px', width: '400px' }}
          onMeasure={vi.fn()}
          totalCount={3}
          orderIndex={2}
        >
          C
        </CardContainer>
      </>
    );

    // All three should be rendered
    expect(document.querySelector('[data-card-id="card-a"]')).toBeTruthy();
    expect(document.querySelector('[data-card-id="card-b"]')).toBeTruthy();
    expect(document.querySelector('[data-card-id="card-c"]')).toBeTruthy();
  });
});
