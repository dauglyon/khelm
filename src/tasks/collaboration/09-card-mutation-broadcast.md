# 09 -- Server-Authoritative Card Mutations

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Session room protocol | 03 | must exist (room joined) |
| Lock protocol | 06 | must exist |
| Workspace session store | workspace | must exist (`addCard`, `updateCard`, `removeCard`) |
| Socket client | 01 | must exist |

## Context

This task implements the server-authoritative mutation flow for cards: create, update, delete, and reorder. Clients send operations via socket events, the server validates (including lock ownership), persists, and broadcasts results to the room. This task wires the server broadcast events to the workspace store.

**Architecture reference:** collaboration.md section 3 (Server-Authoritative State Broadcast).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/useCardMutationSync.ts` | Hook that registers card mutation event handlers and exposes mutation actions | ~130 |
| `src/features/collaboration/useCardMutationSync.test.ts` | Tests with mock socket | ~120 |

### `useCardMutationSync()` hook

Returns:
```typescript
{
  createCard: (data: CardCreatePayload) => void;
  updateCard: (cardId: string, changes: Partial<CardState>) => void;
  deleteCard: (cardId: string) => void;
  reorderCard: (cardId: string, position: number) => void;
}
```

#### Outgoing events (client -> server)

| Action | Event | Payload | Pre-check |
|--------|-------|---------|-----------|
| `createCard` | `card:create` | Card data | None (anyone can create) |
| `updateCard` | `card:update` | `{ cardId, changes }` | Must hold lock on cardId |
| `deleteCard` | `card:delete` | `{ cardId }` | Must hold lock on cardId |
| `reorderCard` | `card:reorder` | `{ cardId, position }` | None (lock-free per architecture) |

#### Incoming events (server -> client)

| Event | Handler |
|-------|---------|
| `card:created` | Call `workspaceStore.addCard(card)` with server-assigned ID |
| `card:updated` | Call `workspaceStore.updateCard(cardId, changes)` |
| `card:deleted` | Call `workspaceStore.removeCard(cardId)` |
| `card:reordered` | Call `workspaceStore.reorderCards(...)` with server-resolved order |
| `error` | Revert optimistic UI if applicable; show error toast |

#### Optimistic UI

- `createCard`: show card immediately in `thinking` status with a temporary ID. On `card:created`, replace temp ID with server ID.
- `updateCard`: apply changes optimistically. On server rejection, revert to previous state.
- `deleteCard`: remove card optimistically. On server rejection, restore card.
- `reorderCard`: apply reorder optimistically. On `card:reordered`, apply server-resolved order (may differ).

### Lock validation (client-side pre-check)

Before emitting `card:update` or `card:delete`, check `collaborationStore.myLockedCardId === cardId`. If not, log warning and do not emit. This is a safety check; the server also validates.

## Demo Reference

**Vignette 4:** When User A creates a card, User B sees it appear in their workspace. When User A edits a locked card, the update broadcasts to all participants.

## Integration Proofs

```bash
# Hook compiles
npx tsc --noEmit src/features/collaboration/useCardMutationSync.ts

# Unit tests pass
npx vitest run src/features/collaboration/useCardMutationSync.test.ts
```

## Acceptance Criteria

- [ ] `createCard` emits `card:create` and applies optimistic card in `thinking` status
- [ ] `card:created` handler replaces temporary ID with server-assigned ID
- [ ] `updateCard` checks lock ownership before emitting `card:update`
- [ ] `card:updated` handler applies changes to workspace store
- [ ] `deleteCard` checks lock ownership before emitting `card:delete`
- [ ] `card:deleted` handler removes card from workspace store
- [ ] `reorderCard` emits `card:reorder` (lock-free)
- [ ] Server rejection reverts optimistic updates
- [ ] All event handlers cleaned up on unmount
- [ ] Unit tests cover: create, update, delete, reorder, rejection/revert

## Anti-Patterns

- Do NOT bypass the server for mutations; all state changes must flow through socket events.
- Do NOT emit `card:update` or `card:delete` without checking lock ownership first.
- Do NOT trust the client's card ID for creates; always use the server-assigned ID.
- Do NOT store temporary IDs permanently; replace on server confirmation.
