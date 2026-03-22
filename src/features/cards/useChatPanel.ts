/**
 * Top-level hook that connects ChatPanel to the Zustand store and transport.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useCardStore, useCardData, useChatState } from './store';
import { useChatActions } from './useChatActions';
import type { Message, Card } from './types';

export interface UseChatPanelOptions {
  cardId: string;
}

export interface UseChatPanelReturn {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  sendMessage: (text: string) => void;
  abort: () => void;
  retry: () => void;
  isInitialized: boolean;
}

function buildSystemContext(card: Card): string {
  const parts = [`Card type: ${card.type}`];

  if ('query' in card.content) {
    parts.push(`Query: ${(card.content as { query: string }).query}`);
  }
  if ('code' in card.content) {
    parts.push(`Code: ${(card.content as { code: string }).code}`);
  }
  if ('claim' in card.content) {
    parts.push(`Claim: ${(card.content as { claim: string }).claim}`);
  }
  if ('text' in card.content) {
    parts.push(`Note: ${(card.content as { text: string }).text}`);
  }

  if (card.error) {
    parts.push(`Error: ${card.error.code} - ${card.error.message}`);
  }

  if (card.result) {
    if ('rowCount' in card.result) {
      parts.push(
        `Result: ${(card.result as { rowCount: number }).rowCount} rows`
      );
    }
    if ('totalCount' in card.result) {
      parts.push(
        `Result: ${(card.result as { totalCount: number }).totalCount} total results`
      );
    }
  }

  return parts.join('\n');
}

const API_URL = '/api/cards/chat';

export function useChatPanel(
  options: UseChatPanelOptions
): UseChatPanelReturn {
  const { cardId } = options;
  const card = useCardData(cardId);
  const chatState = useChatState(cardId);
  const initializedRef = useRef(false);

  // Initialize chat on first mount if not already done
  useEffect(() => {
    if (!initializedRef.current && card) {
      const store = useCardStore.getState();
      store.initChat(cardId);

      // Inject system context message
      const existing = store.chatStates.get(cardId);
      if (existing && existing.messages.length === 0) {
        const systemMessage: Message = {
          id: crypto.randomUUID(),
          role: 'system',
          content: buildSystemContext(card),
          toolCall: null,
          timestamp: new Date().toISOString(),
          status: 'complete',
        };
        store.setChatMessages(cardId, () => [systemMessage]);
      }
      initializedRef.current = true;
    }
  }, [cardId, card]);

  const setMessages = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      useCardStore.getState().setChatMessages(cardId, updater);
    },
    [cardId]
  );

  const setStreamingContent = useCallback(
    (content: string) => {
      useCardStore.getState().setChatStreamingContent(cardId, content);
    },
    [cardId]
  );

  const setIsStreaming = useCallback(
    (streaming: boolean) => {
      useCardStore.getState().setChatIsStreaming(cardId, streaming);
    },
    [cardId]
  );

  const setError = useCallback(
    (error: string | null) => {
      useCardStore.getState().setChatError(cardId, error);
    },
    [cardId]
  );

  const cardContext = card
    ? {
        cardId: card.id,
        cardType: card.type,
        content: card.content,
        result: card.result,
        error: card.error,
      }
    : {
        cardId,
        cardType: 'note' as const,
        content: { text: '' },
        result: null,
        error: null,
      };

  const { sendMessage, abort, retry } = useChatActions({
    cardId,
    messages: chatState?.messages ?? [],
    setMessages,
    setStreamingContent,
    setIsStreaming,
    setError,
    cardContext,
    apiUrl: API_URL,
  });

  // Handle tool calls by updating the card
  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  return {
    messages: chatState?.messages ?? [],
    isStreaming: chatState?.isStreaming ?? false,
    streamingContent: chatState?.streamingContent ?? '',
    error: chatState?.error ?? null,
    sendMessage: handleSendMessage,
    abort,
    retry,
    isInitialized: initializedRef.current,
  };
}
