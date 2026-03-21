# 10 -- AI Participant Lock Lifecycle and Preemption

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Lock protocol | 06 | must exist |
| Lock heartbeat | 07 | must exist |
| Card streaming | card | must exist (streaming indicator, status lifecycle) |
| Socket client | 01 | must exist |
| Collaboration store | 02 | must exist |

## Context

This task implements the client-side handling for AI participants in the collaboration protocol. The AI connects as a symmetric Socket.IO client (server-side concern), but the frontend needs to handle AI lock visualization and the "Stop generating" preemption flow.

**Architecture reference:** collaboration.md section 8 (AI Participant).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/useAIPreemption.ts` | Hook for "Stop generating" preemption flow | ~70 |
| `src/features/collaboration/components/StopGeneratingButton.tsx` | Button component for AI-locked cards | ~50 |
| `src/features/collaboration/components/StopGeneratingButton.css.ts` | Styles | ~20 |
| `src/features/collaboration/useAIPreemption.test.ts` | Tests | ~60 |
| `src/features/collaboration/components/StopGeneratingButton.test.tsx` | Tests | ~40 |

### AI lock visualization

AI locks are displayed using the same `LockBadge` (task 08) but with:
- AI icon instead of user avatar (when `role === 'ai'`).
- Tooltip text: "AI is generating..." instead of "Being edited by [Name]".
- Streaming indicator on the card body (from card domain) remains visible.

No new component needed for visualization -- `LockBadge` (task 08) already handles `role: 'ai'`. This task just ensures the data flows correctly.

### `useAIPreemption(cardId)` hook

Returns:
```typescript
{
  canPreempt: boolean;      // card is locked by AI
  preempt: () => void;      // trigger "Stop generating"
  isPreempting: boolean;    // waiting for server to complete preemption
}
```

#### Preemption flow (client-side)

| Step | Client action |
|------|--------------|
| 1 | User clicks "Stop generating" button |
| 2 | Hook sets `isPreempting: true` |
| 3 | Emit `card:lock:preempt` with `{ cardId }` |
| 4 | Server aborts AI, saves partial, releases AI lock, grants to user |
| 5 | `card:lock:released` fires (AI lock gone) -- handled by lock protocol (task 06) |
| 6 | `card:lock:granted` fires (user now holds lock) -- handled by lock protocol |
| 7 | `card:updated` fires with partial AI content -- handled by mutation sync (task 09) |
| 8 | Hook sets `isPreempting: false` |

### `StopGeneratingButton` component

| Prop | Type | Description |
|------|------|-------------|
| `cardId` | `string` | Card with AI lock |

| Element | Behavior |
|---------|----------|
| Button | "Stop generating" text with stop icon |
| Visibility | Only shown when card is locked by AI (`role === 'ai'`) |
| Disabled state | Disabled while `isPreempting` is true |
| Position | Overlaid on the card body, bottom-center |
| No confirmation | Single click, no modal (mirrors ChatGPT/Claude stop pattern) |

## Demo Reference

**Vignette 4:** The AI starts generating a hypothesis card. User sees the AI avatar badge and streaming content. User clicks "Stop generating" -- the stream stops, partial content is preserved, and the card becomes editable.

## Integration Proofs

```bash
# Hook and component compile
npx tsc --noEmit src/features/collaboration/useAIPreemption.ts
npx tsc --noEmit src/features/collaboration/components/StopGeneratingButton.tsx

# Tests pass
npx vitest run src/features/collaboration/useAIPreemption.test.ts
npx vitest run src/features/collaboration/components/StopGeneratingButton.test.tsx
```

## Acceptance Criteria

- [ ] `canPreempt` is true only when card is locked by AI
- [ ] `preempt()` emits `card:lock:preempt` to the server
- [ ] `isPreempting` is true between emit and server confirmation
- [ ] `StopGeneratingButton` is visible only on AI-locked cards
- [ ] Button is disabled during preemption
- [ ] No confirmation modal on click (single-click preemption)
- [ ] Partial AI content is preserved after preemption (via card:updated handler)
- [ ] Lock transitions correctly from AI to requesting user
- [ ] Tests verify: preemption flow, button visibility, disabled state

## Anti-Patterns

- Do NOT show a confirmation dialog for stop; architecture specifies single-click.
- Do NOT discard partial AI content on preemption; it must be saved.
- Do NOT create a separate lock mechanism for AI; use the same lock protocol.
- Do NOT assume the user will always get the lock after preemption; handle the case where another user grabs it first.
