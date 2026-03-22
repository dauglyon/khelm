import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { StreamingContent } from '../StreamingContent';
import { useStreamingBuffer } from '../useStreamingBuffer';
import { useCardStore } from '../store';

describe('Card Streaming Integration', () => {
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

  it('streams tokens and accumulates in store', () => {
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1' })
    );

    act(() => {
      result.current.appendToken('Hello ');
      result.current.appendToken('world');
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(useCardStore.getState().streamingContent.get('card-1')).toBe('Hello world');
  });

  it('flushes at 50ms intervals', () => {
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1' })
    );

    act(() => {
      result.current.appendToken('batch1');
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(useCardStore.getState().streamingContent.get('card-1')).toBe('batch1');

    act(() => {
      result.current.appendToken('batch2');
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(useCardStore.getState().streamingContent.get('card-1')).toBe('batch1batch2');
  });

  it('finalizeStream clears streaming state', () => {
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1' })
    );

    act(() => {
      result.current.appendToken('data');
      result.current.finalize();
    });

    expect(useCardStore.getState().streamingContent.has('card-1')).toBe(false);
  });

  it('abort preserves partial content', () => {
    const { result } = renderHook(() =>
      useStreamingBuffer({ cardId: 'card-1' })
    );

    act(() => {
      result.current.appendToken('partial');
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Content is flushed to store
    expect(useCardStore.getState().streamingContent.get('card-1')).toBe('partial');

    act(() => {
      result.current.abort();
    });

    // After abort, finalizeStream clears it
    expect(useCardStore.getState().streamingContent.has('card-1')).toBe(false);
  });

  it('StreamingContent shows cursor during streaming', () => {
    render(
      <StreamingContent
        cardId="card-1"
        content="Streaming text"
        isStreaming={true}
        cardType="sql"
      />
    );
    expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument();
  });

  it('StreamingContent hides cursor when not streaming', () => {
    render(
      <StreamingContent
        cardId="card-1"
        content="Final text"
        isStreaming={false}
        cardType="sql"
      />
    );
    expect(screen.queryByTestId('streaming-cursor')).not.toBeInTheDocument();
  });
});
