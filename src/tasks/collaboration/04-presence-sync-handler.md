# 04 -- Presence Store Slice and Sync Handler

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Collaboration store | 02 | must exist (presence slice) |
| Session room protocol | 03 | must exist (room joined) |
| Socket client | 01 | must exist |

## Context

This task implements the presence sync protocol: the client reports focus changes to the server, and the server broadcasts full presence state to all room members. The store slice already exists (task 02); this task adds the event handler wiring and the hook for reporting focus.

**Architecture reference:** collaboration.md section 4 (Presence System).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/usePresenceSync.ts` | Hook that registers presence event handlers and reports focus | ~70 |
| `src/features/collaboration/usePresenceSync.test.ts` | Tests with mock socket | ~60 |

### `usePresenceSync()` hook

- Registers handler for `presence:sync` event:
  - Receives `{ participants: PresenceState[] }` from server.
  - Calls `collaborationStore.setParticipants(participantsMap)` converting array to Map.
- Exports a `reportFocus(cardId: string | null)` function:
  - Emits `presence:update` with `{ focusedCardId: cardId }` to server.
  - Debounce: only emit if `cardId` differs from last reported value (avoid flooding on scroll).
- Cleanup: remove `presence:sync` handler on unmount.

### Focus detection strategy

The `reportFocus` function is called by:
- Card click handler (in card component, out of scope -- documented here for integration).
- IntersectionObserver callback or manual scroll-into-view detection (future, optional).
- Explicit null on blur / deselect.

This task only implements `reportFocus` and the socket emit. The callers are wired in task 05 or by the card domain.

## Demo Reference

**Vignette 4:** User A sees User B's avatar appear on the card they are focused on, updating in real time as User B clicks different cards.

## Integration Proofs

```bash
# Hook compiles
npx tsc --noEmit src/features/collaboration/usePresenceSync.ts

# Unit tests pass
npx vitest run src/features/collaboration/usePresenceSync.test.ts
```

## Acceptance Criteria

- [ ] `presence:sync` handler converts participant array to Map and updates store
- [ ] `reportFocus(cardId)` emits `presence:update` with the focused card ID
- [ ] Duplicate focus reports (same cardId as last) are suppressed
- [ ] Event handler is cleaned up on unmount
- [ ] Unit tests verify: sync handler updates store, reportFocus emits, debounce works

## Anti-Patterns

- Do NOT poll for presence; rely on server push via `presence:sync`.
- Do NOT emit `presence:update` on every scroll event; only emit on actual focus change.
- Do NOT store presence state outside the collaboration store (no component-local state for participants).
