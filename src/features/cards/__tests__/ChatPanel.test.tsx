import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from '../ChatPanel';
import type { Message } from '../types';

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Why did this fail?',
    toolCall: null,
    timestamp: '2024-01-01T00:00:00Z',
    status: 'complete',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'The query has a syntax error.',
    toolCall: null,
    timestamp: '2024-01-01T00:01:00Z',
    status: 'complete',
  },
  {
    id: '3',
    role: 'system',
    content: 'System context',
    toolCall: null,
    timestamp: '2024-01-01T00:00:00Z',
    status: 'complete',
  },
];

function renderPanel(overrides = {}) {
  const props = {
    cardId: 'card-1',
    messages: mockMessages,
    isStreaming: false,
    streamingContent: '',
    error: null,
    onSendMessage: vi.fn(),
    onAbort: vi.fn(),
    onRetry: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  return { ...render(<ChatPanel {...props} />), props };
}

describe('ChatPanel', () => {
  it('renders visible messages (user and assistant)', () => {
    renderPanel();
    expect(screen.getByText('Why did this fail?')).toBeInTheDocument();
    expect(screen.getByText('The query has a syntax error.')).toBeInTheDocument();
  });

  it('hides system messages', () => {
    renderPanel();
    expect(screen.queryByText('System context')).not.toBeInTheDocument();
  });

  it('sends message on Enter', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();

    const input = screen.getByLabelText('Chat message input');
    await user.type(input, 'hello{Enter}');
    expect(props.onSendMessage).toHaveBeenCalledWith('hello');
  });

  it('sends message on send button click', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();

    const input = screen.getByLabelText('Chat message input');
    await user.type(input, 'test message');
    await user.click(screen.getByLabelText('Send message'));
    expect(props.onSendMessage).toHaveBeenCalledWith('test message');
  });

  it('disables input during streaming', () => {
    renderPanel({ isStreaming: true });
    const input = screen.getByLabelText('Chat message input');
    expect(input).toBeDisabled();
  });

  it('shows Abort button during streaming', () => {
    renderPanel({ isStreaming: true });
    expect(screen.getByText('Abort')).toBeInTheDocument();
  });

  it('calls onAbort when Abort clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel({ isStreaming: true });
    await user.click(screen.getByText('Abort'));
    expect(props.onAbort).toHaveBeenCalled();
  });

  it('shows Retry button when not streaming', () => {
    renderPanel({ isStreaming: false });
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls onRetry when Retry clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel({ isStreaming: false });
    await user.click(screen.getByText('Retry'));
    expect(props.onRetry).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();
    await user.click(screen.getByLabelText('Close chat panel'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls onClose on Escape key', () => {
    const { props } = renderPanel();
    const input = screen.getByLabelText('Chat message input');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('focuses input on mount', () => {
    renderPanel();
    expect(screen.getByLabelText('Chat message input')).toHaveFocus();
  });
});
