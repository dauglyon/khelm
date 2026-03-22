/**
 * Hook for chat send/abort/retry actions.
 * Coordinates between transport (streamChat) and message state.
 */

import { useRef, useCallback } from 'react';
import { streamChat, type ChatStreamOptions } from './chatStream';
import type { Message } from './types';

export interface UseChatActionsOptions {
  cardId: string;
  messages: Message[];
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  setStreamingContent: (content: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  cardContext: ChatStreamOptions['cardContext'];
  apiUrl: string;
}

export interface UseChatActionsReturn {
  sendMessage: (text: string) => void;
  abort: () => void;
  retry: () => void;
}

export function useChatActions(
  options: UseChatActionsOptions
): UseChatActionsReturn {
  const {
    messages,
    setMessages,
    setStreamingContent,
    setIsStreaming,
    setError,
    cardContext,
    apiUrl,
  } = options;

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingContentRef = useRef('');

  const startStream = useCallback(
    (messagesForStream: Message[]) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const assistantId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        toolCall: null,
        timestamp: new Date().toISOString(),
        status: 'streaming',
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(true);
      setError(null);
      streamingContentRef.current = '';

      streamChat({
        url: apiUrl,
        messages: messagesForStream,
        cardContext,
        signal: controller.signal,
        onToken: (token) => {
          streamingContentRef.current += token;
          setStreamingContent(streamingContentRef.current);
          // Update the assistant message content in real time
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: streamingContentRef.current }
                : m
            )
          );
        },
        onToolCall: (toolCall) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, toolCall } : m
            )
          );
        },
        onComplete: (fullContent) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: fullContent, status: 'complete' }
                : m
            )
          );
          setIsStreaming(false);
          setStreamingContent('');
          abortControllerRef.current = null;
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, status: 'error', content: streamingContentRef.current }
                : m
            )
          );
          setIsStreaming(false);
          setError(err.message);
          setStreamingContent('');
          abortControllerRef.current = null;
        },
      }).catch(() => {
        // AbortError handled inside streamChat
      });
    },
    [apiUrl, cardContext, setMessages, setStreamingContent, setIsStreaming, setError]
  );

  const sendMessage = useCallback(
    (text: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        toolCall: null,
        timestamp: new Date().toISOString(),
        status: 'complete',
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(() => updatedMessages);
      startStream(updatedMessages);
    },
    [messages, setMessages, startStream]
  );

  const abort = useCallback(() => {
    const controller = abortControllerRef.current;
    if (controller) {
      controller.abort();
      abortControllerRef.current = null;

      // Commit partial content to the assistant message
      const partialContent = streamingContentRef.current;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.status === 'streaming') {
          return prev.map((m) =>
            m.id === last.id
              ? { ...m, content: partialContent, status: 'aborted' as const }
              : m
          );
        }
        return prev;
      });
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [setMessages, setIsStreaming, setStreamingContent]);

  const retry = useCallback(() => {
    // Remove the last assistant message and resubmit
    const sliced = messages.filter((_, idx) => {
      if (idx === messages.length - 1 && messages[idx].role === 'assistant') {
        return false;
      }
      return true;
    });

    setMessages(() => sliced);
    startStream(sliced);
  }, [messages, setMessages, startStream]);

  return { sendMessage, abort, retry };
}
