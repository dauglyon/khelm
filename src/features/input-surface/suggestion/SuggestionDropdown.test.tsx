import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createRef } from 'react';
import { SuggestionDropdown } from './SuggestionDropdown';
import type { SuggestionCard, SuggestionDropdownRef } from './SuggestionDropdown';

// Mock createPortal to render inline for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

const mockCards: SuggestionCard[] = [
  { id: '1', shortname: 'query-1', title: 'Soil ecosystem query', type: 'sql' },
  { id: '2', shortname: 'python-1', title: 'Phylum analysis', type: 'python' },
  { id: '3', shortname: 'note-1', title: 'QC check reminder', type: 'note' },
  { id: '4', shortname: 'lit-1', title: 'CRISPR papers', type: 'literature' },
  { id: '5', shortname: 'hyp-1', title: 'pH correlation', type: 'hypothesis' },
];

describe('SuggestionDropdown', () => {
  let command: (item: SuggestionCard) => void;

  beforeEach(() => {
    command = vi.fn<(item: SuggestionCard) => void>();
  });

  it('renders items with shortname and title', () => {
    render(
      <SuggestionDropdown items={mockCards} command={command} />
    );

    expect(screen.getByText('@query-1')).toBeTruthy();
    expect(screen.getByText('Soil ecosystem query')).toBeTruthy();
    expect(screen.getByText('@python-1')).toBeTruthy();
    expect(screen.getByText('Phylum analysis')).toBeTruthy();
  });

  it('shows "No matching cards" when items is empty', () => {
    render(
      <SuggestionDropdown items={[]} command={command} />
    );

    expect(screen.getByText('No matching cards')).toBeTruthy();
  });

  it('limits visible items to 8', () => {
    const manyCards: SuggestionCard[] = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      shortname: `card-${i}`,
      title: `Card title ${i}`,
      type: 'note' as const,
    }));

    render(
      <SuggestionDropdown items={manyCards} command={command} />
    );

    const items = screen.getAllByRole('option');
    expect(items.length).toBe(8);
  });

  it('calls command when an item is clicked', () => {
    render(
      <SuggestionDropdown items={mockCards} command={command} />
    );

    fireEvent.click(screen.getByText('@query-1'));
    expect(command).toHaveBeenCalledWith(mockCards[0]);
  });

  it('highlights first item by default', () => {
    render(
      <SuggestionDropdown items={mockCards} command={command} />
    );

    const items = screen.getAllByRole('option');
    expect(items[0].getAttribute('aria-selected')).toBe('true');
  });

  it('handles keyboard navigation via ref', () => {
    const ref = createRef<SuggestionDropdownRef>();

    render(
      <SuggestionDropdown ref={ref} items={mockCards} command={command} />
    );

    const handled = ref.current?.onKeyDown({
      event: new KeyboardEvent('keydown', { key: 'ArrowDown' }),
    });
    expect(handled).toBe(true);
    expect(ref.current).toBeTruthy();
  });

  it('handles Enter key to select item via ref', () => {
    const ref = createRef<SuggestionDropdownRef>();

    render(
      <SuggestionDropdown ref={ref} items={mockCards} command={command} />
    );

    const handled = ref.current?.onKeyDown({
      event: new KeyboardEvent('keydown', { key: 'Enter' }),
    });
    expect(handled).toBe(true);
    expect(command).toHaveBeenCalledWith(mockCards[0]);
  });

  it('handles Escape key via ref', () => {
    const ref = createRef<SuggestionDropdownRef>();

    render(
      <SuggestionDropdown ref={ref} items={mockCards} command={command} />
    );

    const handled = ref.current?.onKeyDown({
      event: new KeyboardEvent('keydown', { key: 'Escape' }),
    });
    expect(handled).toBe(true);
    expect(command).not.toHaveBeenCalled();
  });

  it('shows type color indicator for each item', () => {
    const { container } = render(
      <SuggestionDropdown items={mockCards} command={command} />
    );

    const indicators = container.querySelectorAll('[style]');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('wraps around when navigating past last item', () => {
    const ref = createRef<SuggestionDropdownRef>();
    const twoCards = mockCards.slice(0, 2);

    render(
      <SuggestionDropdown ref={ref} items={twoCards} command={command} />
    );

    act(() => {
      ref.current?.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    act(() => {
      ref.current?.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    act(() => {
      ref.current?.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'Enter' }) });
    });
    expect(command).toHaveBeenCalledWith(twoCards[0]);
  });

  it('wraps around when navigating before first item', () => {
    const ref = createRef<SuggestionDropdownRef>();
    const twoCards = mockCards.slice(0, 2);

    render(
      <SuggestionDropdown ref={ref} items={twoCards} command={command} />
    );

    act(() => {
      ref.current?.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowUp' }) });
    });
    act(() => {
      ref.current?.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'Enter' }) });
    });
    expect(command).toHaveBeenCalledWith(twoCards[1]);
  });
});
