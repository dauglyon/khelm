# WS-07: Detail Overlay with layoutId Transition

## Dependencies

- **WS-02** (Store Selectors): `useDetailCardId()`, `openDetail(id)`, `closeDetail()` actions.
- **design-system** (Card): The `Card` presentational component for the detail panel surface.

## Context

When a user selects a card for detail view, the card expands from its position in the masonry grid into a larger detail overlay/panel. This uses Motion's `layoutId` feature: the card container in the grid and the detail panel share the same `layoutId={cardId}`, so Motion animates position, size, and border-radius between the two states using FLIP.

This is the one place where Motion's layout animation system is used in the workspace. It works because both the source (card in grid) and target (detail panel) are in the DOM simultaneously during the transition.

Architecture reference: `architecture/workspace.md` -- Sections "Detail Transition" and "Component Tree".

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/DetailOverlay.tsx` | Overlay component with AnimatePresence and layoutId target | ~80 |
| `src/features/workspace/DetailOverlay.css.ts` | Styles for overlay backdrop and detail panel | ~30 |
| `src/features/workspace/DetailOverlay.test.tsx` | Tests for open/close transitions, keyboard dismiss | ~100 |

### Layout

The detail overlay renders as a fixed/absolute positioned layer above the masonry grid. It consists of:

1. **Backdrop**: A semi-transparent overlay covering the workspace. Click to close.
2. **Detail panel**: A `motion.div` with `layoutId={detailCardId}` that serves as the transition target.

### Detail Panel Properties

| Property | Grid State | Detail State |
|----------|-----------|-------------|
| Width | Column width (from grid) | 720px (or responsive: min(720px, 90vw)) |
| Height | Measured card height | Content-driven (auto) |
| Border radius | 8px | 12px |
| Position | In masonry grid | Centered in viewport (or side panel) |

### AnimatePresence

Wrap the detail panel in `AnimatePresence`. When `detailCardId` changes from null to a card ID, the detail panel enters. When it changes back to null, the panel exits. The `layoutId` transition handles the animation between grid position and detail position.

### Backdrop Animation

| Property | Enter | Exit |
|----------|-------|------|
| Opacity | 0 -> 0.3 | 0.3 -> 0 |
| Duration | 300ms | 200ms |
| Background | `rgba(0, 0, 0, 0.3)` | - |

### Close Triggers

| Trigger | Action |
|---------|--------|
| Click backdrop | Call `closeDetail()` |
| Press `Escape` | Call `closeDetail()` |
| Press back button / navigate away | Call `closeDetail()` |

### Content

The detail panel renders the full card detail view. For this task, render a placeholder (card ID + "Detail View" text). The card domain will provide the actual detail content component.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `renderDetail` | `(cardId: string) => ReactNode` | Render callback for detail content |

## Demo Reference

**Vignette 1:** User clicks a card in the grid. The card smoothly expands from its grid position to a centered detail panel (720px wide). Border radius transitions from 8px to 12px. A semi-transparent backdrop fades in behind.

**Vignette 5:** User presses Escape while viewing a card detail. The detail panel shrinks back to its grid position and the backdrop fades out. The card is back in its original grid cell.

## Integration Proofs

1. **Detail opens when detailCardId is set:**
   ```
   Test: Call openDetail('card-1'). Verify the detail overlay is in the
   document with the card-1 content.
   ```

2. **Detail closes when closeDetail is called:**
   ```
   Test: Open detail for card-1. Call closeDetail(). Verify the overlay
   is removed from the document.
   ```

3. **Backdrop click closes detail:**
   ```
   Test: Open detail. Click the backdrop element. Verify closeDetail was
   called and overlay is removed.
   ```

4. **Escape key closes detail:**
   ```
   Test: Open detail. Fire keydown Escape event. Verify closeDetail was
   called.
   ```

5. **layoutId matches the card container:**
   ```
   Test: Open detail for card-1. Verify the detail panel's motion.div has
   layoutId="card-1", matching the CardContainer's layoutId.
   ```

6. **No overlay when detailCardId is null:**
   ```
   Test: With detailCardId === null, verify no overlay element is rendered.
   ```

7. **renderDetail callback receives the correct cardId:**
   ```
   Test: Open detail for card-1. Verify renderDetail was called with
   "card-1".
   ```

## Acceptance Criteria

- [ ] Detail overlay renders when `detailCardId` is non-null
- [ ] Detail panel uses `layoutId={detailCardId}` for shared-element transition
- [ ] `AnimatePresence` wraps the detail panel for enter/exit
- [ ] Backdrop fades in/out with opacity animation
- [ ] Clicking backdrop calls `closeDetail()`
- [ ] Escape key calls `closeDetail()`
- [ ] Detail panel width is 720px (or responsive max)
- [ ] Border radius transitions from 8px to 12px
- [ ] `renderDetail` callback provides the card ID for content rendering
- [ ] Focus is trapped inside the detail overlay when open
- [ ] All tests pass: `npx vitest run src/features/workspace/DetailOverlay.test.tsx`

## Anti-Patterns

- **Do not** use a separate route for the detail view. It is an overlay within the workspace, not a navigation event.
- **Do not** remove the card from the grid when the detail is open. Both the grid card and the detail panel must be in the DOM for `layoutId` to work.
- **Do not** use CSS transitions for the grid-to-detail animation. Motion's `layoutId` handles this with FLIP.
- **Do not** use `portal` to render the overlay outside the workspace. It should be a sibling of the MasonryGrid inside WorkspacePanel.
