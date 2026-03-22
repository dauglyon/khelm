import { useRef, useCallback, useEffect } from 'react';
import { useCardStore } from './store';

export interface UseStreamingBufferOptions {
  cardId: string;
  onComplete?: (finalContent: string) => void;
}

export interface UseStreamingBufferReturn {
  appendToken: (token: string) => void;
  finalize: () => void;
  abort: () => void;
  isStreaming: boolean;
}

const FLUSH_INTERVAL_MS = 50;

export function useStreamingBuffer(
  options: UseStreamingBufferOptions
): UseStreamingBufferReturn {
  const { cardId, onComplete } = options;
  const bufferRef = useRef('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalizedRef = useRef(false);
  const streamingRef = useRef(false);
  const accumulatedRef = useRef('');

  const flush = useCallback(() => {
    if (bufferRef.current.length > 0) {
      const chunk = bufferRef.current;
      bufferRef.current = '';
      accumulatedRef.current += chunk;
      useCardStore.getState().appendStreamContent(cardId, chunk);
    }
  }, [cardId]);

  const startInterval = useCallback(() => {
    if (intervalRef.current === null) {
      intervalRef.current = setInterval(flush, FLUSH_INTERVAL_MS);
    }
  }, [flush]);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const appendToken = useCallback(
    (token: string) => {
      if (finalizedRef.current) return;
      bufferRef.current += token;
      streamingRef.current = true;
      startInterval();
    },
    [startInterval]
  );

  const finalize = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    streamingRef.current = false;

    // Final flush
    flush();
    clearIntervalRef();

    useCardStore.getState().finalizeStream(cardId);
    onComplete?.(accumulatedRef.current);
  }, [cardId, flush, clearIntervalRef, onComplete]);

  const abort = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    streamingRef.current = false;

    // Flush remaining buffer
    flush();
    clearIntervalRef();

    useCardStore.getState().finalizeStream(cardId);
  }, [cardId, flush, clearIntervalRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearIntervalRef();
    };
  }, [clearIntervalRef]);

  return {
    appendToken,
    finalize,
    abort,
    get isStreaming() {
      return streamingRef.current;
    },
  };
}
