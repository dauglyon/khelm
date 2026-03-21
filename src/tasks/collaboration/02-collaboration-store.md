# 02 -- Collaboration Zustand Store

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Workspace session store | workspace | must exist (`useSessionStore`) |
| Collaboration types | 01 (types.ts) | must exist |

## Context

This task creates the Zustand store slices that hold collaboration state: lock entries and presence entries. Socket event handlers (tasks 03-11) will call `setState` on this store to update the UI. This store is separate from the workspace session store but works alongside it.

**Architecture reference:** collaboration.md section 10 (State Management Integration).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/collaborationStore.ts` | Zustand store with lock and presence slices | ~150 |
| `src/features/collaboration/collaborationStore.test.ts` | Unit tests for store actions and selectors | ~120 |

### Store shape

```typescript
interface CollaborationState {
  // Lock state
  locks: Map<string, LockEntry>;       // cardId -> LockEntry
  myLockedCardId: string | null;       // card the current user holds a lock on

  // Presence state
  participants: Map<string, PresenceState>;  // userId -> PresenceState
  myUserId: string | null;

  // Connection state
  isConnected: boolean;
  isReconnecting: boolean;
}
```

### `LockEntry` shape (from types.ts)

```typescript
interface LockEntry {
  cardId: string;
  holderId: string;
  holderName: string;
  holderRole: 'human' | 'ai';
  acquiredAt: number;
  expiresAt: number;
}
```

### `PresenceState` shape (from types.ts)

```typescript
interface PresenceState {
  userId: string;
  displayName: string;
  avatarUrl: string;
  status: 'online' | 'idle' | 'offline';
  focusedCardId: string | null;
  role: 'human' | 'ai';
}
```

### Actions

| Action | Effect |
|--------|--------|
| `setLocks(locks)` | Replace entire lock map (used on snapshot) |
| `setLock(cardId, entry)` | Upsert a single lock entry |
| `removeLock(cardId)` | Remove lock for a card |
| `setMyLockedCardId(cardId)` | Track which card the current user locked |
| `setParticipants(participants)` | Replace entire presence map (used on snapshot) |
| `setParticipant(userId, state)` | Upsert a single participant |
| `removeParticipant(userId)` | Remove participant on leave |
| `setConnected(flag)` | Update connection status |
| `setReconnecting(flag)` | Update reconnecting status |
| `reset()` | Clear all state (on disconnect/leave) |

### Selectors

| Selector | Returns | Re-renders when |
|----------|---------|----------------|
| `useLock(cardId)` | `LockEntry or undefined` | That card's lock changes |
| `useIsCardLocked(cardId)` | `boolean` | Lock added/removed for that card |
| `useIsCardLockedByMe(cardId)` | `boolean` | My lock on that card changes |
| `useLockHolder(cardId)` | `{ name, role } or null` | Lock holder changes |
| `useMyLockedCardId()` | `string or null` | Current user's lock changes |
| `useParticipants()` | `PresenceState[]` | Any participant changes |
| `useParticipant(userId)` | `PresenceState or undefined` | That participant changes |
| `useParticipantsOnCard(cardId)` | `PresenceState[]` | Presence focus changes |
| `useIsConnected()` | `boolean` | Connection state changes |

## Demo Reference

**Vignette 4:** When User B edits a card, User A sees the lock badge appear. When User B goes idle, User A sees the status change. All driven by this store.

## Integration Proofs

```bash
# Store compiles
npx tsc --noEmit src/features/collaboration/collaborationStore.ts

# Unit tests pass
npx vitest run src/features/collaboration/collaborationStore.test.ts
```

## Acceptance Criteria

- [ ] Store has `locks` (Map), `participants` (Map), `myLockedCardId`, connection flags
- [ ] All actions listed above are implemented
- [ ] All selectors listed above are implemented with proper selector isolation
- [ ] `useLock(cardId)` only re-renders when that specific card's lock changes
- [ ] `useParticipantsOnCard(cardId)` derives participants focused on a specific card
- [ ] `reset()` clears all state cleanly
- [ ] Unit tests cover: set/remove locks, set/remove participants, selector isolation

## Anti-Patterns

- Do NOT store collaboration state inside the workspace session store; keep it separate.
- Do NOT subscribe to the entire store in components; always use specific selectors.
- Do NOT put socket event handling logic in this file; the store is pure state + actions.
- Do NOT use `useShallow` unless comparing arrays/objects -- primitive selectors are fine without it.
