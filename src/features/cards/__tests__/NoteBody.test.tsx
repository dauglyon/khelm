import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteBody } from '../bodies/NoteBody';
import { useCardStore } from '../store';
import type { Card } from '../types';

describe('NoteBody', () => {
  beforeEach(() => {
    useCardStore.setState({
      cards: new Map(),
      streamingContent: new Map(),
      chatStates: new Map(),
    });
  });

  it('renders textarea with content text', () => {
    render(<NoteBody content={{ text: 'Hello world' }} cardId="card-1" />);
    expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
  });

  it('shows placeholder when text is empty', () => {
    render(<NoteBody content={{ text: '' }} cardId="card-1" />);
    expect(screen.getByPlaceholderText('Write a note...')).toBeInTheDocument();
  });

  it('updates store on blur with changed text', () => {
    // Set up a card in the store to verify update
    const card: Card = {
      id: 'card-1',
      shortname: 'Test',
      type: 'note',
      status: 'complete',
      content: { text: 'original' },
      result: null,
      error: null,
      references: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'user-1',
      lockedBy: null,
      sessionId: 'session-1',
    };
    useCardStore.getState().setCard(card);

    render(<NoteBody content={{ text: 'original' }} cardId="card-1" />);

    const textarea = screen.getByDisplayValue('original');
    fireEvent.change(textarea, { target: { value: 'updated' } });
    fireEvent.blur(textarea);

    // Verify the store was updated
    const updatedCard = useCardStore.getState().cards.get('card-1');
    expect(updatedCard?.content).toEqual({ text: 'updated' });
  });

  it('does not update store on blur if text unchanged', () => {
    const card: Card = {
      id: 'card-1',
      shortname: 'Test',
      type: 'note',
      status: 'complete',
      content: { text: 'same' },
      result: null,
      error: null,
      references: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'user-1',
      lockedBy: null,
      sessionId: 'session-1',
    };
    useCardStore.getState().setCard(card);

    render(<NoteBody content={{ text: 'same' }} cardId="card-1" />);

    const textarea = screen.getByDisplayValue('same');
    fireEvent.blur(textarea);

    // Content should remain unchanged (updatedAt may still be original)
    const current = useCardStore.getState().cards.get('card-1');
    expect(current?.content).toEqual({ text: 'same' });
  });
});
