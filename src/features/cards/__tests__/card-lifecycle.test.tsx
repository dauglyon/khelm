import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardComponent } from '../Card';
import { useCardStore } from '../store';
import type { Card } from '../types';

function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    shortname: 'Test Query',
    type: 'sql',
    status: 'thinking',
    content: { query: 'SELECT 1', dataSource: 'test' },
    result: null,
    error: null,
    references: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-1',
    lockedBy: null,
    sessionId: 'session-1',
    ...overrides,
  };
}

describe('Card Lifecycle Integration', () => {
  beforeEach(() => {
    useCardStore.setState({
      cards: new Map(),
      streamingContent: new Map(),
      chatStates: new Map(),
    });
  });

  it('creates and renders a SQL card', () => {
    useCardStore.getState().setCard(createMockCard());
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByText('Test Query')).toBeInTheDocument();
    expect(screen.getByText('SQL')).toBeInTheDocument();
  });

  it('transitions through status states', () => {
    useCardStore.getState().setCard(createMockCard({ status: 'thinking' }));
    const { rerender } = render(<CardComponent cardId="card-1" />);

    expect(screen.getByTestId('status-thinking')).toBeInTheDocument();

    useCardStore.getState().setCardStatus('card-1', 'running');
    rerender(<CardComponent cardId="card-1" />);
    expect(screen.getByTestId('status-running')).toBeInTheDocument();

    useCardStore.getState().setCardStatus('card-1', 'complete');
    rerender(<CardComponent cardId="card-1" />);
    expect(screen.getByTestId('status-complete')).toBeInTheDocument();
  });

  it('shows error status', () => {
    useCardStore.getState().setCard(createMockCard());
    useCardStore.getState().setCardError('card-1', {
      code: 'SYNTAX_ERROR',
      message: 'Unexpected token',
    });

    render(<CardComponent cardId="card-1" />);
    expect(screen.getByTestId('status-error')).toBeInTheDocument();
  });

  it('error to retry resets status', () => {
    useCardStore.getState().setCard(createMockCard());
    useCardStore.getState().setCardError('card-1', {
      code: 'ERR',
      message: 'fail',
    });

    const { rerender } = render(<CardComponent cardId="card-1" />);
    expect(screen.getByTestId('status-error')).toBeInTheDocument();

    useCardStore.getState().setCardStatus('card-1', 'thinking');
    rerender(<CardComponent cardId="card-1" />);
    expect(screen.getByTestId('status-thinking')).toBeInTheDocument();
  });

  it('deletes card from store', async () => {
    const user = userEvent.setup();
    useCardStore.getState().setCard(createMockCard({ status: 'complete' }));
    render(<CardComponent cardId="card-1" />);

    // Click delete
    await user.click(screen.getByLabelText('Delete card'));
    // Confirm delete
    await user.click(screen.getByLabelText('Confirm delete'));

    expect(useCardStore.getState().cards.has('card-1')).toBe(false);
  });

  it('copies card creating a new entry', async () => {
    const user = userEvent.setup();
    useCardStore.getState().setCard(createMockCard({ status: 'complete' }));
    render(<CardComponent cardId="card-1" />);

    await user.click(screen.getByLabelText('Copy card'));

    const cards = Array.from(useCardStore.getState().cards.values());
    expect(cards.length).toBe(2);
    const copy = cards.find((c) => c.id !== 'card-1');
    expect(copy?.shortname).toBe('Test Query (copy)');
  });

  it('edits shortname and persists to store', async () => {
    const user = userEvent.setup();
    useCardStore.getState().setCard(createMockCard({ status: 'complete' }));
    render(<CardComponent cardId="card-1" />);

    await user.click(screen.getByText('Test Query'));
    const input = screen.getByLabelText('Edit card name');
    await user.clear(input);
    await user.type(input, 'Updated Name');
    await user.keyboard('{Enter}');

    expect(useCardStore.getState().cards.get('card-1')?.shortname).toBe('Updated Name');
  });
});
