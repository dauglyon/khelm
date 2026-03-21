# 08 -- Lock UX Components

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Lock protocol | 06 | must exist |
| Lock heartbeat | 07 | must exist |
| Collaboration store selectors | 02 | must exist |
| Card header component | card | must exist (integration point) |
| Avatar component | design-system | must exist |
| Toast component | design-system | must exist |

## Context

This task builds the visual lock indicators that show users which cards are locked, by whom, and prevents editing locked cards. It covers the avatar badge on locked cards, disabled controls, tooltip, and denied-click inline toast.

**Architecture reference:** collaboration.md section 6 (Lock UX).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/components/LockBadge.tsx` | Avatar badge for lock holder on card header | ~60 |
| `src/features/collaboration/components/LockBadge.css.ts` | vanilla-extract styles | ~30 |
| `src/features/collaboration/components/LockBadge.test.tsx` | Tests | ~50 |
| `src/features/collaboration/hooks/useCardLockGuard.ts` | Hook that guards edit/delete actions behind lock check | ~50 |
| `src/features/collaboration/hooks/useCardLockGuard.test.ts` | Tests | ~40 |

### `LockBadge` component

| Prop | Type | Description |
|------|------|-------------|
| `cardId` | `string` | Card to show lock badge for |

| Element | Behavior |
|---------|----------|
| Avatar | Lock holder's avatar (or AI icon for `role: 'ai'`) in card top-right corner |
| Colored ring | Ring around avatar matching holder's assigned color |
| Tooltip | Hover shows "Being edited by [Name]" or "AI is generating..." |
| Visibility | Only rendered when card has a lock AND the lock holder is not the current user |

- Uses `useLockHolder(cardId)` and `useIsCardLockedByMe(cardId)` selectors.
- When the current user holds the lock, no badge is shown (they know they are editing).

### `useCardLockGuard(cardId)` hook

Returns:
```typescript
{
  isLocked: boolean;          // card has a lock by someone else
  isLockedByMe: boolean;      // I hold the lock
  canEdit: boolean;           // !isLocked || isLockedByMe
  lockHolder: { name: string; role: 'human' | 'ai' } | null;
  onEditAttempt: () => void;  // call when user clicks edit/delete on a locked card
}
```

- `onEditAttempt()`: if `isLocked && !isLockedByMe`, shows inline toast: "This card is being edited by [Name]." using the design-system Toast component.
- Toast is non-modal, auto-dismisses after 3 seconds.

### Disabled controls behavior

Card components should use `canEdit` from this hook to:
- Grey out edit, configure, and delete controls when `canEdit === false`.
- Card content remains fully readable (never hidden or blurred).
- `aria-disabled="true"` on disabled controls for accessibility.

This hook provides the data; the card domain components consume it.

## Demo Reference

**Vignette 4:** User A sees User B's avatar badge on the card being edited. Clicking "Edit" on that card shows an inline toast, and the edit controls are greyed out.

## Integration Proofs

```bash
# Components compile
npx tsc --noEmit src/features/collaboration/components/LockBadge.tsx
npx tsc --noEmit src/features/collaboration/hooks/useCardLockGuard.ts

# Tests pass
npx vitest run src/features/collaboration/components/LockBadge.test.tsx
npx vitest run src/features/collaboration/hooks/useCardLockGuard.test.ts
```

## Acceptance Criteria

- [ ] `LockBadge` shows lock holder's avatar with colored ring when card is locked by another user
- [ ] `LockBadge` is hidden when the current user holds the lock
- [ ] Tooltip shows "Being edited by [Name]" for humans, "AI is generating..." for AI
- [ ] `useCardLockGuard` returns `canEdit: false` when card is locked by another user
- [ ] `onEditAttempt()` shows inline toast with holder name (non-modal, 3s auto-dismiss)
- [ ] Disabled controls use `aria-disabled="true"`
- [ ] Card content remains fully readable when locked
- [ ] Tests verify badge visibility, tooltip text, and toast trigger

## Anti-Patterns

- Do NOT show a modal dialog for lock denial; use inline toast only (architecture spec).
- Do NOT hide card content when locked; only disable edit controls.
- Do NOT show lock badge for the current user's own lock.
- Do NOT block read operations (view, copy, pin) behind lock checks.
