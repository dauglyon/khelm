# WS-03: Column Count Hook with ResizeObserver

## Dependencies

- **design-system** (tokens): The `space.gridGap` token for gap calculation. If not yet available, use a local constant and mark for extraction.

## Context

The masonry grid needs to know how many columns to render. Column count is derived from the grid container's width (not the viewport width), using a `ResizeObserver`. This hook encapsulates that logic and returns the current column count plus computed column width.

The responsive breakpoints are prescribed in `architecture/workspace.md` -- Section "Responsive Breakpoints".

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/hooks/useColumnCount.ts` | Hook that observes container width and returns column count + column width | ~50 |
| `src/features/workspace/hooks/useColumnCount.test.ts` | Tests for breakpoint thresholds | ~80 |

### Breakpoint Table

| Container Width | Columns |
|----------------|---------|
| < 640px | 1 |
| 640 - 1023px | 2 |
| 1024 - 1439px | 3 |
| >= 1440px | 4 |

### Hook Signature

```typescript
function useColumnCount(containerRef: RefObject<HTMLElement | null>): {
  columnCount: number;
  columnWidth: number;
}
```

### Behavior

- Attach a `ResizeObserver` to the container element referenced by `containerRef`.
- On resize, read `contentBoxSize` (or `contentRect.width` as fallback) and compute column count from the breakpoint table.
- Compute `columnWidth` as: `(containerWidth - (columnCount - 1) * gap) / columnCount`.
- Use the grid gap from design tokens (`space.gridGap`). If not yet available, define a local constant (e.g., `GRID_GAP = 16`).
- Clean up the `ResizeObserver` on unmount.
- Return initial values of `{ columnCount: 1, columnWidth: 0 }` before the first observation.

### Edge Cases

- Container ref may be null on first render (before DOM mount). Handle gracefully.
- Container width of 0 (collapsed sidebar, hidden tab). Return `columnCount: 1`.

## Demo Reference

**Vignette 1:** User resizes the browser window. The grid container's width changes from 1200px to 800px. The hook detects the resize via `ResizeObserver`, updates `columnCount` from 3 to 2, and the masonry grid re-layouts.

**Vignette 5:** On a 1920px display with sidebar open (sidebar is 320px), the container is ~1576px wide, yielding 4 columns. When sidebar opens/closes, the container width changes and the hook recalculates.

## Integration Proofs

1. **Returns 1 column for narrow containers:**
   ```
   Test: Render a div with width 500px. Pass its ref to useColumnCount.
   Verify columnCount === 1.
   ```

2. **Returns correct column count at each breakpoint:**
   ```
   Test: For widths [639, 640, 1023, 1024, 1439, 1440], verify column counts
   [1, 2, 2, 3, 3, 4].
   ```

3. **Reacts to container resize:**
   ```
   Test: Start with width 800px (2 columns). Programmatically resize to
   1200px. Verify columnCount updates to 3.
   ```

4. **Handles null ref gracefully:**
   ```
   Test: Pass a ref with current === null. Verify returns { columnCount: 1,
   columnWidth: 0 } without errors.
   ```

5. **Column width calculation is correct:**
   ```
   Test: Container width 1040px, gap 16px, 3 columns.
   columnWidth = (1040 - 2 * 16) / 3 = 336.
   ```

## Acceptance Criteria

- [ ] Hook uses `ResizeObserver` on the container element (not `window.onresize`)
- [ ] All four breakpoints return correct column counts
- [ ] Column width is computed accounting for gaps between columns
- [ ] `ResizeObserver` is disconnected on unmount (no memory leak)
- [ ] Null/undefined container ref handled without error
- [ ] Zero-width container returns `columnCount: 1`
- [ ] All tests pass: `npx vitest run src/features/workspace/hooks/useColumnCount.test.ts`

## Anti-Patterns

- **Do not** use `window.innerWidth` or viewport media queries. Column count is based on container width.
- **Do not** debounce the `ResizeObserver` callback. `ResizeObserver` already batches observations to animation frames.
- **Do not** store column count in the Zustand store. It is UI-derived state that belongs in a hook.
- **Do not** use `Element.clientWidth` when `contentBoxSize` is available (it includes padding).
