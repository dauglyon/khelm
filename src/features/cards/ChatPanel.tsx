import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, m } from 'motion/react';
import { IconButton } from '@/common/components/IconButton';
import { Icon } from '@/common/components/Icon';
import { Button } from '@/common/components/Button';
import { ChatMessage } from './ChatMessage';
import type { Message } from './types';
import {
  panelContainer,
  panelHeader,
  messageList,
  inputArea,
  chatInput,
  actionBar,
} from './ChatPanel.css';

export interface ChatPanelProps {
  cardId: string;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  onSendMessage: (text: string) => void;
  onAbort: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  error,
  onSendMessage,
  onAbort,
  onRetry,
  onClose,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = messageListRef.current;
    if (el && !userScrolledUpRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = messageListRef.current;
    if (el) {
      const isNearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
      userScrolledUpRef.current = !isNearBottom;
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (trimmed && !isStreaming) {
      onSendMessage(trimmed);
      setInputText('');
      userScrolledUpRef.current = false;
    }
  }, [inputText, isStreaming, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [handleSend, onClose]
  );

  // Visible messages (filter out system)
  const visibleMessages = messages.filter((m) => m.role !== 'system');
  const showRetry = !isStreaming && (!!error || visibleMessages.length > 0);

  return (
    <AnimatePresence>
      <m.div
        className={panelContainer}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        role="complementary"
        aria-label="Chat panel"
      >
        <div className={panelHeader}>
          <span>Chat</span>
          <IconButton
            icon={<Icon name="close" size={16} />}
            aria-label="Close chat panel"
            variant="ghost"
            size="sm"
            color="neutral"
            onClick={onClose}
          />
        </div>

        <div
          ref={messageListRef}
          className={messageList}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
        >
          {visibleMessages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={idx === visibleMessages.length - 1}
            />
          ))}
        </div>

        <div className={inputArea}>
          <input
            ref={inputRef}
            className={chatInput}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Type a message..."
            aria-label="Chat message input"
          />
          <IconButton
            icon={<Icon name="send" size={16} />}
            aria-label="Send message"
            variant="ghost"
            size="sm"
            color="primary"
            onClick={handleSend}
            disabled={isStreaming || !inputText.trim()}
          />
        </div>

        <div className={actionBar}>
          {isStreaming && (
            <Button size="sm" variant="outline" color="danger" onClick={onAbort}>
              Abort
            </Button>
          )}
          {showRetry && (
            <Button size="sm" variant="outline" color="neutral" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </m.div>
    </AnimatePresence>
  );
}
