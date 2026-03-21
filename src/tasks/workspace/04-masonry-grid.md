# WS-04: Masonry Grid Layout with @tanstack/react-virtual

## Dependencies

- **WS-02** (Store Selectors): `useCardOrder()` to get the list of card IDs to render.
- **WS-03** (Column Count Hook): `useColumnCount` to determine number of lanes and column width.

## Context

The masonry grid is the core layout engine of the workspace. It uses `@tanstack/react-virtual`'s `useVirtualizer` with the `lanes` option to distribute cards across columns using a shortest-column-first algorithm. Cards are absolutely positioned within a scrollable container. The virtualizer handles which items are in the viewport (plus overscan), and the grid computes each item's `top` and `left` based on its lane assignment and cumulative heights.

This task creates the grid layout and positioning logic only. Card containers (WS-05), animations (WS-06), and detail transitions (WS-07) are separate tasks that layer on top.

Architecture reference: `architecture/workspace.md` -- Sections "Masonry Grid" and "Virtualization".

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/MasonryGrid.tsx` | Grid component using useVirtualizer with lanes | ~180 |
| `src/features/workspace/MasonryGrid.css.ts` | Styles for the scroll container and grid wrapper | ~30 |
| `src/features/workspace/MasonryGrid.test.tsx` | Tests for layout, lane assignment, virtualization | ~150 |

### Layout Algorithm

1. Read `order` from `useCardOrder()` to get the array of card IDs.
2. Read `columnCount` and `columnWidth` from `useColumnCount(containerRef)`.
3. Initialize `useVirtualizer` with:
   - `count`: `order.length`
   - `getScrollElement`: returns the scroll container element
   - `estimateSize`: returns `280` (average card height estimate)
   - `lanes`: `columnCount`
   - `overscan`: configured per the spec (see Virtualization Config below)
4. Implement a custom lane assignment function that picks the lane with the smallest cumulative height (shortest-column-first).
5. Render virtual items with absolute positioning:
   - `left`: `laneIndex * (columnWidth + gap)`
   - `top`: cumulative height of prior items in the same lane, plus gap per item
   - `width`: `columnWidth`

### Virtualization Config

| Parameter | Value |
|-----------|-------|
| Estimated item size | 280px |
| Scroll container | The grid's wrapper div (not `window`) |
| Overscan | Use `overscan` option; target ~1.5-2x viewport height worth of items |

### Scroll Container

The grid renders inside a scrollable `div` that fills the app shell's main workspace region. The scroll container must:
- Have `overflow-y: auto`
- Have `position: relative` (for absolute-positioned children)
- Accept a ref for `getScrollElement`

### Grid Container (inner)

The inner container's height is set to `getTotalSize()` from the virtualizer, ensuring the scrollbar reflects total content height.

### Rendering

Each virtual item renders a placeholder `div` (the actual `CardContainer` component from WS-05 will replace this). For this task, render a simple `div` with the card ID as text content, positioned correctly.

The component must accept a `renderCard` prop or use React children/render prop pattern so that WS-05 can provide the actual card container implementation.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `renderItem` | `(cardId: string, style: CSSProperties, measureRef: (el: HTMLElement) => void) => ReactNode` | Render callback for each virtual item |

## Demo Reference

**Vignette 1:** User starts a session and submits 5 queries. Five cards appear in the masonry grid, distributed across columns. On a 1200px container, 3 columns are used. Cards fill the shortest column first.

**Vignette 5:** User has 50+ cards in a session. Only ~15-20 are in the DOM at any time. Scrolling reveals more cards without layout jank. The scroll container is the workspace panel, not the window.

## Integration Proofs

1. **Cards distribute to shortest column:**
   ```
   Test: Add 4 cards to a 2-column grid. First card goes to lane 0, second
   to lane 1, third to lane 0 (if lane 0's cumulative height < lane 1's),
   etc. Verify lane assignments.
   ```

2. **Absolute positioning is correct:**
   ```
   Test: With 2 columns, columnWidth 400, gap 16. First card: left=0, top=0.
   Second card: left=416, top=0. Third card: left=0, top=(height of first
   card + gap). Verify computed styles.
   ```

3. **Virtualizer limits DOM nodes:**
   ```
   Test: Add 100 cards. Verify that significantly fewer than 100 DOM nodes
   are rendered (check querySelectorAll('[role="listitem"]').length).
   ```

4. **Grid container height reflects total content:**
   ```
   Test: Add 10 cards. Verify the inner container div's height equals
   getTotalSize() from the virtualizer.
   ```

5. **renderItem callback receives correct arguments:**
   ```
   Test: Provide a renderItem mock. Verify it is called with (cardId, style,
   measureRef) for each visible virtual item.
   ```

6. **Empty state renders without errors:**
   ```
   Test: Initialize with zero cards. Verify the grid renders an empty
   container without errors.
   ```

## Acceptance Criteria

- [ ] Uses `@tanstack/react-virtual` `useVirtualizer` with `lanes` option
- [ ] Lane assignment implements shortest-column-first algorithm
- [ ] Cards are absolutely positioned with correct `left`, `top`, `width`
- [ ] Scroll container is a div element (not window)
- [ ] `estimateSize` returns 280
- [ ] Overscan configured for 1.5-2x viewport height of items
- [ ] Inner container height set to `getTotalSize()`
- [ ] `renderItem` callback provides cardId, style, and measure ref
- [ ] Empty grid (0 cards) renders without errors
- [ ] Grid container has `role="list"` for accessibility
- [ ] All tests pass: `npx vitest run src/features/workspace/MasonryGrid.test.tsx`

## Anti-Patterns

- **Do not** use `window` as the scroll element. The workspace is one panel in the app shell.
- **Do not** use CSS Grid or Flexbox for the masonry layout. Use absolute positioning computed from the virtualizer.
- **Do not** apply Motion's `layout` prop to grid items. This conflicts with virtualization (see RSH-012).
- **Do not** compute positions in CSS. All positioning is JavaScript-driven via the virtualizer.
- **Do not** render all cards to the DOM. Only virtual items (visible + overscan) should be rendered.
