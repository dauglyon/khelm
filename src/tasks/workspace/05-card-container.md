# WS-05: Card Container with Measurement and Positioning

## Dependencies

- **WS-04** (Masonry Grid): The grid provides the `renderItem` callback pattern that the card container plugs into.

## Context

The card container is a `motion.div` wrapper rendered for each virtual item in the masonry grid. It is the grid cell. The card component (from the card domain) renders inside it. This task focuses on the container's core responsibilities: applying position/size from the virtualizer, attaching the `measureElement` ref for height measurement, and setting up the `layoutId` for detail transitions.

Animation behavior (enter animation, detail transition) is wired in subsequent tasks (WS-06, WS-07). This task establishes the structural wrapper.

Architecture reference: `architecture/workspace.md` -- Section "Card Container".

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/CardContainer.tsx` | motion.div wrapper for each grid cell | ~80 |
| `src/features/workspace/CardContainer.css.ts` | Styles for the container | ~20 |
| `src/features/workspace/CardContainer.test.tsx` | Tests for positioning, measurement, a11y | ~100 |

### Props

| Prop | Type | Description |
|------|------|-------------|
| `cardId` | `string` | Unique card identifier |
| `style` | `CSSProperties` | Position/size from virtualizer (`top`, `left`, `width`) |
| `isFirstRender` | `boolean` | Whether this card has never been rendered in this session |
| `onMeasure` | `(el: HTMLElement) => void` | Ref callback for height measurement |
| `children` | `ReactNode` | The card component to render inside |

### Rendering

1. Render a `motion.div` (from Motion library).
2. Apply the `style` prop for absolute positioning (`position: 'absolute'`, `top`, `left`, `width`).
3. Attach a combined ref that:
   - Calls `onMeasure(el)` when the element mounts (for virtualizer height measurement).
   - Stores the element for potential future use.
4. Set `layoutId={cardId}` on the `motion.div` to enable shared-element transitions with the detail overlay (WS-07).
5. Render `children` inside.

### Accessibility

| Attribute | Value |
|-----------|-------|
| `role` | `"listitem"` |
| `aria-setsize` | Total card count (passed as prop or read from store) |
| `aria-posinset` | 1-based index in the order array (passed as prop) |

### Measurement

The `onMeasure` callback must be called with the DOM element when it mounts. This is how `@tanstack/react-virtual` learns each card's actual height. Use a callback ref pattern:

```typescript
const measureRef = useCallback((el: HTMLElement | null) => {
  if (el) onMeasure(el);
}, [onMeasure]);
```

### Additional Props for Accessibility

| Prop | Type | Description |
|------|------|-------------|
| `totalCount` | `number` | Total number of cards (for `aria-setsize`) |
| `orderIndex` | `number` | 0-based index in order array (rendered as `aria-posinset={orderIndex + 1}`) |

## Demo Reference

**Vignette 1:** Each card in the grid is wrapped in a CardContainer. The container positions itself at the correct `top`/`left` computed by the virtualizer. The card component inside renders the card's content.

**Vignette 5:** When the virtualizer measures cards, the `onMeasure` callback reports each card's actual height. If a card's content changes (streaming adds lines), re-measurement updates the layout.

## Integration Proofs

1. **Container applies absolute positioning:**
   ```
   Test: Render CardContainer with style={{ top: 100, left: 200, width: 400 }}.
   Verify the rendered div has position: absolute, top: 100px, left: 200px,
   width: 400px.
   ```

2. **onMeasure is called on mount:**
   ```
   Test: Render CardContainer with an onMeasure mock. Verify onMeasure was
   called with an HTMLElement.
   ```

3. **layoutId is set to cardId:**
   ```
   Test: Render CardContainer with cardId="test-123". Verify the motion.div
   has layoutId="test-123" (inspect via data attribute or Motion internals).
   ```

4. **Accessibility attributes are present:**
   ```
   Test: Render CardContainer with totalCount=10, orderIndex=3.
   Verify role="listitem", aria-setsize="10", aria-posinset="4".
   ```

5. **Children render inside the container:**
   ```
   Test: Render CardContainer with <span>Test Card</span> as children.
   Verify "Test Card" text is in the document.
   ```

## Acceptance Criteria

- [ ] Renders a `motion.div` with absolute positioning from `style` prop
- [ ] `onMeasure` callback ref is called with the DOM element on mount
- [ ] `layoutId` is set to `cardId`
- [ ] `role="listitem"` is set
- [ ] `aria-setsize` and `aria-posinset` are set correctly
- [ ] Children render inside the container
- [ ] Component is memoized with `React.memo` to prevent unnecessary re-renders
- [ ] All tests pass: `npx vitest run src/features/workspace/CardContainer.test.tsx`

## Anti-Patterns

- **Do not** use a regular `div` instead of `motion.div`. The Motion wrapper is needed for `layoutId` and enter animations.
- **Do not** set `height` on the container. Height is determined by content and measured by the virtualizer.
- **Do not** apply Motion's `layout` prop (without "Id" suffix). `layout` enables FLIP on every layout change, which conflicts with virtualization. Only `layoutId` is used (for detail transitions).
- **Do not** inline the card component here. The card domain owns card rendering; this container receives it as `children`.
