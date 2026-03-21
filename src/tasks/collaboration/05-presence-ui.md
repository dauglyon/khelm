# 05 -- Presence UI Components

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Presence sync handler | 04 | must exist |
| Collaboration store selectors | 02 | must exist |
| Avatar component | design-system | must exist |
| Card header integration point | card | must exist |

## Context

This task builds the visual presence indicators: the participant list in the session header, small avatar stacks on card headers for focused users, and colored focus rings. These components read from the collaboration store selectors.

**Architecture reference:** collaboration.md section 4 (Presence Indicators).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/collaboration/components/ParticipantList.tsx` | Session header participant list | ~80 |
| `src/features/collaboration/components/ParticipantList.css.ts` | vanilla-extract styles | ~40 |
| `src/features/collaboration/components/CardPresenceAvatars.tsx` | Avatar stack for card headers | ~60 |
| `src/features/collaboration/components/CardPresenceAvatars.css.ts` | vanilla-extract styles | ~30 |
| `src/features/collaboration/components/ParticipantList.test.tsx` | Tests for participant list | ~60 |
| `src/features/collaboration/components/CardPresenceAvatars.test.tsx` | Tests for card avatars | ~50 |

### `ParticipantList` component

| Element | Behavior |
|---------|----------|
| Container | Horizontal row of avatars in the session header |
| Avatar | Circular image with `avatarUrl`, falls back to initials from `displayName` |
| Status dot | Small colored dot overlay: green=online, amber=idle, grey=offline |
| Tooltip | Hover shows `displayName` and which card is focused (shortname or "No card") |
| Overflow | If >5 participants, show "+N" overflow indicator |

- Uses `useParticipants()` selector from collaboration store.
- Each avatar uses the shared `Avatar` component from design-system.

### `CardPresenceAvatars` component

| Prop | Type | Description |
|------|------|-------------|
| `cardId` | `string` | Card to show presence for |

| Element | Behavior |
|---------|----------|
| Container | Small avatar stack in card header top-right area |
| Avatars | 20px circular avatars, overlapping with -6px margin |
| Max visible | 3 avatars + overflow count |
| Colored ring | Each avatar has a colored ring matching the user's assigned color |
| Exclude self | Do not show the current user's avatar on cards they are focused on |

- Uses `useParticipantsOnCard(cardId)` selector from collaboration store.

### Focus ring on card

- When another user is focused on a card, the card container gets a subtle colored border (2px) matching that user's assigned color.
- Color assignment: hash `userId` to pick from a predefined palette of 8 colors.
- If multiple users are focused, use the first user's color.

## Demo Reference

**Vignette 4:** The session header shows all participants with online/idle status. Cards show small avatars of users currently viewing them.

## Integration Proofs

```bash
# Components compile
npx tsc --noEmit src/features/collaboration/components/ParticipantList.tsx
npx tsc --noEmit src/features/collaboration/components/CardPresenceAvatars.tsx

# Tests pass
npx vitest run src/features/collaboration/components/ParticipantList.test.tsx
npx vitest run src/features/collaboration/components/CardPresenceAvatars.test.tsx
```

## Acceptance Criteria

- [ ] `ParticipantList` renders avatars with online/idle/offline status dots
- [ ] Tooltip shows display name and focused card shortname
- [ ] Overflow indicator shows "+N" when more than 5 participants
- [ ] `CardPresenceAvatars` renders overlapping avatars for users focused on that card
- [ ] Current user's avatar is excluded from their own focused card
- [ ] Focus ring color derived from userId hash
- [ ] Both components use collaboration store selectors (not prop drilling)
- [ ] Tests render correctly with mock store data

## Anti-Patterns

- Do NOT subscribe to the entire participants map; use card-specific selectors.
- Do NOT re-render ParticipantList on lock changes; it only reads presence.
- Do NOT hardcode avatar colors; derive from userId for consistency across clients.
- Do NOT render presence avatars for offline participants on cards.
