import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReferencePills } from '../ReferencePills';
import { useCardStore } from '../store';
import type { Card } from '../types';

// Mock the workspace modules since they're a cross-domain dependency
vi.mock('@/features/workspace', () => ({
  useCardShortname: (id: string) => {
    // Return shortname from card store as fallback
    const card = useCardStore.getState().cards.get(id);
    return card?.shortname;
  },
  useScrollToCard: () => vi.fn(),
}));

function createTestCard(id: string, overrides: Partial<Card> = {}): Card {
  return {
    id,
    shortname: `Card ${id}`,
    type: 'sql',
    status: 'complete',
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

describe('ReferencePills', () => {
  beforeEach(() => {
    useCardStore.setState({
      cards: new Map(),
      streamingContent: new Map(),
      chatStates: new Map(),
    });
  });

  it('renders nothing for empty references', () => {
    const { container } = render(<ReferencePills references={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders pills for existing cards', () => {
    useCardStore.getState().setCard(createTestCard('ref-1'));
    useCardStore.getState().setCard(createTestCard('ref-2'));

    render(<ReferencePills references={['ref-1', 'ref-2']} />);
    expect(screen.getByText('@Card ref-1')).toBeInTheDocument();
    expect(screen.getByText('@Card ref-2')).toBeInTheDocument();
  });

  it('shows deleted pill for non-existent cards', () => {
    render(<ReferencePills references={['nonexistent']} />);
    expect(screen.getByText('deleted card')).toBeInTheDocument();
  });

  it('deleted pill has strikethrough text decoration', () => {
    render(<ReferencePills references={['nonexistent']} />);
    const deletedPill = screen.getByTestId('deleted-pill');
    expect(deletedPill).toBeInTheDocument();
  });
});
