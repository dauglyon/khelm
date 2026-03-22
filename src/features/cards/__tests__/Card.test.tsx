import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardComponent } from '../Card';
import { useCardStore } from '../store';
import type { Card } from '../types';

function createTestCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    shortname: 'Test Query',
    type: 'sql',
    status: 'complete',
    content: { query: 'SELECT 1', dataSource: 'test' },
    result: { columns: [], rows: [], rowCount: 0, truncated: false },
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

describe('CardComponent', () => {
  beforeEach(() => {
    useCardStore.setState({
      cards: new Map(),
      streamingContent: new Map(),
      chatStates: new Map(),
    });
  });

  it('renders card with header showing shortname and type', () => {
    useCardStore.getState().setCard(createTestCard());
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByText('Test Query')).toBeInTheDocument();
    expect(screen.getByText('SQL')).toBeInTheDocument();
  });

  it('renders body content', () => {
    useCardStore.getState().setCard(createTestCard());
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByText('SELECT 1')).toBeInTheDocument();
  });

  it('shows shimmer overlay when status is thinking', () => {
    useCardStore.getState().setCard(
      createTestCard({ status: 'thinking' })
    );
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByTestId('shimmer-overlay')).toBeInTheDocument();
  });

  it('does not show shimmer when status is complete', () => {
    useCardStore.getState().setCard(
      createTestCard({ status: 'complete' })
    );
    render(<CardComponent cardId="card-1" />);
    expect(screen.queryByTestId('shimmer-overlay')).not.toBeInTheDocument();
  });

  it('returns null for non-existent card', () => {
    const { container } = render(<CardComponent cardId="nonexistent" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders note card body', () => {
    useCardStore.getState().setCard(
      createTestCard({
        type: 'note',
        content: { text: 'My note' },
        result: null,
      })
    );
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByDisplayValue('My note')).toBeInTheDocument();
  });
});
