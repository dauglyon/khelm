# WS-01: Session Store (Zustand)

## Dependencies

- **design-system** (types only): `CardType` and `CardStatus` enums from the design system type definitions. If those types are not yet available, define them locally and mark for extraction.

## Context

The session store is the central state container for the workspace. Every other workspace task reads from or writes to this store. It uses Zustand with vanilla store support so that SSE handlers and WebSocket listeners (outside React) can call `setState`/`getState` directly. The store shape and actions are prescribed by the architecture spec at `architecture/workspace.md` -- Section "Session State (Zustand Store)".

The streaming buffer pattern is architecturally significant: tokens accumulate in a plain JS variable outside React, flush to the store via `setInterval` at 50ms, and card components subscribe only to their own slice. This prevents render thrashing during concurrent LLM streams. See `architecture/research/rsh-006-streaming-state-management.md` for full rationale.

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/store/sessionStore.ts` | Zustand store definition with state shape, actions, and vanilla export | ~200 |
| `src/features/workspace/store/types.ts` | TypeScript types for CardState, CardType, CardStatus, store shape | ~70 |
| `src/features/workspace/store/sessionStore.test.ts` | Unit tests for all store actions | ~200 |

### Store Shape

Implement exactly as specified in `architecture/workspace.md`:

- `cards: Map<string, CardState>` -- all cards in the session
- `order: string[]` -- card IDs in display order
- `activeCardId: string | null` -- currently focused card
- `detailCardId: string | null` -- card in detail view
- `streamBuffers: Map<string, string>` -- ephemeral token buffers per streaming card
- `renderedCardIds: Set<string>` -- tracks which cards have been rendered (animation gating)

### Actions

Implement all actions from the spec:

- `addCard(card)` -- adds to `cards` map, appends ID to `order`
- `removeCard(id)` -- removes from `cards`, `order`, `streamBuffers`, `renderedCardIds`; cleans up `references` and `referencedBy` on other cards
- `updateCard(id, patch)` -- shallow merge patch into card state
- `reorderCards(fromIndex, toIndex)` -- moves ID within `order` array
- `setActiveCard(id | null)` -- sets `activeCardId`
- `openDetail(id)` -- sets `detailCardId`
- `closeDetail()` -- clears `detailCardId`
- `flushStreamBuffer(id)` -- appends buffer contents to card's `content`, clears buffer
- `markRendered(id)` -- adds ID to `renderedCardIds`

### CardState Shape

Implement exactly as specified:

```
id: string
shortname: string
type: CardType  ('sql' | 'python' | 'literature' | 'hypothesis' | 'note' | 'data_ingest')
status: CardStatus  ('thinking' | 'running' | 'complete' | 'error')
content: string
input: string
references: string[]
referencedBy: string[]
createdAt: number
updatedAt: number
```

### Vanilla Store Export

Export both a React-bound store (via `create`) and a vanilla store (via `createStore` from `zustand/vanilla`) so that SSE/WS handlers can call `getState()` and `setState()` without React.

### DevTools

Enable Redux DevTools via Zustand's `devtools` middleware in development mode.

## Demo Reference

**Vignette 1 (Session Start):** User opens a session. The store initializes with an empty `cards` Map and empty `order` array. As the user submits queries, `addCard` is called for each, and `order` grows.

**Vignette 5 (Streaming):** An SSE handler receives tokens outside React. It writes raw tokens to a plain JS buffer variable. A `setInterval` at 50ms calls `flushStreamBuffer(cardId)` to move buffer contents into the store. The card component's Zustand selector picks up the change.

## Integration Proofs

1. **Store initializes correctly:**
   ```
   Test: Create store, verify cards is empty Map, order is empty array,
   activeCardId is null, detailCardId is null.
   ```

2. **addCard populates cards and order:**
   ```
   Test: Call addCard with a CardState object. Verify cards.get(id) returns
   the card. Verify order includes the id at the end.
   ```

3. **removeCard cleans up references bidirectionally:**
   ```
   Test: Add card A and card B where B.references includes A.id and
   A.referencedBy includes B.id. Remove B. Verify A.referencedBy no longer
   includes B.id.
   ```

4. **flushStreamBuffer appends to content:**
   ```
   Test: Add a card with content "Hello". Set streamBuffers for that card to
   " World". Call flushStreamBuffer(id). Verify card content is "Hello World"
   and streamBuffers.get(id) is empty string or undefined.
   ```

5. **Vanilla store is callable outside React:**
   ```
   Test: Import vanilla store. Call getState(), setState(), verify state
   updates without any React rendering context.
   ```

6. **reorderCards moves within order array:**
   ```
   Test: Add three cards. Call reorderCards(0, 2). Verify order array reflects
   the move.
   ```

## Acceptance Criteria

- [ ] `CardType` and `CardStatus` types are defined and exported
- [ ] `CardState` type matches the spec exactly (all fields, correct types)
- [ ] Store shape matches the spec (cards Map, order array, activeCardId, detailCardId, streamBuffers Map, renderedCardIds Set)
- [ ] All 9 actions are implemented and tested
- [ ] `removeCard` cleans up cross-references on other cards
- [ ] `flushStreamBuffer` appends buffer to content and clears the buffer
- [ ] Vanilla store export works outside React (no hooks required)
- [ ] Redux DevTools middleware enabled in dev mode
- [ ] All tests pass: `npx vitest run src/features/workspace/store/sessionStore.test.ts`
- [ ] No raw hex/px values -- any color/spacing references use tokens or are deferred to design-system

## Anti-Patterns

- **Do not** use React Context for this store. Zustand is specified.
- **Do not** store streaming tokens directly in the Zustand store on every SSE message. Use the buffer pattern (plain JS variable + setInterval flush).
- **Do not** use Redux Toolkit or RTK Query for this store. Those are for server-fetched data via TanStack Query.
- **Do not** put UI-derived state (column count, scroll position) in this store. Those belong in hooks.
- **Do not** use `immer` middleware unless there is a clear need -- the spec does not call for it and shallow merges suffice.
