import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteBody } from './NoteBody';
import { useCardStore } from '../store';

// Mock the store module
vi.mock('../store', () => {
  const updateCard = vi.fn();
  return {
    useCardStore: {
      getState: () => ({ updateCard }),
    },
  };
});

describe('NoteBody', () => {
  let mockUpdateCard: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockUpdateCard = (useCardStore.getState() as unknown as { updateCard: ReturnType<typeof vi.fn> }).updateCard;
    mockUpdateCard.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders editable textarea when isEditable is true', () => {
    render(
      <NoteBody
        content={{ text: 'Hello world' }}
        cardId="c1"
        isEditable={true}
      />
    );
    const textarea = screen.getByLabelText('Note content');
    expect(textarea).toBeDefined();
    expect((textarea as HTMLTextAreaElement).value).toBe('Hello world');
  });

  it('renders read-only paragraph when isEditable is false', () => {
    render(
      <NoteBody
        content={{ text: 'Hello world' }}
        cardId="c1"
        isEditable={false}
      />
    );
    expect(screen.getByText('Hello world')).toBeDefined();
    expect(screen.queryByLabelText('Note content')).toBeNull();
  });

  it('shows placeholder in empty editable state', () => {
    render(
      <NoteBody
        content={{ text: '' }}
        cardId="c1"
        isEditable={true}
      />
    );
    const textarea = screen.getByPlaceholderText('Write a note...');
    expect(textarea).toBeDefined();
  });

  it('shows "No content" in empty read-only state', () => {
    render(
      <NoteBody
        content={{ text: '' }}
        cardId="c1"
        isEditable={false}
      />
    );
    expect(screen.getByText('No content')).toBeDefined();
  });

  it('defaults isEditable to true', () => {
    render(
      <NoteBody content={{ text: 'Hello' }} cardId="c1" />
    );
    expect(screen.getByLabelText('Note content')).toBeDefined();
  });

  it('saves on blur', () => {
    render(
      <NoteBody
        content={{ text: 'original' }}
        cardId="c1"
        isEditable={true}
      />
    );

    const textarea = screen.getByLabelText('Note content');
    fireEvent.change(textarea, { target: { value: 'updated' } });
    fireEvent.blur(textarea);

    expect(mockUpdateCard).toHaveBeenCalledWith('c1', {
      content: { text: 'updated' },
    });
  });

  it('debounces auto-save after 1s of typing', () => {
    render(
      <NoteBody
        content={{ text: 'original' }}
        cardId="c1"
        isEditable={true}
      />
    );

    const textarea = screen.getByLabelText('Note content');
    fireEvent.change(textarea, { target: { value: 'typing...' } });

    // Not saved yet
    expect(mockUpdateCard).not.toHaveBeenCalled();

    // Advance timer past debounce
    vi.advanceTimersByTime(1100);

    expect(mockUpdateCard).toHaveBeenCalledWith('c1', {
      content: { text: 'typing...' },
    });
  });

  it('does not save when text has not changed', () => {
    render(
      <NoteBody
        content={{ text: 'same' }}
        cardId="c1"
        isEditable={true}
      />
    );

    const textarea = screen.getByLabelText('Note content');
    fireEvent.blur(textarea);

    expect(mockUpdateCard).not.toHaveBeenCalled();
  });
});
