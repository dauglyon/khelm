# WS-10: WorkspacePanel Composition and Integration

## Dependencies

- **WS-04** (Masonry Grid): The grid component.
- **WS-05** (Card Container): The card container wrapper.
- **WS-06** (Enter Animations): Animation behavior on containers.
- **WS-07** (Detail Overlay): The detail view overlay.
- **WS-08** (Reference Pills): Cross-card reference rendering.
- **WS-09** (Keyboard Navigation): Keyboard handling and a11y.
- **app-shell**: The layout region where `WorkspacePanel` is mounted.

## Context

`WorkspacePanel` is the top-level composition component for the workspace domain. It assembles the `MasonryGrid`, `CardContainer`, `DetailOverlay`, and keyboard navigation into a single component that the app shell mounts in its main workspace region.

This task is primarily about wiring -- connecting the grid's `renderItem` callback to `CardContainer`, providing the `renderDetail` callback to `DetailOverlay`, and ensuring the scroll container ref is shared between the grid and keyboard navigation.

Architecture reference: `architecture/workspace.md` -- Section "Component Tree".

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/WorkspacePanel.tsx` | Composition root for the workspace | ~60 |
| `src/features/workspace/WorkspacePanel.test.tsx` | Integration tests with mock card data | ~120 |
| `src/features/workspace/index.ts` | Barrel export for the workspace domain | ~10 |

### Component Tree

```
WorkspacePanel
  MasonryGrid (useVirtualizer, lanes)
    CardContainer[] (motion.div, virtual items)
      {children} (card domain placeholder)
  DetailOverlay (AnimatePresence)
    {renderDetail} (card domain placeholder)
```

### WorkspacePanel Responsibilities

1. **Render the scroll container div** that serves as both the MasonryGrid's scroll element and the keyboard navigation target.
2. **Provide `renderItem` callback** to MasonryGrid that renders a `CardContainer` for each virtual item, passing in the card ID, positioning style, and measure ref.
3. **Render `DetailOverlay`** as a sibling to MasonryGrid inside the scroll container, providing a `renderDetail` callback.
4. **Wire keyboard navigation** via `useKeyboardNavigation` on the scroll container.
5. **Accept a `renderCard` prop** from the parent (app shell) that provides the actual card component from the card domain. Default to a placeholder if not provided.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `renderCard` | `(cardId: string) => ReactNode` | Optional render callback for card content (from card domain) |
| `renderDetail` | `(cardId: string) => ReactNode` | Optional render callback for detail content (from card domain) |

### Default Placeholders

If `renderCard` or `renderDetail` are not provided, render a simple placeholder showing the card ID, shortname, and type. This allows the workspace to be developed and tested independently of the card domain.

### Barrel Export

`src/features/workspace/index.ts` exports:
- `WorkspacePanel` component
- All store exports (re-export from `store/index.ts`)
- `ReferencePill` component (used by other domains, e.g., input-surface)

### Integration Test Strategy

The integration test should:
1. Populate the store with mock card data (5-10 cards of various types and statuses).
2. Render `WorkspacePanel` with default placeholders.
3. Verify:
   - Cards are visible in the grid.
   - Cards are positioned in a masonry layout (check different `left` values).
   - Keyboard navigation works (ArrowDown changes active card).
   - Opening a detail view shows the overlay.
   - Closing the detail view returns to the grid.

## Demo Reference

**Vignette 1:** The full workspace is visible. Five cards of different types are arranged in a 3-column masonry grid. Each card shows its shortname and type badge. Clicking a card opens it in the detail overlay. Pressing Escape closes the overlay.

**Vignette 5:** A dense session with 30+ cards. Scrolling is smooth. New cards animate in. Keyboard navigation moves through cards. Reference pills in card content are clickable. The detail overlay transitions smoothly.

## Integration Proofs

1. **WorkspacePanel renders cards from the store:**
   ```
   Test: Add 5 cards to the store. Render WorkspacePanel. Verify 5 card
   containers are in the document (or at least the visible ones).
   ```

2. **Cards are positioned in multiple columns:**
   ```
   Test: Add 4 cards. Render on a container wide enough for 2 columns.
   Verify at least 2 different `left` values among the card containers.
   ```

3. **Keyboard navigation works end-to-end:**
   ```
   Test: Add 3 cards. Focus the workspace. Press ArrowDown. Verify the
   second card has aria-current="true".
   ```

4. **Detail overlay opens on Enter:**
   ```
   Test: Add a card. Set it as active. Press Enter. Verify the DetailOverlay
   is rendered with that card's content.
   ```

5. **Detail overlay closes on Escape:**
   ```
   Test: Open detail for a card. Press Escape. Verify the overlay is
   removed.
   ```

6. **Placeholder renders when renderCard is not provided:**
   ```
   Test: Render WorkspacePanel without renderCard prop. Verify placeholder
   content (card ID text) is visible.
   ```

7. **Custom renderCard is called:**
   ```
   Test: Provide a renderCard mock. Render WorkspacePanel with cards.
   Verify renderCard was called with each visible card's ID.
   ```

8. **Empty workspace renders without errors:**
   ```
   Test: Render WorkspacePanel with no cards in the store. Verify no errors,
   empty grid container is in the document.
   ```

## Acceptance Criteria

- [ ] `WorkspacePanel` renders `MasonryGrid` + `DetailOverlay` as prescribed component tree
- [ ] `renderItem` callback connects to `CardContainer` correctly
- [ ] Keyboard navigation is wired to the scroll container
- [ ] Detail overlay opens/closes via store actions
- [ ] `renderCard` and `renderDetail` props allow card domain to provide content
- [ ] Default placeholders work when card domain is not yet integrated
- [ ] Barrel export at `src/features/workspace/index.ts` exports all public API
- [ ] Empty workspace state renders without errors
- [ ] Integration test passes with 5+ mock cards: `npx vitest run src/features/workspace/WorkspacePanel.test.tsx`
- [ ] All workspace tests pass: `npx vitest run src/features/workspace/`

## Anti-Patterns

- **Do not** import card domain components directly. Use the `renderCard`/`renderDetail` render props to maintain domain boundaries.
- **Do not** duplicate store logic in WorkspacePanel. All state access goes through selectors from WS-02.
- **Do not** add feature logic (streaming, classification, collaboration) to WorkspacePanel. It is a composition root only.
- **Do not** use `window` as the scroll container. The workspace panel provides its own scroll container div.
