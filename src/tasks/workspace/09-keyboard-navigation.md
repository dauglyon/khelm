# WS-09: Keyboard Navigation and Accessibility

## Dependencies

- **WS-04** (Masonry Grid): The grid container where keyboard events are captured.
- **WS-02** (Store Selectors): `useActiveCardId()`, `useCardOrder()`, `setActiveCard()`, `openDetail()`.

## Context

The workspace must be fully keyboard-navigable. Arrow keys move the active card indicator through the `order` array. Enter opens the detail view. Screen readers receive accurate ARIA attributes for the grid structure, and status changes are announced via live regions.

This task adds keyboard event handling to the grid and ensures all ARIA attributes prescribed by the architecture spec are in place.

Architecture reference: `architecture/workspace.md` -- Section "Accessibility".

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/hooks/useKeyboardNavigation.ts` | Keyboard event handler for grid navigation | ~60 |
| `src/features/workspace/hooks/useKeyboardNavigation.test.ts` | Tests for key handling | ~100 |

### Files to Modify

| File | Change | Est. Lines |
|------|--------|-----------|
| `src/features/workspace/MasonryGrid.tsx` | Wire useKeyboardNavigation, add remaining ARIA attrs | ~15 added |
| `src/features/workspace/CardContainer.tsx` | Add `aria-current` on active card | ~5 added |

### Keyboard Behavior

| Key | Action |
|-----|--------|
| `ArrowDown` | Move `activeCardId` to next card in `order` |
| `ArrowUp` | Move `activeCardId` to previous card in `order` |
| `ArrowRight` | Move `activeCardId` to the card in the next column (same relative row) |
| `ArrowLeft` | Move `activeCardId` to the card in the previous column (same relative row) |
| `Enter` | Open detail view for the active card (`openDetail(activeCardId)`) |
| `Escape` | Clear active card (`setActiveCard(null)`) or close detail if open |
| `Home` | Move to first card in `order` |
| `End` | Move to last card in `order` |

### ArrowRight / ArrowLeft in Masonry

In a masonry grid, "next column" navigation requires knowing lane assignments. For simplicity, ArrowRight/ArrowLeft can skip by `columnCount` positions in the `order` array (approximation). If the target index is out of bounds, clamp to first/last.

### Focus Management

- The grid container (`role="list"`) is focusable (`tabIndex={0}`).
- When `activeCardId` changes, the corresponding card container should receive visual focus indicator (via CSS class, not DOM focus -- the grid container retains DOM focus for keyboard capture).
- When a card becomes active, scroll it into view using the virtualizer's `scrollToIndex`.

### ARIA Attributes (Summary)

These should already be partially in place from WS-05. This task ensures completeness:

| Element | Attribute | Value |
|---------|-----------|-------|
| Grid container | `role` | `"list"` |
| Grid container | `aria-label` | `"Session workspace cards"` |
| Card container | `role` | `"listitem"` |
| Card container | `aria-setsize` | Total card count |
| Card container | `aria-posinset` | 1-based order index |
| Active card | `aria-current` | `"true"` |

### Live Region for Status Changes

Add a visually-hidden `aria-live="polite"` region to the workspace. When a card's status changes (e.g., `thinking` -> `running` -> `complete`), announce it: `"Card {shortname} status: {status}"`.

Implementation: subscribe to card status changes in the store and update the live region text.

## Demo Reference

**Vignette 1:** User tabs to the workspace grid. Presses ArrowDown twice to navigate to the third card. The third card shows a focus ring. Presses Enter to open it in detail view.

**Vignette 5:** A screen reader user navigates the grid. Each card announces its shortname, type, and status. When a streaming card completes, the screen reader announces "Card q1 status: complete".

## Integration Proofs

1. **ArrowDown moves to next card:**
   ```
   Test: Set activeCardId to first card. Fire keydown ArrowDown on the grid
   container. Verify activeCardId is now the second card.
   ```

2. **ArrowUp moves to previous card:**
   ```
   Test: Set activeCardId to second card. Fire keydown ArrowUp. Verify
   activeCardId is now the first card.
   ```

3. **ArrowDown at last card stays at last card:**
   ```
   Test: Set activeCardId to last card. Fire keydown ArrowDown. Verify
   activeCardId is still the last card (no wrap, no error).
   ```

4. **Enter opens detail:**
   ```
   Test: Set activeCardId to card-1. Fire keydown Enter. Verify
   openDetail was called with "card-1".
   ```

5. **Escape clears active card:**
   ```
   Test: Set activeCardId to card-1. Fire keydown Escape. Verify
   setActiveCard was called with null.
   ```

6. **Active card shows aria-current:**
   ```
   Test: Set activeCardId to card-1. Verify the card container for card-1
   has aria-current="true". Other card containers do not.
   ```

7. **Status change announced in live region:**
   ```
   Test: Add a card with status "thinking". Update status to "complete".
   Verify the live region text includes "complete".
   ```

8. **Active card scrolls into view:**
   ```
   Test: Add 50 cards. Set activeCardId to card 45 (likely off-screen).
   Verify scrollToIndex was called or the card is now visible.
   ```

## Acceptance Criteria

- [ ] Arrow keys navigate `activeCardId` through `order` array
- [ ] Enter opens detail view for active card
- [ ] Escape clears active card (or closes detail if open)
- [ ] Home/End move to first/last card
- [ ] Active card has `aria-current="true"`
- [ ] Grid container has `role="list"` and `aria-label`
- [ ] Card containers have `role="listitem"`, `aria-setsize`, `aria-posinset`
- [ ] Live region announces card status changes
- [ ] Active card is scrolled into view when changed via keyboard
- [ ] Grid container is focusable (`tabIndex={0}`)
- [ ] All tests pass: `npx vitest run src/features/workspace/hooks/useKeyboardNavigation.test.ts`

## Anti-Patterns

- **Do not** move DOM focus to individual cards. Keep focus on the grid container and use `aria-current` + visual styles to indicate the active card. Moving DOM focus disrupts screen reader flow.
- **Do not** use `tabIndex` on individual card containers. Only the grid container is in the tab order.
- **Do not** use `aria-activedescendant` without setting the corresponding `id` on card containers. If using this pattern, ensure IDs are set.
- **Do not** announce every streaming token via the live region. Only announce status transitions.
