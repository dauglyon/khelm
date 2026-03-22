import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreamingBuffer } from '../useStreamingBuffer';
import { useCardStore } from '../store';

describe('useStreamingBuffer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useCardStore.setState({
      cards: new Map(),
      streamingContent: new Map(),
      chatStates: new Map(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('flushes buffered tokens at 50ms interval', () => {
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1' })
    );

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.appendToken(`token${i}`);
      }
    });

    // Before flush
    expect(useCardStore.getState().streamingContent.get('card-1')).toBeUndefined();

    // After flush interval
    act(() => {
      vi.advanceTimersByTime(50);
    });

    const content = useCardStore.getState().streamingContent.get('card-1');
    expect(content).toBe('token0token1token2token3token4token5token6token7token8token9');
  });

  it('flushes at correct intervals - two batches', () => {
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1' })
    );

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.appendToken('a');
      }
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(useCardStore.getState().streamingContent.get('card-1')).toBe('aaaaa');

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.appendToken('b');
      }
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(useCardStore.getState().streamingContent.get('card-1')).toBe('aaaaabbbbb');
  });

  it('finalize does final flush and calls finalizeStream', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1', onComplete })
    );

    act(() => {
      result.current.appendToken('data');
      result.current.finalize();
    });

    // After finalize, streaming content should be cleared
    expect(useCardStore.getState().streamingContent.has('card-1')).toBe(false);
    expect(onComplete).toHaveBeenCalledWith('data');
  });

  it('abort flushes remaining buffer and finalizes', () => {
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1' })
    );

    act(() => {
      result.current.appendToken('partial');
      result.current.abort();
    });

    // After abort, streaming content should be cleared (finalized)
    expect(useCardStore.getState().streamingContent.has('card-1')).toBe(false);
  });

  it('double finalize is safe (idempotent)', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1', onComplete })
    );

    act(() => {
      result.current.appendToken('data');
      result.current.finalize();
      result.current.finalize();
    });

    // onComplete should be called only once
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('lazy start - no streaming content added without appendToken', () => {
    renderHook(() => useStreamingBuffer({ cardId: 'card-1' }));

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // No streaming content should be in store
    expect(useCardStore.getState().streamingContent.has('card-1')).toBe(false);
  });

  it('clears interval on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1' })
    );

    act(() => {
      result.current.appendToken('data');
    });

    unmount();

    // Should not throw or cause issues after unmount
    act(() => {
      vi.advanceTimersByTime(200);
    });
  });
});
