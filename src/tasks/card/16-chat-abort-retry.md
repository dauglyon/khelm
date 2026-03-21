# Task 16: Chat Abort and Retry

## Dependencies

- **14-chat-panel-layout**: `ChatPanel` component (Abort/Retry buttons)
- **15-chat-transport**: `streamChat` function

## Context

The chat panel supports two recovery actions (architecture/card.md > Inline Chat Panel > Chat Data Flow):
- **Abort**: User clicks abort during streaming. `AbortController.abort()` cancels the fetch. Partial AI response is kept with a "stopped" indicator.
- **Retry**: User clicks retry. Overwrites the last AI message. Resubmits the conversation (sliced before last assistant message) to the backend.

This task implements the abort and retry logic as a standalone hook that coordinates between the transport and the message state.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/useChatActions.ts`** (~90 lines)
2. **`src/features/cards/__tests__/useChatActions.test.ts`** (~100 lines)

### Hook: useChatActions

```typescript
interface UseChatActionsOptions {
  cardId: string;
  messages: Message[];
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  setStreamingContent: (content: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  cardContext: ChatStreamOptions['cardContext'];
  apiUrl: string;
}

interface UseChatActionsReturn {
  sendMessage: (text: string) => void;
  abort: () => void;
  retry: () => void;
}
```

### Send Message Flow

1. Create user `Message` with `status: 'complete'`
2. Append to messages (optimistic UI -- shown immediately)
3. Create `AbortController`, store in ref
4. Set `isStreaming: true`
5. Create placeholder assistant `Message` with `status: 'streaming'`
6. Call `streamChat` with:
   - `onToken`: append to streaming content buffer (via `setStreamingContent`)
   - `onToolCall`: dispatch tool call action (set on message)
   - `onComplete`: update assistant message status to `'complete'`, set final content, `isStreaming: false`
   - `onError`: update assistant message status to `'error'`, set error, `isStreaming: false`
   - `signal`: from AbortController

### Abort Flow (per architecture spec)

1. Call `abortController.abort()` on the current controller
2. In the `streamChat` catch block, `AbortError` is silently caught
3. Keep partial streaming content as the assistant message content
4. Set assistant message `status: 'aborted'`
5. Set `isStreaming: false`
6. Clear streaming content (it has been committed to the message)

### Retry Flow (per architecture spec)

1. Find the last assistant message in the array
2. Slice the message array to remove it (overwrite mode, no branching)
3. Resubmit the sliced conversation to `streamChat`
4. Follow the same flow as Send Message (streaming placeholder, etc.)

### AbortController Management

- One `AbortController` ref per hook instance
- Created fresh on each `sendMessage` or `retry`
- Previous controller is NOT aborted on new send (only explicit abort)
- Ref cleared after stream completes or errors

## Demo Reference

**Vignette 1**: User sends a message. AI starts streaming. User clicks Abort. Streaming stops. Partial response shows with "(stopped)" indicator. User can now type a new message or click Retry.

**Vignette 2**: AI response has an error. User clicks Retry. The last assistant message is removed. A new streaming response begins. This time it completes successfully.

## Integration Proofs

1. **Send message test**: Call `sendMessage('hello')`. Assert user message appended to messages. Assert `streamChat` called with correct messages array.
2. **Optimistic UI test**: Call `sendMessage`. Assert user message appears in messages BEFORE `streamChat` resolves.
3. **Abort test**: Call `sendMessage`, then `abort()`. Assert AbortController was aborted. Assert last assistant message status is `'aborted'`. Assert `isStreaming` is false.
4. **Partial content preserved test**: Stream 5 tokens, abort. Assert assistant message content contains the 5 tokens.
5. **Retry test**: Have messages with a user message and an errored assistant message. Call `retry()`. Assert last assistant message is removed from array. Assert `streamChat` called with messages without the assistant message.
6. **Retry after abort test**: Send, abort, retry. Assert retry works correctly with sliced messages.
7. **Double abort test**: Call `abort()` twice. Assert no error thrown.
8. **Error handling test**: Mock `streamChat` to call `onError`. Assert assistant message status is `'error'`. Assert error message set.

## Acceptance Criteria

- [ ] `sendMessage` creates user message optimistically and starts stream
- [ ] `sendMessage` creates placeholder assistant message with streaming status
- [ ] `abort` cancels the AbortController
- [ ] `abort` preserves partial content in assistant message
- [ ] `abort` sets message status to 'aborted'
- [ ] `retry` removes last assistant message
- [ ] `retry` resubmits sliced conversation
- [ ] AbortController created fresh for each send/retry
- [ ] Double abort is safe (idempotent)
- [ ] `isStreaming` set to false on complete, error, or abort
- [ ] All tests pass

## Anti-Patterns

- Do not implement message branching -- retry is overwrite-only per spec
- Do not auto-retry on error -- retry is user-initiated only
- Do not abort previous stream on new send -- only explicit abort button
- Do not store AbortController in Zustand -- use a local ref
- Do not clear message history on abort -- keep all messages including partial
