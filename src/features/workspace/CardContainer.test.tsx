import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LazyMotionProvider } from '@/common/animations/LazyMotionProvider';
import { CardContainer } from './CardContainer';
import { useSessionStore } from './store/sessionStore';

function renderWithMotion(ui: React.ReactNode) {
  return render(<LazyMotionProvider>{ui}</LazyMotionProvider>);
}

describe('CardContainer', () => {
  beforeEach(() => {
    useSessionStore.setState({
      cards: new Map(),
      order: [],
      activeCardId: null,
      detailCardId: null,
      streamBuffers: new Map(),
      renderedCardIds: new Set(),
    });
  });

  it('renders children inside the container', () => {
    const onMeasure = vi.fn();
    renderWithMotion(
      <CardContainer
        cardId="test-1"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={onMeasure}
        totalCount={5}
        orderIndex={0}
      >
        <span>Test Card Content</span>
      </CardContainer>
    );

    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
  });

  it('has role="listitem"', () => {
    renderWithMotion(
      <CardContainer
        cardId="test-1"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={vi.fn()}
        totalCount={5}
        orderIndex={0}
      >
        content
      </CardContainer>
    );

    const item = screen.getByRole('listitem');
    expect(item).toBeInTheDocument();
  });

  it('sets aria-setsize and aria-posinset correctly', () => {
    renderWithMotion(
      <CardContainer
        cardId="test-1"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={vi.fn()}
        totalCount={10}
        orderIndex={3}
      >
        content
      </CardContainer>
    );

    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute('aria-setsize', '10');
    expect(item).toHaveAttribute('aria-posinset', '4');
  });

  it('calls onMeasure with the DOM element on mount', () => {
    const onMeasure = vi.fn();
    renderWithMotion(
      <CardContainer
        cardId="test-1"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={onMeasure}
        totalCount={1}
        orderIndex={0}
      >
        content
      </CardContainer>
    );

    expect(onMeasure).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('sets data-card-id attribute', () => {
    renderWithMotion(
      <CardContainer
        cardId="my-card"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={vi.fn()}
        totalCount={1}
        orderIndex={0}
      >
        content
      </CardContainer>
    );

    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute('data-card-id', 'my-card');
  });

  it('shows aria-current when card is active', () => {
    act(() => {
      useSessionStore.getState().setActiveCard('active-card');
    });

    renderWithMotion(
      <CardContainer
        cardId="active-card"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={vi.fn()}
        totalCount={1}
        orderIndex={0}
      >
        content
      </CardContainer>
    );

    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute('aria-current', 'true');
  });

  it('does not show aria-current when card is not active', () => {
    act(() => {
      useSessionStore.getState().setActiveCard('other-card');
    });

    renderWithMotion(
      <CardContainer
        cardId="my-card"
        style={{ position: 'absolute', top: '0px', left: '0px', width: '400px' }}
        onMeasure={vi.fn()}
        totalCount={1}
        orderIndex={0}
      >
        content
      </CardContainer>
    );

    const item = screen.getByRole('listitem');
    expect(item).not.toHaveAttribute('aria-current');
  });
});
