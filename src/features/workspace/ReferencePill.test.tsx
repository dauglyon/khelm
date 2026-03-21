import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReferencePill } from './ReferencePill';
import { useSessionStore } from './store/sessionStore';
import type { CardState } from './store/types';

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

describe('ReferencePill', () => {
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

  it('renders with shortname prefixed by @', () => {
    act(() => {
      useSessionStore.getState().addCard(makeCard({ id: 'c1', shortname: 'q1' }));
    });

    render(<ReferencePill cardId="c1" />);
    expect(screen.getByText('@q1')).toBeInTheDocument();
  });

  it('shows @deleted for nonexistent card', () => {
    render(<ReferencePill cardId="nonexistent" />);
    expect(screen.getByText('@deleted')).toBeInTheDocument();
  });

  it('deleted pill has aria-label', () => {
    render(<ReferencePill cardId="nonexistent" />);
    expect(
      screen.getByLabelText('Deleted card reference')
    ).toBeInTheDocument();
  });

  it('clicking pill sets active card', () => {
    act(() => {
      useSessionStore.getState().addCard(makeCard({ id: 'c1', shortname: 'q1' }));
    });

    render(<ReferencePill cardId="c1" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(useSessionStore.getState().activeCardId).toBe('c1');
  });

  it('updates when shortname changes', () => {
    act(() => {
      useSessionStore.getState().addCard(makeCard({ id: 'c1', shortname: 'q1' }));
    });

    const { rerender } = render(<ReferencePill cardId="c1" />);
    expect(screen.getByText('@q1')).toBeInTheDocument();

    act(() => {
      useSessionStore.getState().updateCard('c1', { shortname: 'sales_query' });
    });

    rerender(<ReferencePill cardId="c1" />);
    expect(screen.getByText('@sales_query')).toBeInTheDocument();
  });

  it('has tooltip with shortname and status', () => {
    act(() => {
      useSessionStore
        .getState()
        .addCard(makeCard({ id: 'c1', shortname: 'q1', status: 'running' }));
    });

    render(<ReferencePill cardId="c1" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'q1 (running)');
  });

  it('renders different card types', () => {
    act(() => {
      useSessionStore
        .getState()
        .addCard(makeCard({ id: 'py1', shortname: 'analysis', type: 'python' }));
    });

    render(<ReferencePill cardId="py1" />);
    expect(screen.getByText('@analysis')).toBeInTheDocument();
  });

  it('renders data_ingest type correctly', () => {
    act(() => {
      useSessionStore
        .getState()
        .addCard(makeCard({ id: 'di1', shortname: 'upload', type: 'data_ingest' }));
    });

    render(<ReferencePill cardId="di1" />);
    expect(screen.getByText('@upload')).toBeInTheDocument();
  });
});
