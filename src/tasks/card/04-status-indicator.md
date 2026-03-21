# Task 04: Status Indicator with Animations

## Dependencies

- **01-card-types**: `CardStatus`
- **design-system**: `Badge` component, CSS `@keyframes` (`pulse`, `spin`), Motion `variants` (`cardStatus`), easing constants, status color tokens

## Context

Each card shows a small status indicator beside the type badge (architecture/card.md > Card Header, Status Lifecycle). The indicator changes appearance and animation based on the card's current status. All four statuses have distinct visual treatments and animations as defined in the Status Animations table. Transitions between statuses use Motion `AnimatePresence` with 200ms cross-fade.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/StatusIndicator.tsx`** (~80 lines)
2. **`src/features/cards/StatusIndicator.css.ts`** (~50 lines)
3. **`src/features/cards/__tests__/StatusIndicator.test.tsx`** (~80 lines)

### Component Props

```typescript
interface StatusIndicatorProps {
  status: CardStatus;
  size?: 'sm' | 'md'; // sm=12px, md=16px, default md
}
```

### Status Visual Treatments

| Status | Element | Color | Animation |
|--------|---------|-------|-----------|
| `thinking` | Pulsing dot | `#B8660D` (amber) | CSS `@keyframes pulse` (opacity 0.4-1, 1.5s infinite) |
| `running` | Spinning circle | `#2B6CB0` (blue) | CSS `@keyframes spin` (rotate 360, 0.8s infinite) |
| `complete` | Static checkmark icon | `#1A7F5A` (green) | Motion spring scale-in (0 to 1) on enter |
| `error` | Error icon (!) | `#C53030` (red) | Motion shake (2-3px horizontal, 300ms) on enter |

### Implementation Details

- Use `AnimatePresence` with `mode="wait"` to cross-fade between status changes
- Duration: 200ms, easing: `cubic-bezier(0.16, 1, 0.3, 1)` (the `out` token)
- Checkmark scale-in uses Motion `spring` transition (stiffness ~300, damping ~20)
- Error shake uses Motion `animate` with `x: [0, -3, 3, -2, 2, 0]` keyframes over 300ms
- CSS animations (pulse, spin) run on compositor thread -- import from design-system keyframes
- `prefers-reduced-motion`: replace all animations with instant transitions, use static icons

### Accessibility

- `aria-label` on the indicator: e.g., "Status: thinking", "Status: complete"
- Status changes announced via `aria-live="polite"` (the parent card handles the live region, but this component provides the label text)

## Demo Reference

**Vignette 1**: Card status transitions from `thinking` to `running`. The amber pulsing dot cross-fades to a blue spinning circle over 200ms.

**Vignette 2**: Card completes execution. The spinning circle cross-fades out; a green checkmark springs in with a bouncy scale animation.

## Integration Proofs

1. **Render test (all statuses)**: Render `StatusIndicator` with each of the 4 statuses. Assert correct element and color for each.
2. **Transition test**: Render with `status='thinking'`, then re-render with `status='running'`. Assert `AnimatePresence` wraps the transition (Motion test utilities or snapshot).
3. **Reduced motion test**: Mock `prefers-reduced-motion: reduce`. Render with `status='thinking'`. Assert no pulse animation class applied.
4. **Accessibility test**: Render with `status='complete'`. Assert `aria-label` contains "complete".

## Acceptance Criteria

- [ ] Thinking status renders amber pulsing dot
- [ ] Running status renders blue spinning indicator
- [ ] Complete status renders green checkmark with spring scale-in
- [ ] Error status renders red icon with shake animation
- [ ] `AnimatePresence` cross-fades between status changes (200ms, out easing)
- [ ] Colors sourced from design tokens (`vars.color.status.*`)
- [ ] `prefers-reduced-motion` disables all animations
- [ ] `aria-label` present with status name
- [ ] All tests pass via `npx vitest run src/features/cards/__tests__/StatusIndicator.test.tsx`

## Anti-Patterns

- Do not use JavaScript `setInterval` for pulse/spin -- use CSS `@keyframes`
- Do not hardcode color values -- use `vars.color.status.*` tokens
- Do not manage status state here -- receive via props only
- Do not use Motion `layout` prop -- this is not a layout transition
- Do not skip `AnimatePresence` -- it is required for cross-fade between states
