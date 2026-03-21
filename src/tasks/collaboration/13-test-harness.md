# 13 -- MSW + Socket.IO Test Harness

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Socket client manager | 01 | must exist |
| Collaboration store | 02 | must exist |
| Session room protocol | 03 | must exist |
| MSW setup | app-shell | must exist (`src/mocks/`) |

## Context

This task creates reusable test utilities for testing all collaboration features. It provides a mock Socket.IO server, helpers for simulating server events, and a test wrapper that sets up the collaboration store with known state. All subsequent collaboration tests (tasks 04-11) benefit from this harness.

**Architecture reference:** decisions.md (Testing: Vitest + Playwright + MSW 2.x).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/testing/mockSocket.ts` | Mock Socket.IO client for unit tests | ~100 |
| `src/features/collaboration/testing/collaborationTestWrapper.tsx` | React wrapper with pre-configured stores | ~60 |
| `src/features/collaboration/testing/fixtures.ts` | Factory functions for test data (locks, presence, snapshots) | ~80 |
| `src/features/collaboration/testing/mockSocket.test.ts` | Self-tests for the mock socket | ~50 |

### `mockSocket.ts`

Create a mock that implements the Socket.IO client interface used by the collaboration code:

```typescript
interface MockSocket {
  // Standard Socket.IO client methods
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, ...args: any[]): void;
  connect(): void;
  disconnect(): void;
  connected: boolean;
  id: string;

  // Test helpers
  simulateEvent(event: string, payload: any): void;  // trigger server->client event
  getEmittedEvents(): Array<{ event: string; args: any[] }>;  // inspect client->server events
  getLastEmit(event: string): any;  // get last payload for an event
  clearEmittedEvents(): void;
  simulateDisconnect(): void;
  simulateReconnect(): void;
}
```

- `simulateEvent` calls all registered handlers for that event with the payload.
- `getEmittedEvents` records all calls to `emit` for assertions.
- `simulateDisconnect` triggers the `disconnect` event and sets `connected = false`.
- `simulateReconnect` triggers the `connect` event and sets `connected = true`.

### `collaborationTestWrapper.tsx`

React wrapper component that:
- Provides a pre-configured collaboration store (using Zustand's `create` or store reset).
- Accepts optional initial state for locks, participants, and connection flags.
- Injects the mock socket via a context or module mock so `getSocket()` returns the mock.
- Provides workspace store with optional initial cards.

Usage pattern:
```tsx
render(
  <CollaborationTestWrapper
    initialLocks={[makeLockEntry({ cardId: 'c1', holderId: 'user-2' })]}
    initialParticipants={[makeParticipant({ userId: 'user-1', status: 'online' })]}
  >
    <ComponentUnderTest />
  </CollaborationTestWrapper>
);
```

### `fixtures.ts`

Factory functions with sensible defaults and overrides:

| Factory | Creates |
|---------|---------|
| `makeLockEntry(overrides?)` | `LockEntry` with defaults |
| `makePresenceState(overrides?)` | `PresenceState` with defaults |
| `makeSessionSnapshot(overrides?)` | Full session snapshot with cards, locks, presence |
| `makeCardState(overrides?)` | `CardState` for workspace store |

Each factory uses `crypto.randomUUID()` for IDs and provides realistic default values.

## Demo Reference

Not directly visible in the demo, but enables reliable testing of all Vignette 4 collaboration behaviors.

## Integration Proofs

```bash
# All test utilities compile
npx tsc --noEmit src/features/collaboration/testing/mockSocket.ts
npx tsc --noEmit src/features/collaboration/testing/collaborationTestWrapper.tsx
npx tsc --noEmit src/features/collaboration/testing/fixtures.ts

# Mock socket self-tests pass
npx vitest run src/features/collaboration/testing/mockSocket.test.ts
```

## Acceptance Criteria

- [ ] `MockSocket` implements all Socket.IO client methods used by collaboration code
- [ ] `simulateEvent` triggers registered handlers with correct payloads
- [ ] `getEmittedEvents` records all client->server emissions for test assertions
- [ ] `simulateDisconnect` and `simulateReconnect` trigger lifecycle events
- [ ] `CollaborationTestWrapper` sets up stores with provided initial state
- [ ] Factory functions produce valid typed objects with overridable fields
- [ ] Mock socket self-tests verify: emit recording, event simulation, connect/disconnect
- [ ] Test wrapper can be used in at least one existing collaboration test (task 06 or earlier)

## Anti-Patterns

- Do NOT use real Socket.IO in unit tests; always use the mock.
- Do NOT create ad-hoc mocks in individual test files; centralize in this harness.
- Do NOT make the mock socket overly complex; only implement methods actually used by the code.
- Do NOT couple fixture data to specific test cases; keep factories generic with overrides.
