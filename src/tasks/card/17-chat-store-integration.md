# Task 17: Chat Store Integration

## Dependencies

- **02-card-store**: `chatStates` map, `initChat`, `clearChat`
- **14-chat-panel-layout**: `ChatPanel` component
- **15-chat-transport**: `streamChat` function
- **16-chat-abort-retry**: `useChatActions` hook

## Context

This task wires the chat panel, transport, and abort/retry logic into the Zustand store. The chat state is keyed by card ID (architecture/card.md > Inline Chat Panel > Implementation): `{ messages, streamingContent, isStreaming, error }`. Chat is initialized lazily when the panel opens. This task also handles the system context injection (card type, query, error details) as a hidden system message.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/useChatPanel.ts`** (~100 lines)
2. **`src/features/cards/__tests__/useChatPanel.test.ts`** (~100 lines)

### Hook: useChatPanel

This is the top-level hook that connects the ChatPanel component to the store and transport.

```typescript
interface UseChatPanelOptions {
  cardId: string;
}

interface UseChatPanelReturn {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  sendMessage: (text: string) => void;
  abort: () => void;
  retry: () => void;
  isInitialized: boolean;
}

function useChatPanel(options: UseChatPanelOptions): UseChatPanelReturn;
```

### Store Integration

| Concern | Implementation |
|---------|---------------|
| Initialize | On first hook mount (panel open), call `store.initChat(cardId)` if not already initialized |
| Read state | Subscribe to `store.chatStates.get(cardId)` via selector |
| Write messages | `useChatActions` writes to store via `store.setChatMessages(cardId, messages)` |
| Write streaming | `useChatActions` writes to `store.setChatStreamingContent(cardId, content)` |
| Write isStreaming | `useChatActions` writes to `store.setChatIsStreaming(cardId, bool)` |
| Write error | `useChatActions` writes to `store.setChatError(cardId, error)` |
| Cleanup | On panel close, streaming content is cleared but messages are preserved |

### Store Actions to Add (extend card store from task 02)

```typescript
// New actions for chat state management
setChatMessages: (cardId: string, updater: (prev: Message[]) => Message[]) => void;
setChatStreamingContent: (cardId: string, content: string) => void;
setChatIsStreaming: (cardId: string, isStreaming: boolean) => void;
setChatError: (cardId: string, error: string | null) => void;
```

### System Context Injection

When chat is initialized, inject a hidden system message (architecture/card.md > Chat Data Flow > Open):

```typescript
const systemMessage: Message = {
  id: generateId(),
  role: 'system',
  content: buildSystemContext(card), // card type, original query, error details, data source, result summary
  toolCall: null,
  timestamp: new Date().toISOString(),
  status: 'complete',
};
```

The `buildSystemContext` function creates a text summary including:
- Card type
- Original content (query text, code, claim, etc.)
- Current error (if any)
- Data source (if applicable)
- Result summary (row count, etc., if available)

This message is NOT visible to the user (system role filtered in ChatPanel).

### Tool Call Dispatch

When `onToolCall` fires from the transport (task 15), the hook dispatches the action:
- `retry_query`: update card content and re-execute
- `modify_code`: update card content with modified code
- Other tool calls: log warning, ignore

Tool call dispatch updates the card via `store.updateCard(cardId, ...)` and triggers re-execution (sets status to `thinking`).

## Demo Reference

**Vignette 1**: User opens chat on an errored SQL card. System context is injected (hidden): "Card type: SQL. Query: SELECT ... Error: syntax error at position 42." User types "Fix the syntax error." AI responds with a tool call `{ name: 'modify_code', params: { query: 'SELECT ...' } }`. The card updates with the new query and re-executes.

**Vignette 2**: User closes and re-opens the chat panel. Previous messages are still visible (persisted in store). The system context message is not re-injected (chat is already initialized).

## Integration Proofs

1. **Init test**: Mount `useChatPanel`. Assert `store.initChat(cardId)` called. Assert system message injected in store.
2. **No re-init test**: Mount, unmount, remount. Assert `initChat` called only once (messages persist).
3. **Send message test**: Call `sendMessage('hello')`. Assert message added to `store.chatStates.get(cardId).messages`.
4. **Streaming test**: Call `sendMessage`. Mock transport to stream tokens. Assert `store.chatStates.get(cardId).streamingContent` updates.
5. **Tool call test**: Mock transport to fire `onToolCall({ name: 'retry_query', params: {} })`. Assert `store.updateCard` called with updated content.
6. **Abort test**: Call `abort()`. Assert `store.chatStates.get(cardId).isStreaming` is false.
7. **Retry test**: Call `retry()`. Assert last assistant message removed from store. Assert new stream started.
8. **System context test**: Init chat for an errored card. Assert system message contains error details.

## Acceptance Criteria

- [ ] Chat state initialized lazily on panel open
- [ ] System context message injected on first init (hidden from UI)
- [ ] All chat state reads from Zustand store via selectors
- [ ] All chat state writes go through store actions
- [ ] `sendMessage`, `abort`, `retry` wired through `useChatActions` to store
- [ ] Tool calls dispatched to card store (update card, trigger re-execution)
- [ ] Messages persist across panel close/reopen
- [ ] Streaming content cleared on panel close
- [ ] Store extended with chat-specific actions
- [ ] All tests pass

## Anti-Patterns

- Do not store chat state in component local state -- use Zustand store
- Do not re-inject system context on re-open -- only on first init
- Do not handle all possible tool calls -- just `retry_query` and `modify_code` for now
- Do not persist chat across sessions -- chat is per-session per-card
- Do not couple this hook to specific card body renderers -- it works with any card type
