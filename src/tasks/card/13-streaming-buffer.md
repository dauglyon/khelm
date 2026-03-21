# Task 13: Streaming Buffer Integration

## Dependencies

- **02-card-store**: `appendStreamContent`, `finalizeStream`, `clearStreamContent`, `useCardStreamingContent`
- **12-streaming-content**: `StreamingContent` component
- **workspace**: `streamBuffers` map, `flushStreamBuffer` action from workspace store

## Context

The architecture spec (card.md > Streaming Content Rendering > Architecture) prescribes a specific token buffering pattern to avoid render thrashing: tokens arrive from SSE, accumulate in a plain JS variable (not React state), and are flushed to Zustand at 50ms intervals (20 flushes/sec). On stream completion, the buffer content moves to the card's `result` field and the streaming state is cleared.

This task wires the SSE token flow to the card store and streaming renderer. It does NOT implement the SSE transport itself (that is task 15 for chat; card execution streaming comes from the workspace/execution layer).

## Implementation Requirements

### Files to Create

1. **`src/features/cards/useStreamingBuffer.ts`** (~70 lines)
2. **`src/features/cards/__tests__/useStreamingBuffer.test.ts`** (~80 lines)

### Hook: useStreamingBuffer

```typescript
interface UseStreamingBufferOptions {
  cardId: string;
  onComplete?: (finalContent: string) => void;
}

interface UseStreamingBufferReturn {
  appendToken: (token: string) => void;
  finalize: () => void;
  abort: () => void;
  isStreaming: boolean;
}

function useStreamingBuffer(options: UseStreamingBufferOptions): UseStreamingBufferReturn;
```

### Buffer Pattern (per architecture spec)

| Step | Location | Detail |
|------|----------|--------|
| 1. Token arrives | Outside React | `appendToken` is called (by SSE handler, chat transport, etc.) |
| 2. Token buffered | Plain JS variable | Token appended to a mutable string ref (`useRef<string>('')`). No React re-render. |
| 3. Flush interval | `setInterval` at 50ms | Every 50ms, if buffer is non-empty: call `store.appendStreamContent(cardId, buffer)`, then clear the buffer ref. |
| 4. React subscriber | Zustand selector | Card body subscribes to `useCardStreamingContent(cardId)`, re-renders at max 20fps. |
| 5. Stream ends | `finalize()` call | Final flush of remaining buffer. Call `store.finalizeStream(cardId)`. Clear interval. Call `onComplete` if provided. |
| 6. Abort | `abort()` call | Flush remaining buffer. Finalize with current content. Clear interval. |

### Lifecycle

- `setInterval` starts when `appendToken` is first called (lazy start)
- Interval is cleared on `finalize()`, `abort()`, or component unmount
- Guard against double-finalize (idempotent)
- `useEffect` cleanup clears the interval on unmount

### Integration with Card Body Renderers

Card body components (SQL, Python, Hypothesis) use streaming like this:

```tsx
// In a body component:
const streamingContent = useCardStreamingContent(cardId);
const isStreaming = streamingContent !== undefined;

return (
  <>
    {/* ... content/code display ... */}
    {(isStreaming || result) && (
      <StreamingContent
        cardId={cardId}
        content={isStreaming ? streamingContent : result.analysis}
        isStreaming={isStreaming}
        cardType={type}
      />
    )}
  </>
);
```

## Demo Reference

**Vignette 1**: Backend sends 200 tokens over 2 seconds for a Hypothesis analysis. Tokens arrive individually via SSE. The buffer accumulates ~10 tokens every 50ms, then flushes to the store. The StreamingContent component re-renders ~40 times total (not 200 times), showing smooth text flow.

**Vignette 2**: User aborts a streaming card. The `abort` function is called. Remaining buffered tokens are flushed. The card shows partial content with a "stopped" indicator. Content is preserved, not lost.

## Integration Proofs

1. **Buffer flush test**: Create the hook. Call `appendToken` 10 times rapidly. Advance timers by 50ms. Assert `store.appendStreamContent` was called once with all 10 tokens concatenated.
2. **Flush interval test**: Call `appendToken` 5 times, advance 50ms, call `appendToken` 5 more times, advance 50ms. Assert `appendStreamContent` was called exactly twice.
3. **Finalize test**: Append tokens, call `finalize()`. Assert `store.finalizeStream(cardId)` was called. Assert interval is cleared (no more flushes after finalize).
4. **Abort test**: Append tokens, call `abort()`. Assert remaining buffer was flushed. Assert `finalizeStream` called.
5. **Double finalize test**: Call `finalize()` twice. Assert no error thrown, `finalizeStream` called only once.
6. **Unmount cleanup test**: Mount hook, append tokens, unmount. Assert interval is cleared.
7. **Lazy start test**: Create hook but do not call `appendToken`. Advance timers. Assert no interval fires.

## Acceptance Criteria

- [ ] Token buffer accumulates in a plain JS ref (not React state)
- [ ] Flush interval runs at 50ms (20 flushes/sec)
- [ ] Flush writes accumulated buffer to Zustand store via `appendStreamContent`
- [ ] `finalize()` does final flush, calls `finalizeStream`, clears interval
- [ ] `abort()` flushes remaining buffer and finalizes
- [ ] Interval starts lazily on first `appendToken` call
- [ ] Interval cleared on finalize, abort, and unmount
- [ ] Double finalize is safe (idempotent)
- [ ] `onComplete` callback fires on finalize
- [ ] All tests pass using fake timers

## Anti-Patterns

- Do not use `useState` for the buffer -- it causes per-token re-renders
- Do not use `requestAnimationFrame` instead of `setInterval` -- 50ms interval is the spec
- Do not flush on every token -- accumulate and batch at 50ms
- Do not forget to clear the interval on unmount -- memory leak
- Do not call store actions inside the token callback -- only in the flush
