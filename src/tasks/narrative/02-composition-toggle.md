# Task 02: Composition Mode Toggle

## Dependencies

| Dependency | Domain | What's Needed |
|------------|--------|---------------|
| 01-narrative-store | narrative | `enterComposition`, `exitComposition`, `useNarrativeMode`, `useSelectedCount` |
| Button, IconButton | design-system | Styled button primitives |
| Toolbar slot | app-shell | Insertion point in the app toolbar for composition controls |

## Context

The workspace operates in two mutually exclusive modes: default (masonry grid, full width) and composition (compressed card list + side panel). This task builds the `CompositionToolbar` component that provides the entry/exit controls for composition mode, plus bulk selection actions (Select All, Clear) and a count badge.

The toolbar controls are rendered in the app shell's toolbar area. They are always visible but change behavior based on the current mode.

## Implementation Requirements

### Files to Create

1. **`src/features/narrative/CompositionToolbar.tsx`** (~100 lines)
2. **`src/features/narrative/CompositionToolbar.css.ts`** (~50 lines)

### Component: `CompositionToolbar`

| Element | Default Mode | Composition Mode |
|---------|-------------|-----------------|
| Primary button | "Compose" (enters composition mode) | "Exit" (exits composition mode) |
| Select All button | Hidden | Visible; calls `selectAll` with eligible card IDs |
| Clear button | Hidden | Visible (disabled when selection empty); calls `clearSelection` |
| Count badge | Hidden | Visible: "N selected" pill |

### Behavior

| Action | Effect |
|--------|--------|
| Click "Compose" | Calls `enterComposition()` from narrative store |
| Click "Exit" | Calls `exitComposition()` from narrative store |
| Click "Select All" | Reads all card IDs from workspace store, filters out `thinking`/`running`, calls `selectAll(eligibleIds)` |
| Click "Clear" | Calls `clearSelection()` from narrative store |

### Accessibility

| Concern | Implementation |
|---------|---------------|
| Compose/Exit button | `aria-pressed` reflecting current mode (`true` when in composition) |
| Count badge | `aria-live="polite"` so screen readers announce selection changes |
| Select All / Clear | Standard button semantics; disabled state communicated via `aria-disabled` |

### Styling

- Use vanilla-extract for all styles
- Compose button uses the `running` status color (`#2B6CB0`) as accent when in composition mode
- Count badge uses a pill shape with the same accent color
- Buttons use design-system `Button` / `IconButton` primitives

## Demo Reference

Vignette 5: the toolbar shows a "Compose" button that transforms the workspace layout when clicked.

## Integration Proofs

```bash
# Component renders without errors
npx vitest run src/features/narrative/CompositionToolbar.test.tsx

# Tests verify:
# 1. "Compose" button visible in default mode
# 2. Clicking "Compose" calls enterComposition and switches to composition mode
# 3. "Exit" button visible in composition mode
# 4. Clicking "Exit" calls exitComposition and returns to default mode
# 5. "Select All" and "Clear" buttons appear only in composition mode
# 6. Count badge shows correct number
# 7. aria-pressed reflects mode state
```

### Test File

Create **`src/features/narrative/CompositionToolbar.test.tsx`** (~80 lines) with:
- Render test: default mode shows "Compose" button
- Render test: composition mode shows "Exit", "Select All", "Clear", count badge
- Click test: "Compose" triggers `enterComposition`
- Click test: "Exit" triggers `exitComposition`
- Click test: "Select All" passes eligible IDs to `selectAll`
- Click test: "Clear" triggers `clearSelection`
- Accessibility: `aria-pressed` attribute toggles with mode

## Acceptance Criteria

- [ ] `CompositionToolbar` renders "Compose" button in default mode
- [ ] Clicking "Compose" calls `enterComposition()` and UI switches to composition controls
- [ ] Composition mode shows "Exit", "Select All", "Clear", and count badge
- [ ] "Select All" filters out `thinking`/`running` cards before calling `selectAll`
- [ ] "Clear" is disabled when `selectedCount === 0`
- [ ] Count badge displays correct selection count with `aria-live="polite"`
- [ ] `aria-pressed` on the compose/exit button reflects the current mode
- [ ] All tests pass: `npx vitest run src/features/narrative/CompositionToolbar.test.tsx`

## Anti-Patterns

- Do NOT add mode-switching logic to the component. All state transitions go through the narrative store actions.
- Do NOT read individual card data in this component. Only read card IDs and statuses for the "Select All" filter.
- Do NOT render the card list or composition panel in this component. This is toolbar controls only.
- Do NOT use inline styles. Use vanilla-extract `.css.ts` files.
- Do NOT add keyboard shortcuts for composition mode toggle in this task. That can be added later.
