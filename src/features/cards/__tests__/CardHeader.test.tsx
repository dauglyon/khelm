import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardHeader } from '../CardHeader';

function renderHeader(overrides = {}) {
  const props = {
    cardId: 'card-1',
    shortname: 'Test Query',
    type: 'sql' as const,
    status: 'complete' as const,
    onShortnameChange: vi.fn(),
    onOpenChat: vi.fn(),
    onCopy: vi.fn(),
    onPin: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
  return { ...render(<CardHeader {...props} />), props };
}

describe('CardHeader', () => {
  it('renders shortname text', () => {
    renderHeader();
    expect(screen.getByText('Test Query')).toBeInTheDocument();
  });

  it('renders type badge with correct label', () => {
    renderHeader();
    expect(screen.getByText('SQL')).toBeInTheDocument();
  });

  it('renders status indicator', () => {
    renderHeader();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('enters edit mode on click and saves on Enter', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();

    // Click the shortname button to enter edit mode
    await user.click(screen.getByText('Test Query'));

    // Should now show an input
    const input = screen.getByLabelText('Edit card name');
    expect(input).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'New Name');
    await user.keyboard('{Enter}');

    expect(props.onShortnameChange).toHaveBeenCalledWith('New Name');
  });

  it('cancels edit on Escape', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();

    await user.click(screen.getByText('Test Query'));
    const input = screen.getByLabelText('Edit card name');
    await user.type(input, ' extra');
    await user.keyboard('{Escape}');

    expect(props.onShortnameChange).not.toHaveBeenCalled();
    expect(screen.getByText('Test Query')).toBeInTheDocument();
  });

  it('enforces 60 char max on shortname', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByText('Test Query'));
    const input = screen.getByLabelText('Edit card name') as HTMLInputElement;
    expect(input.maxLength).toBe(60);
  });

  it('calls onOpenChat when chat button clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await user.click(screen.getByLabelText('Open chat'));
    expect(props.onOpenChat).toHaveBeenCalled();
  });

  it('calls onCopy when copy button clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await user.click(screen.getByLabelText('Copy card'));
    expect(props.onCopy).toHaveBeenCalled();
  });

  it('shows delete confirmation and calls onDelete on confirm', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();

    await user.click(screen.getByLabelText('Delete card'));
    expect(screen.getByText('Delete?')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Confirm delete'));
    expect(props.onDelete).toHaveBeenCalled();
  });

  it('cancels delete confirmation', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();

    await user.click(screen.getByLabelText('Delete card'));
    expect(screen.getByText('Delete?')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Cancel delete'));
    expect(props.onDelete).not.toHaveBeenCalled();
  });
});
