import type { Message } from './types';
import {
  userMessage,
  assistantMessage,
  errorMessage,
  pendingMessage,
  abortedSuffix,
} from './ChatPanel.css';
import { cursor } from './StreamingContent.css';

export interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  // System messages are hidden
  if (message.role === 'system') return null;

  const isUser = message.role === 'user';
  const baseClass = isUser ? userMessage : assistantMessage;

  const statusClasses = [
    baseClass,
    message.status === 'error' ? errorMessage : undefined,
    message.status === 'pending' ? pendingMessage : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={statusClasses} data-testid={`chat-message-${message.role}`}>
      <span>{message.content}</span>
      {message.status === 'streaming' && isLatest && (
        <span className={cursor} data-testid="chat-cursor" />
      )}
      {message.status === 'aborted' && (
        <span className={abortedSuffix}>(stopped)</span>
      )}
    </div>
  );
}
