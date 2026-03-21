# Task 20: Card Integration Test Suite

## Dependencies

- All previous card tasks (01-19)
- **app-shell**: MSW setup (`src/mocks/browser.ts`, `src/mocks/server.ts`)
- **design-system**: Theme provider wrapper for test rendering

## Context

This task creates comprehensive integration tests that validate the full card lifecycle: creation, status transitions, streaming content, chat interaction, and cross-card references. These tests use MSW to mock backend responses and exercise the real store, components, and transport together. They serve as the primary regression safety net for the card domain.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/__tests__/card-lifecycle.test.tsx`** (~150 lines)
2. **`src/features/cards/__tests__/card-streaming.test.tsx`** (~120 lines)
3. **`src/features/cards/__tests__/card-chat.test.tsx`** (~130 lines)
4. **`src/features/cards/__tests__/card-types-render.test.tsx`** (~120 lines)
5. **`src/features/cards/mocks/handlers.ts`** (~80 lines) -- MSW handlers for card endpoints

### MSW Handlers

Create MSW handlers that mock:

| Endpoint | Method | Handler Behavior |
|----------|--------|-----------------|
| `/api/cards/:id/execute` | POST | Returns SSE stream with tokens based on card type |
| `/api/cards/:id/chat` | POST | Returns SSE stream with chat response tokens |
| `/api/cards` | POST | Returns created card record |
| `/api/cards/:id` | PATCH | Returns updated card record |
| `/api/cards/:id` | DELETE | Returns 204 |

SSE mock helpers:
```typescript
// Helper to create a mock SSE ReadableStream
function createMockSSEStream(tokens: string[], delayMs?: number): ReadableStream;
```

### Test Suite 1: Card Lifecycle (card-lifecycle.test.tsx)

| Test | Description |
|------|-------------|
| Create and render | Create a SQL card in store, render `<Card>`, assert header and body visible |
| Status transitions | Set card through thinking -> running -> complete. Assert each status indicator renders correctly |
| Error status | Set card to error. Assert error message displayed. Assert chat button pulses. |
| Error to retry | Set card to error, then back to thinking (retry). Assert status resets. |
| Delete card | Render card, trigger delete, confirm. Assert card removed from store. |
| Copy card | Trigger copy. Assert new card in store with " (copy)" suffix. |
| Shortname edit | Edit shortname via header. Assert store updated. |

### Test Suite 2: Card Streaming (card-streaming.test.tsx)

| Test | Description |
|------|-------------|
| Stream tokens | Start streaming on a card. Send 20 tokens via mock SSE. Assert content accumulates. |
| Buffer flush rate | Send tokens, advance timers by 50ms. Assert store updated at flush interval, not per-token. |
| Stream complete | Send tokens then `[DONE]`. Assert streaming content moved to result. Assert status is complete. |
| Stream abort | Start streaming, abort. Assert partial content preserved. |
| Cursor visible | During streaming, assert blinking cursor element in DOM. After complete, assert cursor gone. |
| Auto-scroll | Stream enough content to overflow. Assert scroll position is at bottom. |

### Test Suite 3: Card Chat (card-chat.test.tsx)

| Test | Description |
|------|-------------|
| Open chat panel | Click chat button. Assert panel visible. Assert input focused. |
| Send message | Type message, press Enter. Assert user message appears right-aligned. |
| AI response streams | Send message, mock SSE response. Assert AI message streams in left-aligned. |
| Abort chat | During AI streaming, click Abort. Assert partial response kept with "(stopped)". |
| Retry chat | After error, click Retry. Assert last AI message removed. Assert new stream starts. |
| Tool call | Mock AI response with tool call. Assert card content updated. |
| Close and reopen | Close panel, reopen. Assert previous messages still visible. |
| System context | Open chat on errored card. Assert system message in store (not visible in UI). |

### Test Suite 4: Card Type Rendering (card-types-render.test.tsx)

| Test | Description |
|------|-------------|
| SQL card render | Create SQL card with result. Assert code block, table, row count visible. |
| Python card render | Create Python card with result. Assert code block, stdout, figure visible. |
| Literature card render | Create Literature card with result. Assert publication list, expand abstract. |
| Hypothesis card render | Create Hypothesis card with result. Assert claim callout, analysis, suggested query chips. |
| Note card render | Create Note card. Assert editable textarea. Assert no result section. |
| Data Ingest card render | Create Data Ingest card with result. Assert schema table, sample data. |
| All types have header | For each type, assert header with correct type badge color. |

### Test Utilities

```typescript
// Render helper that wraps with theme provider, store provider, etc.
function renderCard(cardId: string, storeOverrides?: Partial<CardStore>): RenderResult;

// Helper to create mock card data for each type
function createMockCard(type: CardType, overrides?: Partial<Card>): Card;

// Helper to create mock result for each type
function createMockResult(type: CardType): CardResult;
```

## Demo Reference

**Vignette 1**: Integration test creates a SQL card, sets it to `thinking`, advances through `running` (with streaming), to `complete`. At each stage, the test asserts the correct visual state: shimmer overlay, spinning indicator with streaming content, then green checkmark with full result table.

**Vignette 2**: Integration test opens chat on an errored card. Sends "Fix this". Mock backend streams a response with a `retry_query` tool call. Test asserts the card's content is updated and status returns to `thinking`.

## Integration Proofs

These ARE the integration proofs. Each test file must:

1. Pass via `npx vitest run src/features/cards/__tests__/card-lifecycle.test.tsx`
2. Pass via `npx vitest run src/features/cards/__tests__/card-streaming.test.tsx`
3. Pass via `npx vitest run src/features/cards/__tests__/card-chat.test.tsx`
4. Pass via `npx vitest run src/features/cards/__tests__/card-types-render.test.tsx`
5. All tests pass together via `npx vitest run src/features/cards/__tests__/`

## Acceptance Criteria

- [ ] MSW handlers mock all card API endpoints
- [ ] SSE mock helper creates realistic ReadableStream responses
- [ ] Card lifecycle tests cover create, status transitions, delete, copy, rename
- [ ] Streaming tests cover token flow, buffer flush, completion, abort, cursor
- [ ] Chat tests cover send, stream, abort, retry, tool calls, persistence
- [ ] Type rendering tests cover all 6 card types with correct body content
- [ ] Test utilities (renderCard, createMockCard, createMockResult) are reusable
- [ ] All tests pass independently and together
- [ ] No flaky tests (deterministic timers, no real network calls)
- [ ] Tests run in under 10 seconds total

## Anti-Patterns

- Do not test implementation details (internal state shape) -- test observable behavior
- Do not use `act()` warnings as acceptable -- resolve all act warnings
- Do not use real timers -- use `vi.useFakeTimers()` for streaming/buffer tests
- Do not skip MSW -- all API calls must go through MSW handlers
- Do not test components in isolation here -- that is what unit tests in tasks 03-18 are for
- Do not create snapshot tests -- they are brittle and add no value for dynamic components
