import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LazyMotionProvider } from '@/common/animations/LazyMotionProvider';
import { DetailOverlay } from './DetailOverlay';
import { useSessionStore } from './store/sessionStore';

function renderWithMotion(ui: React.ReactNode) {
  return render(<LazyMotionProvider>{ui}</LazyMotionProvider>);
}

describe('DetailOverlay', () => {
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

  it('does not render when detailCardId is null', () => {
    renderWithMotion(<DetailOverlay />);
    expect(screen.queryByTestId('detail-backdrop')).not.toBeInTheDocument();
  });

  it('renders when detailCardId is set', () => {
    act(() => {
      useSessionStore.getState().openDetail('card-1');
    });

    renderWithMotion(<DetailOverlay />);
    expect(screen.getByTestId('detail-backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
  });

  it('shows default placeholder content', () => {
    act(() => {
      useSessionStore.getState().openDetail('card-1');
    });

    renderWithMotion(<DetailOverlay />);
    expect(screen.getByText('Detail View: card-1')).toBeInTheDocument();
  });

  it('calls renderDetail with correct cardId', () => {
    act(() => {
      useSessionStore.getState().openDetail('card-42');
    });

    const renderDetail = vi.fn((cardId: string) => (
      <div>Custom Detail: {cardId}</div>
    ));

    renderWithMotion(<DetailOverlay renderDetail={renderDetail} />);
    expect(renderDetail).toHaveBeenCalledWith('card-42');
    expect(screen.getByText('Custom Detail: card-42')).toBeInTheDocument();
  });

  it('closes on backdrop click', () => {
    act(() => {
      useSessionStore.getState().openDetail('card-1');
    });

    renderWithMotion(<DetailOverlay />);
    const backdropEl = screen.getByTestId('detail-backdrop');
    fireEvent.click(backdropEl);

    expect(useSessionStore.getState().detailCardId).toBeNull();
  });

  it('does not close when clicking inside the panel', () => {
    act(() => {
      useSessionStore.getState().openDetail('card-1');
    });

    renderWithMotion(<DetailOverlay />);
    const panel = screen.getByTestId('detail-panel');
    fireEvent.click(panel);

    expect(useSessionStore.getState().detailCardId).toBe('card-1');
  });

  it('closes on Escape key', () => {
    act(() => {
      useSessionStore.getState().openDetail('card-1');
    });

    renderWithMotion(<DetailOverlay />);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(useSessionStore.getState().detailCardId).toBeNull();
  });

  it('has role="dialog" on the panel', () => {
    act(() => {
      useSessionStore.getState().openDetail('card-1');
    });

    renderWithMotion(<DetailOverlay />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
