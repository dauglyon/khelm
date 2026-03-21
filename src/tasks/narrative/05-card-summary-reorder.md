# Task 05: CardSummary + Drag Reorder

## Dependencies

| Dependency | Domain | What's Needed |
|------------|--------|---------------|
| 01-narrative-store | narrative | `useOrderedCardIds`, `reorderCards` |
| 04-composition-panel | narrative | `CompositionPanel` body slot to render into |
| Card types | card | `CardType` enum, type color mapping |
| Workspace store | workspace | `useCard(id)` to read card shortname, type, content |

## Context

Inside the `CompositionPanel`, selected cards appear as compact summary rows in the order defined by `orderedCardIds`. Each summary shows a drag handle, type badge, card title, and a truncated content preview. The list is reorderable via drag-and-drop using dnd-kit's sortable list.

This is a simple vertical sortable list (not a masonry grid), so the dnd-kit + Motion transform conflict documented in RSH-010 does not apply. Both libraries coexist without issue in single-axis vertical lists.

## Implementation Requirements

### Files to Create

1. **`src/features/narrative/CardSummary.tsx`** (~100 lines)
2. **`src/features/narrative/CardSummaryList.tsx`** (~100 lines)
3. **`src/features/narrative/CardSummary.css.ts`** (~50 lines)

### Component: `CardSummary`

A single row representing one card in the composition order.

| Element | Detail |
|---------|--------|
| Drag handle | Grip dots icon on the left; `role="button"`, `aria-roledescription="sortable"` (dnd-kit default) |
| Type badge | Pill showing card type name, styled with the type's foreground/background colors |
| Title | Card shortname, truncated with ellipsis if too long |
| Content preview | First ~80 chars of card content, truncated, in `textLight` color |
| Layout | Horizontal flex row: handle, badge, title+preview stack |

### Props

| Prop | Type | Description |
|------|------|-------------|
| `cardId` | `string` | Card ID to render summary for |
| `dragHandleProps` | dnd-kit attributes | Spread onto the drag handle element |

### Component: `CardSummaryList`

The wrapper that sets up dnd-kit context and renders `CardSummary` items.

| Aspect | Detail |
|--------|--------|
| Library | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Strategy | `verticalListSortingStrategy` |
| Items | `orderedCardIds` from narrative store |
| onDragEnd | Extract `active.id` and `over.id`, compute indices, call `reorderCards(fromIndex, toIndex)` |
| Animation | Motion `layout` prop on each `CardSummary` wrapper for FLIP reorder animation |

### dnd-kit Setup

```
DndContext
  SortableContext (items={orderedCardIds}, strategy={verticalListSortingStrategy})
    CardSummary[] (each wrapped with useSortable)
```

| Config | Value |
|--------|-------|
| Sensors | `PointerSensor` + `KeyboardSensor` |
| Collision detection | `closestCenter` |
| Modifiers | None (vertical only, no constraints needed) |

### Keyboard Accessibility

dnd-kit provides built-in keyboard support:
- Space to grab/drop
- Arrow keys (Up/Down) to move
- Escape to cancel
- ARIA live region announcements: "Card moved from position N to position M"

### Styling

- Card summary rows have `surface` background, `border` bottom separator
- Drag handle uses `textLight` color, darkens on hover
- Type badge uses the type-specific foreground/background colors from the design tokens
- Active drag item gets a subtle shadow elevation
- Drop placeholder shows a dashed border indicator

## Demo Reference

Vignette 5: the user drags cards up and down in the composition panel to reorder them.

## Integration Proofs

```bash
# Components render and tests pass
npx vitest run src/features/narrative/CardSummary.test.tsx
npx vitest run src/features/narrative/CardSummaryList.test.tsx

# Tests verify:
# 1. CardSummary renders drag handle, type badge, title, preview
# 2. CardSummaryList renders one CardSummary per orderedCardId
# 3. Drag-and-drop reorder calls reorderCards with correct indices
# 4. Type badge uses correct colors for each card type
# 5. Content preview is truncated
# 6. ARIA attributes present on drag handle
```

### Test Files

Create **`src/features/narrative/CardSummary.test.tsx`** (~60 lines):
- Renders type badge with correct card type text
- Renders card shortname as title
- Renders truncated content preview
- Drag handle has correct ARIA attributes

Create **`src/features/narrative/CardSummaryList.test.tsx`** (~80 lines):
- Renders correct number of `CardSummary` items
- Items appear in `orderedCardIds` order
- DndContext wrapper present
- Simulated drag-end calls `reorderCards` with correct indices

## Acceptance Criteria

- [ ] `CardSummary` renders drag handle, type badge, shortname, and truncated content preview
- [ ] Type badge uses the correct foreground/background colors for the card's type
- [ ] Content preview is truncated to ~80 characters with ellipsis
- [ ] `CardSummaryList` renders one `CardSummary` per entry in `orderedCardIds`
- [ ] Drag handle has `role="button"` and `aria-roledescription="sortable"`
- [ ] Drag-and-drop reorder fires `reorderCards(fromIndex, toIndex)` on the narrative store
- [ ] Motion `layout` prop applied to card summary wrappers for smooth reorder animation
- [ ] Keyboard reorder works: Space to grab, arrows to move, Space to drop
- [ ] ARIA live region announces position changes during drag
- [ ] All tests pass

## Anti-Patterns

- Do NOT use `@dnd-kit/core` alone. Use `@dnd-kit/sortable` which provides `useSortable`, `SortableContext`, and `verticalListSortingStrategy`.
- Do NOT implement horizontal or 2D drag. This is a vertical-only sortable list.
- Do NOT read full card content for the preview. Read only what's needed (shortname, type, first ~80 chars of content).
- Do NOT store drag state in the narrative Zustand store. Drag state is transient and managed by dnd-kit internally.
- Do NOT render connective text editors in this component. Those slot between `CardSummary` items and are built in task 06.
