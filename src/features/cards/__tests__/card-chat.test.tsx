import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from '../ChatPanel';
import type { Message } from '../types';

function createMockMessages(): Message[] {
  return [
    {
      id: '1',
      role: 'system',
      content: 'System context',
      toolCall: null,
      timestamp: '2024-01-01T00:00:00Z',
      status: 'complete',
    },
    {
      id: '2',
      role: 'user',
      content: 'Why did this fail?',
      toolCall: null,
      timestamp: '2024-01-01T00:01:00Z',
      status: 'complete',
    },
    {
      id: '3',
      role: 'assistant',
      content: 'The query has a syntax error.',
      toolCall: null,
      timestamp: '2024-01-01T00:02:00Z',
      status: 'complete',
    },
  ];
}

function renderChatPanel(overrides: Partial<{
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}> = {}) {
  const onSendMessage = vi.fn<(text: string) => void>();
  const onAbort = vi.fn<() => void>();
  const onRetry = vi.fn<() => void>();
  const onClose = vi.fn<() => void>();

  const result = render(
    <ChatPanel
      cardId="card-1"
      messages={overrides.messages ?? createMockMessages()}
      isStreaming={overrides.isStreaming ?? false}
      streamingContent={overrides.streamingContent ?? ''}
      error={overrides.error ?? null}
      onSendMessage={onSendMessage}
      onAbort={onAbort}
      onRetry={onRetry}
      onClose={onClose}
    />
  );

  return { ...result, onSendMessage, onAbort, onRetry, onClose };
}

describe('Card Chat Integration', () => {
  it('opens chat panel and focuses input', () => {
    renderChatPanel();
    expect(screen.getByLabelText('Chat message input')).toHaveFocus();
  });

  it('renders user and assistant messages, hides system', () => {
    renderChatPanel();
    expect(screen.getByText('Why did this fail?')).toBeInTheDocument();
    expect(screen.getByText('The query has a syntax error.')).toBeInTheDocument();
    expect(screen.queryByText('System context')).not.toBeInTheDocument();
  });

  it('sends message via input', async () => {
    const user = userEvent.setup();
    const { onSendMessage } = renderChatPanel({ messages: [] });

    await user.type(screen.getByLabelText('Chat message input'), 'Fix this');
    await user.keyboard('{Enter}');
    expect(onSendMessage).toHaveBeenCalledWith('Fix this');
  });

  it('shows abort button during streaming', () => {
    renderChatPanel({ isStreaming: true, streamingContent: 'partial...' });
    expect(screen.getByText('Abort')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat message input')).toBeDisabled();
  });

  it('calls onAbort when abort clicked', async () => {
    const user = userEvent.setup();
    const { onAbort } = renderChatPanel({ isStreaming: true });

    await user.click(screen.getByText('Abort'));
    expect(onAbort).toHaveBeenCalled();
  });

  it('shows retry button after completion', () => {
    renderChatPanel();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls onRetry when retry clicked', async () => {
    const user = userEvent.setup();
    const { onRetry } = renderChatPanel({ error: 'Something failed' });

    await user.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('closes panel and reopens with persisted messages', () => {
    const messages = createMockMessages();
    const { rerender, onSendMessage, onAbort, onRetry, onClose } = renderChatPanel({ messages });

    expect(screen.getByText('Why did this fail?')).toBeInTheDocument();

    rerender(
      <ChatPanel
        cardId="card-1"
        messages={messages}
        isStreaming={false}
        streamingContent=""
        error={null}
        onSendMessage={onSendMessage}
        onAbort={onAbort}
        onRetry={onRetry}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Why did this fail?')).toBeInTheDocument();
  });
});
