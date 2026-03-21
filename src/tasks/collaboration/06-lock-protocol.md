# 06 -- Card Lock Protocol

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Socket client manager | 01 | must exist |
| Collaboration store (lock slice) | 02 | must exist |

## Context

This task implements the card-level pessimistic locking protocol: requesting locks, handling grants/denials, releasing locks, and receiving lock state updates. It wires socket events to the collaboration store's lock actions. The heartbeat timer is handled in task 07.

**Architecture reference:** collaboration.md section 5 (Card-Level Pessimistic Locking).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/useLockProtocol.ts` | Hook that registers lock event handlers and exposes lock actions | ~120 |
| `src/features/collaboration/useLockProtocol.test.ts` | Tests with mock socket | ~120 |

### `useLockProtocol()` hook

Returns:
```typescript
{
  requestLock: (cardId: string) => void;
  releaseLock: (cardId: string) => void;
}
```

#### Event handlers registered

| Event | Handler |
|-------|---------|
| `card:lock:granted` | Call `collaborationStore.setLock(cardId, entry)` and `setMyLockedCardId(cardId)` |
| `card:lock:denied` | Show inline toast with holder info: "This card is being edited by [Name]." |
| `card:lock:released` | Call `collaborationStore.removeLock(cardId)`. If it was my lock, `setMyLockedCardId(null)`. |
| `card:lock:state` | Call `collaborationStore.setLocks(locksMap)` -- full lock table on connect/reconnect |

#### `requestLock(cardId)` behavior

1. Emit `card:lock:request` with `{ cardId }`.
2. Optimistic: no optimistic UI for lock acquisition (wait for server grant).
3. Auto-release: per architecture, when a human requests lock on card B while holding card A, the server handles the atomic release of A and grant of B. The client does NOT need to send an explicit release.

#### `releaseLock(cardId)` behavior

1. Verify `myLockedCardId === cardId` (only release own locks).
2. Emit `card:lock:release` with `{ cardId }`.
3. Wait for `card:lock:released` from server before updating store (no optimistic release).

### Lock parameters (for reference, enforced server-side)

| Parameter | Human | AI |
|-----------|-------|----|
| Lease TTL | 30s | 60s |
| Max locks per user | 1 | Multiple |

## Demo Reference

**Vignette 4:** User A clicks "Edit" on a card. The lock is acquired server-side, and User B immediately sees the card become read-only with User A's avatar badge.

## Integration Proofs

```bash
# Hook compiles
npx tsc --noEmit src/features/collaboration/useLockProtocol.ts

# Unit tests pass
npx vitest run src/features/collaboration/useLockProtocol.test.ts
```

## Acceptance Criteria

- [ ] `requestLock(cardId)` emits `card:lock:request` to the server
- [ ] `card:lock:granted` handler updates lock store and sets `myLockedCardId`
- [ ] `card:lock:denied` handler shows inline toast with holder name
- [ ] `releaseLock(cardId)` emits `card:lock:release` only for own locks
- [ ] `card:lock:released` handler removes lock from store
- [ ] `card:lock:state` handler replaces entire lock map (snapshot on reconnect)
- [ ] No optimistic lock UI (wait for server confirmation)
- [ ] All event handlers cleaned up on unmount
- [ ] Unit tests cover: request, grant, deny, release, full state sync

## Anti-Patterns

- Do NOT apply optimistic lock state; always wait for server grant/denial.
- Do NOT send explicit release when switching cards; the server handles atomic release+grant.
- Do NOT attempt to release locks held by other users.
- Do NOT store lock state in component-local state; always use the collaboration store.
