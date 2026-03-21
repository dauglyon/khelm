# 11 -- Reconnection Recovery

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Socket client manager | 01 | must exist (reconnection events) |
| Collaboration store | 02 | must exist |
| Lock protocol | 06 | must exist |
| Lock heartbeat | 07 | must exist |
| Toast component | design-system | must exist |

## Context

This task handles the client-side recovery flow after a network interruption. When Socket.IO reconnects, the client must request a fresh state snapshot, reconcile its local state, detect any lost locks, and notify the user about what changed during the interruption.

**Architecture reference:** collaboration.md sections 1 (Reconnection Behavior) and 5 (Network Partition Recovery).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/useReconnectionRecovery.ts` | Hook that handles reconnect event and state reconciliation | ~100 |
| `src/features/collaboration/useReconnectionRecovery.test.ts` | Tests with mock socket | ~100 |

### `useReconnectionRecovery()` hook

Registers handler for Socket.IO `connect` event (fires on reconnect as well as initial connect):

#### On reconnect flow

| Step | Action |
|------|--------|
| 1 | Set `collaborationStore.setReconnecting(true)` |
| 2 | Socket.IO reconnect fires (transport-level, automatic) |
| 3 | On `connect` event, emit `session:join` with current `sessionId` to re-join room |
| 4 | Server responds with `session:state` snapshot (handled by task 03) |
| 5 | Compare pre-disconnect `myLockedCardId` with new lock state |
| 6 | If lock was lost: show toast, transition card to read-only, preserve local edits |
| 7 | Set `collaborationStore.setReconnecting(false)` |

#### Lost lock detection

Before reconnect, save `myLockedCardId` to a ref. After receiving `card:lock:state` in the snapshot:
- If the previously held lock is no longer in the lock table (or held by someone else):
  1. Card transitions to read-only (automatic -- lock is gone from store, so `canEdit` becomes false).
  2. Show toast: "Connection interrupted. Your lock on [Card Shortname] was released."
  3. Preserve any unsaved local edits in a `pendingEdits` map in the collaboration store.
  4. Show a "Re-acquire and apply" action in the toast that:
     a. Requests the lock via `card:lock:request`.
     b. On grant, applies the pending edits via `card:update`.
     c. On deny, shows another toast explaining the card is now locked by someone else.

#### Pending edits store addition

Add to collaboration store:
```typescript
pendingEdits: Map<string, Partial<CardState>>;  // cardId -> unsaved changes

// Actions:
setPendingEdit(cardId: string, changes: Partial<CardState>): void;
clearPendingEdit(cardId: string): void;
getPendingEdit(cardId: string): Partial<CardState> | undefined;
```

#### Connection state indicators

- While `isReconnecting` is true, show a subtle banner or indicator in the session header: "Reconnecting..."
- On successful reconnect, briefly show: "Reconnected" (auto-dismiss after 2 seconds).

## Demo Reference

**Vignette 4:** User A is editing a card when their network drops. After 15 seconds, the connection restores. User A sees "Connection interrupted. Your lock on [Card] was released." with an option to re-acquire the lock and apply their unsaved edits.

## Integration Proofs

```bash
# Hook compiles
npx tsc --noEmit src/features/collaboration/useReconnectionRecovery.ts

# Unit tests pass
npx vitest run src/features/collaboration/useReconnectionRecovery.test.ts
```

## Acceptance Criteria

- [ ] On reconnect, the hook re-joins the session room
- [ ] Fresh state snapshot reconciles locks, presence, and cards
- [ ] Lost locks are detected by comparing pre-disconnect state with snapshot
- [ ] Toast notification shown for lost locks with card shortname
- [ ] Unsaved local edits preserved in `pendingEdits` map
- [ ] "Re-acquire and apply" action in toast requests lock and applies pending edits
- [ ] `isReconnecting` flag set during reconnection flow
- [ ] Connection status indicator shown in UI during reconnection
- [ ] Tests cover: reconnect, lost lock detection, pending edit preservation, re-acquire flow

## Anti-Patterns

- Do NOT silently discard unsaved edits on reconnect; always preserve them.
- Do NOT automatically re-acquire locks; let the user decide via the toast action.
- Do NOT assume the same lock state after reconnect; always use the fresh snapshot.
- Do NOT show a blocking modal during reconnection; use a subtle banner/indicator.
