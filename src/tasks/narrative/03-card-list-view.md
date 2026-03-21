# Task 03: CardListView (Compressed Card List with Selection)

## Dependencies

| Dependency | Domain | What's Needed |
|------------|--------|---------------|
| 01-narrative-store | narrative | `useNarrativeMode`, `useIsCardSelected`, `toggleCard`, `useSelectedCardIds` |
| 02-composition-toggle | narrative | Composition mode can be entered/exited |
| Card component | card | The existing `Card` component for rendering card content |
| CardContainer | workspace | Card wrapper pattern (may reuse or adapt) |
| Workspace store | workspace | `useCardOrder()` for the list of all cards, `useCard(id)` for status checks |

## Context

When composition mode is active, the masonry grid transforms into a single-column card list. This compressed view renders the same card components but at a fixed narrow width to make room for the composition panel on the right. Each card gains a selection checkbox.

The `CardListView` replaces the `MasonryGrid` when `mode === 'composition'`. It renders all cards from the workspace in a vertical scroll list with checkboxes for selection.

## Implementation Requirements

### Files to Create

1. **`src/features/narrative/CardListView.tsx`** (~130 lines)
2. **`src/features/narrative/CardListView.css.ts`** (~50 lines)

### Component: `CardListView`

| Aspect | Detail |
|--------|--------|
| Layout | Single-column vertical list, fixed width (~50% viewport or remaining space after composition panel) |
| Card rendering | Renders existing `Card` components at the compressed width |
| Checkbox | Each card has a checkbox control to the left of the card |
| Disabled cards | Cards with `thinking` or `running` status show a disabled checkbox (grayed out, not clickable) |
| Selected highlight | Selected cards show a highlight border using `#2B6CB0` (running status color) |
| Scroll | Independent vertical scroll |

### Selection Behavior

| Interaction | Effect |
|-------------|--------|
| Click checkbox | Calls `toggleCard(cardId)` from narrative store |
| Click card body | Normal card interaction (does NOT toggle selection) |
| Checkbox on disabled card | Visually disabled, click is no-op |

### Checkbox Element

| Property | Value |
|----------|-------|
| Type | Native `<input type="checkbox">` |
| Checked | `useIsCardSelected(cardId)` |
| Disabled | Card status is `thinking` or `running` |
| Label | `aria-label="Select {card.shortname} for narrative"` |
| Position | Left of card, vertically centered |

### Layout Integration

The `CardListView` is shown conditionally:
- `mode === 'default'`: render the masonry grid (existing workspace component)
- `mode === 'composition'`: render `CardListView` instead

This conditional rendering happens in the workspace panel or a parent layout component that wraps both views.

## Demo Reference

Vignette 5: entering composition mode compresses the card grid into a single-column list with checkboxes.

## Integration Proofs

```bash
# Component renders and tests pass
npx vitest run src/features/narrative/CardListView.test.tsx

# Tests verify:
# 1. Renders a card for each item in workspace order
# 2. Each card has a checkbox
# 3. Clicking checkbox calls toggleCard with correct ID
# 4. Selected cards show highlight border
# 5. Disabled cards (thinking/running) have disabled checkbox
# 6. Scrolls independently
```

### Test File

Create **`src/features/narrative/CardListView.test.tsx`** (~100 lines) with:
- Render test: displays cards from workspace store in order
- Checkbox render: each card has an associated checkbox
- Selection: clicking checkbox calls `toggleCard`
- Highlight: selected cards receive highlight border class
- Disabled: `thinking`/`running` cards have disabled checkboxes
- Accessibility: checkboxes have correct `aria-label`

## Acceptance Criteria

- [ ] `CardListView` renders all workspace cards in a single-column vertical list
- [ ] Each card has a checkbox to its left
- [ ] Clicking a checkbox calls `toggleCard(cardId)` on the narrative store
- [ ] Selected cards display a highlight border (`#2B6CB0`)
- [ ] Cards with `thinking` or `running` status have disabled checkboxes
- [ ] Checkboxes have `aria-label` referencing the card's shortname
- [ ] Component only renders when `mode === 'composition'`
- [ ] List scrolls independently of the composition panel
- [ ] All tests pass: `npx vitest run src/features/narrative/CardListView.test.tsx`

## Anti-Patterns

- Do NOT re-implement card rendering. Reuse the existing `Card` component from the card domain.
- Do NOT use a virtualized list here. The compressed card list is simpler than the masonry grid; virtualization can be added later if needed.
- Do NOT allow selecting cards by clicking the card body. Only the checkbox toggles selection.
- Do NOT store the card list order in the narrative store. The list order comes from the workspace store's `order` array.
- Do NOT apply masonry or multi-column layout. This is explicitly a single-column list.
