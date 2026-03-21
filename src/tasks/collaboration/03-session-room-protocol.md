# 03 -- Session Room Join/Leave Protocol

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Socket client manager | 01 | must exist |
| Collaboration store | 02 | must exist |
| Session route param | app-shell | `useParams().id` on `/session/:id` |

## Context

This task wires up the session room lifecycle: joining a room on session page mount, leaving on unmount, and handling the `session:state` snapshot that the server sends on join. This is the bridge between the socket transport (task 01) and the collaboration store (task 02).

**Architecture reference:** collaboration.md section 2 (Session Rooms).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/useSessionRoom.ts` | React hook that joins/leaves rooms and handles snapshot | ~90 |
| `src/features/collaboration/useSessionRoom.test.ts` | Tests with mock socket | ~80 |

### `useSessionRoom(sessionId: string)` hook

- On mount:
  1. Call `getSocket()` to get the connected socket.
  2. Emit `session:join` with `{ sessionId }`.
  3. Register handler for `session:state` that calls:
     - `collaborationStore.setLocks(snapshot.locks)`
     - `collaborationStore.setParticipants(snapshot.participants)`
     - Workspace store updates for cards (call `setCards` or equivalent).
  4. Register handler for `session:member:joined` that calls `collaborationStore.setParticipant(...)`.
  5. Register handler for `session:member:left` that calls `collaborationStore.removeParticipant(...)`.
- On unmount (cleanup):
  1. Emit `session:leave` with `{ sessionId }`.
  2. Remove all registered handlers.
  3. Call `collaborationStore.reset()`.
- On `sessionId` change: leave old room, join new room.

### Event handlers registered

| Event | Handler |
|-------|---------|
| `session:state` | Populate locks, presence, and cards from snapshot |
| `session:member:joined` | Add participant to presence store |
| `session:member:left` | Remove participant from presence store |

## Demo Reference

**Vignette 4:** When a user opens a session URL, they join the room and immediately see who else is present, what cards exist, and which are locked.

## Integration Proofs

```bash
# Hook compiles
npx tsc --noEmit src/features/collaboration/useSessionRoom.ts

# Unit tests pass
npx vitest run src/features/collaboration/useSessionRoom.test.ts
```

## Acceptance Criteria

- [ ] Hook emits `session:join` on mount with the session ID
- [ ] Hook emits `session:leave` on unmount
- [ ] `session:state` snapshot populates both collaboration store and workspace store
- [ ] `session:member:joined` adds participant to presence map
- [ ] `session:member:left` removes participant from presence map
- [ ] Changing `sessionId` prop leaves old room and joins new room
- [ ] All event handlers are cleaned up on unmount (no leaks)
- [ ] Unit tests verify join/leave/snapshot handling with mock socket

## Anti-Patterns

- Do NOT call `connectSocket()` inside this hook; assume the socket is already connected (connection is managed at app level).
- Do NOT duplicate snapshot data in multiple stores; locks/presence go to collaboration store, cards go to workspace store.
- Do NOT forget to clean up event handlers on unmount -- socket.io listeners persist unless explicitly removed.
