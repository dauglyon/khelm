# Task 18: Cross-Card Reference Pills

## Dependencies

- **01-card-types**: `Card` (references field)
- **02-card-store**: `useCardData` selector
- **workspace**: `useCardShortname(id)` selector, scroll-to-card action

## Context

Cards can reference other cards. References are stored as an array of card IDs on the referencing card (architecture/card.md > Cross-Card References). Referenced cards are shown as clickable pills displaying the shortname and type badge color. Clicking a pill scrolls the workspace to the referenced card and briefly highlights it. Deleted cards show "deleted card" in muted text.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/ReferencePills.tsx`** (~80 lines)
2. **`src/features/cards/ReferencePill.tsx`** (~50 lines)
3. **`src/features/cards/ReferencePills.css.ts`** (~40 lines)
4. **`src/features/cards/__tests__/ReferencePills.test.tsx`** (~80 lines)

### ReferencePills Props

```typescript
interface ReferencePillsProps {
  references: string[]; // array of card IDs
}
```

### ReferencePill Props

```typescript
interface ReferencePillProps {
  cardId: string;
}
```

### Rendering Rules (per architecture spec)

| Behavior | Detail |
|----------|--------|
| Display | Each referenced card shown as a clickable pill. Pill shows `@shortname` text with type badge background color. |
| Navigation | Clicking a pill scrolls the workspace to the referenced card and briefly highlights it (Motion scale pulse, 300ms). |
| Deleted card | If the referenced card no longer exists in the store, the pill shows "deleted card" in muted text with strikethrough. |
| Layout | Pills rendered inline, wrapped. `display: inline-flex`, `flexWrap: wrap`, `gap: 6px`. |

### Pill Component

| Property | Value |
|----------|-------|
| Background | Type color background of the referenced card (e.g., SQL: `#E3EDF7`) |
| Border | Type color border of the referenced card (e.g., SQL: `#B0CDE4`) |
| Text | `@` prefix + shortname (e.g., `@query_1`) |
| Font | DM Sans, caption size (11px), semibold |
| Padding | `2px 8px` |
| Border radius | `9999px` (pill shape) |
| Cursor | `pointer` |
| Hover | Tooltip with card shortname and status |
| Click | Scrolls workspace to card, triggers highlight animation |

### Deleted Pill

| Property | Value |
|----------|-------|
| Background | `vars.color.border` (neutral) |
| Text | "deleted card" with `text-decoration: line-through` |
| Color | `vars.color.textLight` |
| Cursor | `default` (not clickable) |

### Highlight Animation on Navigation

When a pill is clicked and the workspace scrolls to the referenced card:
- The target card receives a brief scale pulse (Motion `animate` with `scale: [1, 1.02, 1]` over 300ms)
- This is triggered via a workspace action (e.g., `scrollToCard(id)` which the workspace domain provides)

### Data Flow

1. `ReferencePills` receives `references: string[]` (array of card IDs)
2. For each ID, render a `ReferencePill`
3. `ReferencePill` uses `useCardShortname(id)` from workspace store to get the shortname
4. `ReferencePill` uses `useCardData(id)` from card store to get the type (for coloring)
5. If the card does not exist (selector returns undefined), render deleted state

## Demo Reference

**Vignette 1**: A Hypothesis card references two other cards: a SQL card (`@query_1`) and a Literature card (`@lit_search`). Two pills appear: one blue with "@query_1", one green with "@lit_search". Clicking "@query_1" scrolls the workspace to that SQL card.

**Vignette 2**: A card references another card that was deleted. The pill shows "deleted card" in gray with strikethrough. It is not clickable.

## Integration Proofs

1. **Render test**: Set up store with 2 cards. Render `ReferencePills` with their IDs. Assert 2 pills visible with correct shortnames.
2. **Color test**: Reference a SQL card. Assert pill has SQL background color.
3. **Click test**: Click a pill. Assert scroll-to-card action dispatched with correct ID.
4. **Deleted card test**: Reference a non-existent card ID. Assert "deleted card" text visible with strikethrough.
5. **Deleted not clickable test**: Click deleted pill. Assert no scroll action dispatched.
6. **Empty references test**: Render with `references: []`. Assert no pills rendered (or component returns null).
7. **Tooltip test**: Hover over a pill. Assert tooltip shows card shortname and status.

## Acceptance Criteria

- [ ] Pills render for each referenced card ID
- [ ] Pills show `@shortname` with type-colored background and border
- [ ] Clicking a pill triggers workspace scroll-to-card
- [ ] Deleted cards show "deleted card" in muted text with strikethrough
- [ ] Deleted pills are not clickable
- [ ] Empty references array renders nothing
- [ ] Pills use design tokens for colors
- [ ] Hover tooltip shows shortname and status
- [ ] All tests pass

## Anti-Patterns

- Do not fetch card data via API -- use store selectors
- Do not implement scroll behavior in this component -- fire a workspace action
- Do not manage reference arrays here -- references come from the card record
- Do not use Link/router navigation -- scrolling within the workspace is a store action
- Do not render pills if references array is empty
