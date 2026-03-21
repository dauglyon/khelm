# Task 02: Card Zustand Store

## Dependencies

- **01-card-types**: `Card`, `CardType`, `CardStatus`, `Message` types
- **design-system**: No direct dependency
- **workspace**: Consumes workspace store's `addCard`/`removeCard` actions (cross-domain)

## Context

The card domain needs its own Zustand store for card-specific state that the workspace store does not cover: the full card record (with content/result payloads), per-card chat state, and streaming content buffers. The workspace store holds the card ordering, active/detail state, and lightweight `CardState` for grid rendering. This store holds the rich card data.

The architecture spec (card.md > Streaming Content Rendering) prescribes that `streamingContent` is stored per card, separate from the final `result`. The chat panel state (card.md > Inline Chat Panel > Implementation) is keyed by card ID with shape: `{ messages, streamingContent, isStreaming, error }`.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/store.ts`** (~150 lines)
2. **`src/features/cards/__tests__/store.test.ts`** (~120 lines)

### Store Shape

```typescript
interface CardStore {
  // Card data (rich records, keyed by ID)
  cards: Map<string, Card>;

  // Per-card streaming content (separate from result)
  streamingContent: Map<string, string>;

  // Per-card chat state
  chatStates: Map<string, ChatState>;

  // Actions
  setCard: (card: Card) => void;
  updateCard: (id: string, patch: Partial<Card>) => void;
  removeCard: (id: string) => void;
  setCardStatus: (id: string, status: CardStatus) => void;
  setCardResult: (id: string, result: CardResult) => void;
  setCardError: (id: string, error: { code: string; message: string }) => void;

  // Streaming actions
  appendStreamContent: (id: string, chunk: string) => void;
  finalizeStream: (id: string) => void;
  clearStreamContent: (id: string) => void;

  // Chat actions (see task 17 for full integration)
  initChat: (id: string) => void;
  clearChat: (id: string) => void;
}

interface ChatState {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  error: string | null;
}
```

### Selectors

Export custom hook selectors for render isolation:

- `useCardData(id)` -- returns full `Card` record for one card
- `useCardStatus(id)` -- returns just the status string
- `useCardResult(id)` -- returns the result (or null)
- `useCardStreamingContent(id)` -- returns streaming content string
- `useChatState(id)` -- returns `ChatState` for one card

Each selector must use Zustand's selector pattern to avoid re-rendering unrelated cards.

### Constraints

- Use `create` from `zustand` (not `createStore`)
- Use `immer` middleware for immutable updates on Maps
- Export `getState` and `setState` for use outside React (SSE handlers, intervals)
- Chat state is initialized lazily (only when chat panel opens)
- `finalizeStream` moves `streamingContent[id]` into `cards[id].result` and clears the streaming entry

## Demo Reference

**Vignette 1**: User submits a SQL query. Store receives `setCard` with `status: 'thinking'`. Backend SSE starts streaming; `appendStreamContent` accumulates tokens. On stream end, `finalizeStream` moves content to `result` and `setCardStatus('complete')`.

**Vignette 2**: Card enters error state. `setCardError` sets `status: 'error'` and populates `error` field. User opens chat panel; `initChat` creates the chat state entry. User retries via chat; `setCardStatus('thinking')` resets the card.

## Integration Proofs

1. **Unit test -- CRUD**: Create a card, update its status, verify `getState().cards.get(id)` reflects changes
2. **Unit test -- streaming**: Append 3 chunks, verify `streamingContent.get(id)` concatenates them; call `finalizeStream`, verify streaming entry cleared
3. **Unit test -- selector isolation**: Subscribe two selectors to different card IDs; update one card; verify only the relevant selector fires
4. **Unit test -- chat init**: Call `initChat(id)`; verify `chatStates.get(id)` has empty messages array, `isStreaming: false`, `error: null`

## Acceptance Criteria

- [ ] Store created with Zustand + immer middleware
- [ ] `cards` map supports set, update, remove operations
- [ ] `streamingContent` map supports append, finalize, clear
- [ ] `chatStates` map supports init and clear
- [ ] All 5 selectors exported as custom hooks with proper isolation
- [ ] `getState` and `setState` exported for external access
- [ ] `finalizeStream` moves streaming content to card result and clears buffer
- [ ] All unit tests pass via `npx vitest run src/features/cards/__tests__/store.test.ts`
- [ ] No direct imports from workspace store (cross-domain boundary respected)

## Anti-Patterns

- Do not store derived data (e.g., "is this card streaming?") -- derive from `streamingContent.has(id)`
- Do not subscribe to the entire store -- always use selectors
- Do not put chat transport logic in the store -- store is state only
- Do not use Redux Toolkit patterns (slices, createAsyncThunk) -- this project uses Zustand
- Do not duplicate workspace store fields (order, activeCardId) -- those belong to workspace
