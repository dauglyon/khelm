# WS-06: Enter Animations on Card Containers

## Dependencies

- **WS-05** (Card Container): The `motion.div` wrapper where animations are applied.
- **WS-02** (Store Selectors): `useIsFirstRender(id)` and `markRendered(id)` for animation gating.

## Context

When a card first appears in the viewport (either newly created or first scrolled into view), it plays a fade + slide-up animation. Cards that have been rendered previously (scrolled out and back in) do not replay the animation. This is tracked via the `renderedCardIds` set in the session store.

The animation uses Motion's `initial` / `animate` props on the card container's `motion.div`. There is no exit animation (`AnimatePresence` is not used for grid items -- see architecture decision in RSH-012).

Architecture reference: `architecture/workspace.md` -- Section "Animation".

## Implementation Requirements

### Files to Modify

| File | Change | Est. Lines |
|------|--------|-----------|
| `src/features/workspace/CardContainer.tsx` | Add `initial`/`animate` props to motion.div, integrate first-render gating | ~30 added |

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/CardContainer.animation.test.tsx` | Tests for enter animation behavior | ~100 |

### Enter Animation Config

| Property | Value |
|----------|-------|
| `initial` | `{ opacity: 0, y: 20 }` (only when `isFirstRender` is true) |
| `animate` | `{ opacity: 1, y: 0 }` |
| Duration | 300ms |
| Easing | `outQuart` (`cubic-bezier(0.25, 1, 0.5, 1)`) -- use the easing constant from design-system |
| Trigger | First render of this card ID in the session |
| Skip condition | Card was previously rendered (re-entering viewport after scroll) |

### Behavior

1. When `CardContainer` mounts, check `isFirstRender` (from `useIsFirstRender(cardId)`).
2. If `isFirstRender` is `true`:
   - Set Motion `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`.
   - After the animation completes (via `onAnimationComplete` callback), call `markRendered(cardId)` to record that this card has been animated.
3. If `isFirstRender` is `false`:
   - Set `initial={false}` (Motion skips the initial animation) or omit `initial`.
   - The card renders immediately at full opacity with no animation.

### No Stagger

Cards enter independently as the virtualizer renders them. There is no stagger delay between cards. Each card plays its own enter animation immediately on mount.

### No Exit Animation

The virtualizer removes off-screen items instantly. There is no `AnimatePresence` wrapping grid items. Exit animation is explicitly excluded by the architecture spec.

### Reduced Motion

When `prefers-reduced-motion: reduce` is active, skip the animation entirely (set `initial={false}` regardless of `isFirstRender`). Use Motion's built-in `useReducedMotion()` hook.

## Demo Reference

**Vignette 1:** User submits a query. A new card appears in the grid with a subtle fade + slide-up (opacity 0 to 1, y offset 20px to 0, over 300ms). The animation is smooth and brief.

**Vignette 5:** User scrolls down past 30 cards, then scrolls back up. The cards that were previously visible re-appear instantly without replaying the enter animation. Only truly new cards (just added to the session) animate in.

## Integration Proofs

1. **First-render card animates in:**
   ```
   Test: Add a new card to the store. Render its CardContainer. Verify that
   the motion.div has initial opacity 0 and y 20 (check computed styles or
   Motion's animate prop).
   ```

2. **Previously rendered card does not animate:**
   ```
   Test: Add a card, call markRendered(cardId). Render its CardContainer.
   Verify initial is false or undefined (no animation plays).
   ```

3. **markRendered is called after animation completes:**
   ```
   Test: Add a new card. Render its CardContainer. Wait for animation
   to complete (or invoke onAnimationComplete). Verify markRendered was
   called with the card ID.
   ```

4. **Reduced motion skips animation:**
   ```
   Test: Mock useReducedMotion to return true. Render a first-render card.
   Verify no animation props are applied (initial is false).
   ```

5. **Multiple new cards animate independently:**
   ```
   Test: Add 3 cards simultaneously. Verify all 3 have enter animations
   (no stagger delay between them).
   ```

## Acceptance Criteria

- [ ] First-render cards animate with `opacity: 0 -> 1` and `y: 20 -> 0`
- [ ] Animation duration is 300ms with `outQuart` easing
- [ ] Previously rendered cards (in `renderedCardIds`) do not animate
- [ ] `markRendered(cardId)` is called after animation completes
- [ ] No stagger between cards -- each animates on its own mount
- [ ] No exit animation -- virtualizer removes items instantly
- [ ] `prefers-reduced-motion` is respected (animation skipped)
- [ ] All tests pass: `npx vitest run src/features/workspace/CardContainer.animation.test.tsx`

## Anti-Patterns

- **Do not** use `AnimatePresence` on the grid item list. Exit animations conflict with virtualization.
- **Do not** add stagger delays. Cards enter independently.
- **Do not** use Motion's `layout` prop for enter animations. Use `initial`/`animate` only.
- **Do not** re-animate cards when their content changes. Enter animation is a one-time event per card per session.
- **Do not** track `renderedCardIds` in React state (useState). It lives in the Zustand store.
