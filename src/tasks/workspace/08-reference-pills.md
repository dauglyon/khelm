# WS-08: Cross-Card Reference Pills

## Dependencies

- **WS-02** (Store Selectors): `useCardShortname(id)`, `useCard(id)` for pill data.
- **design-system** (Chip): The `Chip` component for pill rendering with type-specific colors.

## Context

Cards can reference other cards by shortname. References appear as inline pill components that display the referenced card's shortname with its type-specific colors. Pills are interactive: clicking one scrolls the workspace to the referenced card and highlights it. Pills also react live to shortname changes and handle the case where a referenced card has been deleted.

This task implements the `ReferencePill` component and the scroll-to-card behavior. The actual insertion of pills into card content (via TipTap mention extension) is part of the input-surface domain. This component is the renderer for those mentions.

Architecture reference: `architecture/workspace.md` -- Section "Cross-Card References".

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/ReferencePill.tsx` | Pill component for cross-card references | ~60 |
| `src/features/workspace/ReferencePill.css.ts` | Styles for pill states (normal, deleted, hover) | ~25 |
| `src/features/workspace/ReferencePill.test.tsx` | Tests for rendering, click behavior, deleted state | ~80 |
| `src/features/workspace/hooks/useScrollToCard.ts` | Hook that scrolls the workspace to a given card ID | ~30 |

### ReferencePill Component

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `cardId` | `string` | ID of the referenced card |

#### Rendering

1. Use `useCard(cardId)` to get the referenced card's state.
2. Use `useCardShortname(cardId)` for the live shortname label.
3. If the card exists:
   - Render using the `Chip` component (from design-system) with:
     - `inputType`: the card's type (for type-specific fg/bg/border colors)
     - `label`: `@{shortname}`
     - `size`: `"sm"`
   - On hover: show tooltip with card title and status.
4. If the card does not exist (deleted):
   - Render with muted styling and strikethrough text.
   - Label: `@deleted`
   - Non-interactive (no click handler).

#### Click Behavior

Clicking a reference pill:
1. Calls `setActiveCard(cardId)` to focus the referenced card.
2. Scrolls the workspace to the referenced card's position.
3. Briefly highlights the card (a visual pulse -- handled by the card container reacting to `activeCardId`).

### useScrollToCard Hook

| Input | Output |
|-------|--------|
| `cardId: string` | Scrolls the workspace scroll container to bring the card into view |

Implementation:
1. Find the card's position in the `order` array.
2. Use the virtualizer's `scrollToIndex` method to scroll to that index.
3. Or: find the card's DOM element by `[data-card-id]` attribute and use `scrollIntoView`.

### Pill Visual Properties

| Property | Value |
|----------|-------|
| Background | Type color background of the referenced card (e.g., SQL: `#E3EDF7`) |
| Border | Type color border of the referenced card |
| Text | Shortname prefixed with `@` |
| Font | Sans, bodySm (13px) |
| Border radius | 9999px (full pill shape) |
| Cursor | pointer (when card exists), default (when deleted) |

## Demo Reference

**Vignette 1:** A hypothesis card references a SQL card. The hypothesis card's content contains a pill showing `@q1` in SQL blue (`#E3EDF7` background, `#2B6CB0` text). Clicking the pill scrolls up to the SQL card and briefly highlights it.

**Vignette 5:** User renames card `q1` to `sales_query`. All pills referencing that card instantly update from `@q1` to `@sales_query` because they subscribe to `useCardShortname`.

## Integration Proofs

1. **Pill renders with correct type colors:**
   ```
   Test: Add a SQL card with shortname "q1". Render ReferencePill for that
   card's ID. Verify the chip has SQL-type background color and displays
   "@q1".
   ```

2. **Pill updates when shortname changes:**
   ```
   Test: Render ReferencePill for card "q1". Update the card's shortname to
   "sales_query". Verify the pill text changes to "@sales_query".
   ```

3. **Deleted card shows muted pill:**
   ```
   Test: Render ReferencePill for a card ID that doesn't exist in the store.
   Verify the pill shows "@deleted" with strikethrough styling.
   ```

4. **Click sets active card:**
   ```
   Test: Render ReferencePill for card "q1". Click it. Verify setActiveCard
   was called with the card's ID.
   ```

5. **Click scrolls to card:**
   ```
   Test: Render ReferencePill in a scrollable container with the target card
   out of view. Click the pill. Verify scroll position changes to bring the
   card into view.
   ```

6. **Hover shows tooltip:**
   ```
   Test: Render ReferencePill. Hover over it. Verify a tooltip appears with
   the card's shortname and status.
   ```

## Acceptance Criteria

- [ ] Pill renders with type-specific colors from the referenced card
- [ ] Pill text shows `@{shortname}` using live `useCardShortname` subscription
- [ ] Shortname changes propagate to all pills referencing that card
- [ ] Deleted cards show `@deleted` with strikethrough, non-interactive
- [ ] Click sets active card and scrolls workspace to the card
- [ ] Hover shows tooltip with card title and status
- [ ] Uses the `Chip` component from design-system (or similar pill styling if Chip is not yet available)
- [ ] All tests pass: `npx vitest run src/features/workspace/ReferencePill.test.tsx`

## Anti-Patterns

- **Do not** store the shortname as a static string in the pill. Subscribe to the live value via `useCardShortname`.
- **Do not** re-render the entire card when a referenced card's shortname changes. Only the pill component should re-render.
- **Do not** use `window.scrollTo` for scrolling. Use the virtualizer's `scrollToIndex` or the scroll container's `scrollIntoView`.
- **Do not** implement the TipTap mention extension here. That belongs in the input-surface domain. This is the render component for mention nodes.
