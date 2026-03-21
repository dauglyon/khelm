# 07 -- Lock Heartbeat Timer and TTL Management

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Lock protocol | 06 | must exist |
| Socket client | 01 | must exist |
| Collaboration store | 02 | must exist (`myLockedCardId`) |

## Context

This task adds the heartbeat mechanism that keeps locks alive. When the current user holds a lock, a timer sends `card:lock:heartbeat` every 10 seconds to reset the server-side TTL. It also handles the `beforeunload` defense layer for releasing locks on tab close.

**Architecture reference:** collaboration.md section 5 (Lock Parameters, Three-Layer Disconnect Defense).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/useLockHeartbeat.ts` | Hook that manages heartbeat interval and beforeunload handler | ~80 |
| `src/features/collaboration/useLockHeartbeat.test.ts` | Tests with fake timers | ~70 |

### `useLockHeartbeat()` hook

- Reads `myLockedCardId` from collaboration store.
- When `myLockedCardId` is non-null:
  1. Start a `setInterval` at 10,000ms (10 seconds).
  2. Each tick emits `card:lock:heartbeat` with `{ cardId: myLockedCardId }`.
  3. Register `beforeunload` handler that emits `card:lock:release` (best-effort).
- When `myLockedCardId` becomes null:
  1. Clear the interval.
  2. Remove the `beforeunload` handler.
- On unmount: clear interval, remove `beforeunload` handler.

### Three-layer disconnect defense (client responsibilities)

| Layer | Implementation | Location |
|-------|---------------|----------|
| 1. `beforeunload` | Emit `card:lock:release` on tab close | This task |
| 2. Socket disconnect | Server detects and releases (server-side) | N/A (server) |
| 3. TTL expiry | Server sweep finds expired lease (server-side) | N/A (server) |

Only layer 1 is client-side. Layers 2 and 3 are server responsibilities.

### Heartbeat parameters

| Parameter | Value |
|-----------|-------|
| Interval | 10,000ms |
| Lease TTL (server) | 30,000ms (human), 60,000ms (AI) |
| Ratio | ~1/3 of TTL, ensures at least 2 heartbeats per lease period |

## Demo Reference

**Vignette 4:** User A's lock stays alive as long as they are editing. If they close the tab, the lock is released immediately (beforeunload) or within 30 seconds (TTL expiry).

## Integration Proofs

```bash
# Hook compiles
npx tsc --noEmit src/features/collaboration/useLockHeartbeat.ts

# Unit tests pass (uses vi.useFakeTimers)
npx vitest run src/features/collaboration/useLockHeartbeat.test.ts
```

## Acceptance Criteria

- [ ] Heartbeat interval starts when `myLockedCardId` becomes non-null
- [ ] Heartbeat emits `card:lock:heartbeat` with correct cardId every 10 seconds
- [ ] Heartbeat interval clears when `myLockedCardId` becomes null
- [ ] `beforeunload` handler registered while lock is held
- [ ] `beforeunload` handler emits `card:lock:release`
- [ ] `beforeunload` handler removed when lock is released
- [ ] All timers and handlers cleaned up on unmount
- [ ] Unit tests use fake timers to verify interval timing

## Anti-Patterns

- Do NOT use `setTimeout` recursion instead of `setInterval`; the interval is simpler and sufficient.
- Do NOT rely on `beforeunload` alone; it is best-effort (browsers may not fire it).
- Do NOT send heartbeats when no lock is held (wastes bandwidth, confusing to server).
- Do NOT heartbeat more frequently than 10s; matches the architecture spec exactly.
