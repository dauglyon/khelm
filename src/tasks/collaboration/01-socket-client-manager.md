# 01 -- Socket.IO Client Manager

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| `VITE_WS_URL` env var | app-shell | must exist |
| Auth token accessor | app-shell | must exist (store getter or function) |

## Context

This task creates the singleton Socket.IO client manager that all collaboration features use. It handles connection, authentication (token in handshake), automatic reconnection with exponential backoff, and exposes a typed event emitter interface. No room-joining or business logic -- just the transport layer.

**Architecture reference:** collaboration.md sections 1 (Connection Lifecycle) and 10 (State Management Integration).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/socketClient.ts` | Singleton manager: connect, disconnect, typed emit/on/off, auth | ~120 |
| `src/features/collaboration/socketClient.test.ts` | Unit tests with mock Socket.IO | ~100 |
| `src/features/collaboration/types.ts` | Shared TypeScript types for all socket events and payloads | ~80 |

### `socketClient.ts` requirements

- Export a `getSocket()` function that returns the singleton `Socket` instance.
- Export a `connectSocket(token: string)` function that:
  - Creates the Socket.IO client pointed at `import.meta.env.VITE_WS_URL`.
  - Passes the auth token in `auth: { token }` (Socket.IO handshake).
  - Sets `reconnection: true`, `reconnectionDelay: 1000`, `reconnectionDelayMax: 10000`.
  - Sets `transports: ['websocket', 'polling']` (prefer websocket, fall back to polling).
  - Returns the socket instance.
- Export a `disconnectSocket()` function that calls `socket.disconnect()` and clears the singleton.
- The socket instance must NOT be created at module load time (avoids test pollution).
- No room-joining logic in this file (that is task 03).

### `types.ts` requirements

- Define `ServerToClientEvents` interface with all events from collaboration.md:
  - `session:state`, `session:member:joined`, `session:member:left`
  - `card:created`, `card:updated`, `card:deleted`, `card:reordered`
  - `card:lock:granted`, `card:lock:denied`, `card:lock:released`, `card:lock:state`
  - `presence:sync`
  - `chat:message`
  - `error`
- Define `ClientToServerEvents` interface:
  - `session:join`, `session:leave`
  - `card:create`, `card:update`, `card:delete`, `card:reorder`
  - `card:lock:request`, `card:lock:release`, `card:lock:heartbeat`, `card:lock:preempt`
  - `presence:update`
  - `chat:send`
- Define payload types for each event (e.g., `LockEntry`, `PresenceState`, `SessionSnapshot`).
- All types exported so other collaboration files can import them.

## Demo Reference

**Vignette 4:** Multiple users see each other's cursors and edits in real time. The socket client is the invisible transport layer enabling all of this.

## Integration Proofs

```bash
# Types compile without errors
npx tsc --noEmit src/features/collaboration/types.ts

# Unit tests pass (mock socket, verify connect/disconnect/auth)
npx vitest run src/features/collaboration/socketClient.test.ts

# Socket client can be imported without side effects (no connection on import)
node -e "import('./src/features/collaboration/socketClient.ts')"
```

## Acceptance Criteria

- [ ] `connectSocket(token)` creates a Socket.IO client with the token in `auth` handshake
- [ ] `getSocket()` returns the singleton; throws if not connected
- [ ] `disconnectSocket()` cleanly disconnects and clears the singleton
- [ ] Socket is NOT created at module import time
- [ ] `reconnection: true` with exponential backoff configured
- [ ] All event types from collaboration.md are defined in `types.ts`
- [ ] Both `ServerToClientEvents` and `ClientToServerEvents` are fully typed
- [ ] Unit tests cover: connect, disconnect, reconnect, auth token passing
- [ ] No room-join or business logic in this file

## Anti-Patterns

- Do NOT create the socket at module load time (breaks tests, creates side effects on import).
- Do NOT hardcode the WebSocket URL; always read from `import.meta.env.VITE_WS_URL`.
- Do NOT add event handlers in this file beyond connection lifecycle (those belong in tasks 03-11).
- Do NOT use `io()` without explicit options; always pass the config object.
