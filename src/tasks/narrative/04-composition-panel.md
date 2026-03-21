# Task 04: CompositionPanel Shell

## Dependencies

| Dependency | Domain | What's Needed |
|------------|--------|---------------|
| 01-narrative-store | narrative | `useNarrativeMode`, `useOrderedCardIds`, `useSelectedCount`, `openPreview`, `exitComposition` |
| 02-composition-toggle | narrative | Composition mode can be entered/exited |
| Layout primitives | design-system | Box/flex layout components, if available |
| Button | design-system | Button component for header actions |

## Context

The `CompositionPanel` is a fixed-width side panel that appears to the right of the compressed card list when composition mode is active. This task builds the panel shell: the outer container, header with action buttons (Preview, Export, Close), and the empty state. The panel's inner content (card summaries and connective editors) is populated by tasks 05 and 06.

The panel takes approximately 50% of the viewport width. The card list takes the remaining space.

## Implementation Requirements

### Files to Create

1. **`src/features/narrative/CompositionPanel.tsx`** (~120 lines)
2. **`src/features/narrative/CompositionPanel.css.ts`** (~80 lines)

### Component: `CompositionPanel`

| Section | Content |
|---------|---------|
| Header | Title "Narrative Composition", action buttons: Preview, Export, Close |
| Body | Scrollable container for card summaries + connective editors (children slot) |
| Empty state | When `orderedCardIds.length === 0`: centered text "Select cards from the workspace to begin composing" |

### Header Buttons

| Button | Behavior | Disabled When |
|--------|----------|---------------|
| Preview | Calls `openPreview()` | `orderedCardIds.length === 0` |
| Export | Calls export handler (wired in task 08) | `orderedCardIds.length === 0` |
| Close | Calls `exitComposition()` | Never |

### Layout

| Property | Value |
|----------|-------|
| Width | `~50%` of viewport (or `calc(50vw)`) |
| Position | Fixed to right side of workspace area |
| Height | Full height of workspace area minus toolbar |
| Scroll | Body section scrolls independently; header stays fixed at top |
| Background | `surface` token (`#F9FAF7`) |
| Border | Left border using `border` token (`#D5DAD0`) |

### Panel Visibility

- Panel is rendered only when `mode === 'composition'`
- Animate entry/exit with Motion `AnimatePresence`:
  - Enter: slide in from right (`initial={{ x: '100%' }}`, `animate={{ x: 0 }}`)
  - Exit: slide out to right (`exit={{ x: '100%' }}`)
  - Duration: 300ms, easing: `outQuart`

### Children Slot

The panel body accepts `children` so that tasks 05 and 06 can render card summaries and connective editors inside it. For this task, the body renders:
- Empty state message when no cards selected
- `{children}` when cards are selected

## Demo Reference

Vignette 5: the composition panel slides in from the right when the user enters composition mode.

## Integration Proofs

```bash
# Component renders and tests pass
npx vitest run src/features/narrative/CompositionPanel.test.tsx

# Tests verify:
# 1. Panel renders when mode is 'composition'
# 2. Panel does not render when mode is 'default'
# 3. Header shows "Narrative Composition" title
# 4. Preview and Export buttons disabled when no cards selected
# 5. Close button calls exitComposition
# 6. Empty state message shown when orderedCardIds is empty
# 7. Children rendered when cards are selected
```

### Test File

Create **`src/features/narrative/CompositionPanel.test.tsx`** (~90 lines) with:
- Visibility: renders in composition mode, absent in default mode
- Header: title text present
- Buttons: Preview disabled when no selection, enabled with selection
- Buttons: Close calls `exitComposition`
- Empty state: message rendered when `orderedCardIds` is empty
- Children: renders children prop when cards exist
- Animation: Motion `AnimatePresence` wrapper exists (structural test)

## Acceptance Criteria

- [ ] `CompositionPanel` renders only when `mode === 'composition'`
- [ ] Panel slides in from right with Motion animation on entry
- [ ] Panel slides out to right on exit via `AnimatePresence`
- [ ] Header displays "Narrative Composition" title
- [ ] Preview and Export buttons are disabled when no cards are selected
- [ ] Close button calls `exitComposition()`
- [ ] Empty state message displayed when `orderedCardIds` is empty
- [ ] Panel body scrolls independently with fixed header
- [ ] Panel accepts and renders `children` for card summaries and editors
- [ ] All tests pass: `npx vitest run src/features/narrative/CompositionPanel.test.tsx`

## Anti-Patterns

- Do NOT render card summaries or connective editors in this task. Those are tasks 05 and 06.
- Do NOT implement the export API call in this task. The Export button is wired as a prop/callback placeholder for task 08.
- Do NOT use absolute positioning for the panel. Use CSS flexbox with the card list so they share the viewport naturally.
- Do NOT hardcode pixel widths. Use relative units or CSS `calc()` with design tokens.
- Do NOT add drag-and-drop logic to this component. That belongs in task 05.
