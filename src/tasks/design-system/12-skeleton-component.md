# Task 12: Skeleton Component

## Dependencies
- **02** Sprinkles utility API (for spacing and sizing)
- **06** CSS keyframe animations (for `shimmerStyle`)

## Context
Skeleton provides placeholder shapes with a shimmer animation for loading states. It uses the CSS `shimmer` keyframe for zero-JS-cost animation. Supports text lines, rectangles, and circles.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Skeleton/Skeleton.tsx`** — Component implementation
2. **`src/common/components/Skeleton/Skeleton.css.ts`** — Styles
3. **`src/common/components/Skeleton/Skeleton.test.tsx`** — Tests
4. **`src/common/components/Skeleton/index.ts`** — Barrel export

### `Skeleton.tsx`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'text' \| 'rect' \| 'circle'` | `'text'` |
| `width` | `string \| number` | `'100%'` |
| `height` | `string \| number` | Derived from variant |
| `lines` | `number` | `1` (text variant only) |
| `className` | `string` | optional |

- **text variant**: renders `lines` number of horizontal bars. Default height matches body line-height (~20px). Last line is 80% width for natural appearance.
- **rect variant**: renders a rectangle with given width/height. Default height 100px.
- **circle variant**: renders a circle. `width` sets diameter (default 40px). `height` ignored.
- Apply shimmer animation overlay (gradient translateX)
- `aria-hidden="true"` — decorative loading placeholder

### `Skeleton.css.ts`
- Import `shimmerStyle` from `src/common/animations/keyframes.css.ts`
- Base skeleton style: `background-color` from `vars.color.border` (light gray), `border-radius: 4px`, `overflow: hidden`
- Shimmer overlay via `::after` pseudo-element with gradient and animation
- Circle variant: `border-radius: 50%`
- Reduced motion: shimmer animation disabled (inherits from keyframes)

### `Skeleton.test.tsx`
- Renders a text skeleton with default props
- Renders multiple lines when `lines > 1`
- Last line of multi-line text is shorter (80% width)
- Renders rect variant with custom width/height
- Renders circle variant with specified diameter
- Has `aria-hidden="true"`
- Applies custom className

### `index.ts`
- Re-export `Skeleton` and `SkeletonProps`

## Demo Reference
Skeletons appear in card loading states before content arrives from streaming.

## Integration Proofs
```bash
# Skeleton tests pass
npx vitest run --reporter=verbose src/common/components/Skeleton/

# Type-check
npx tsc --noEmit src/common/components/Skeleton/Skeleton.tsx
```

## Acceptance Criteria
- [ ] Three variants supported: text, rect, circle
- [ ] Text variant renders configurable number of lines
- [ ] Last line of multi-line text is 80% width
- [ ] Circle variant enforces equal width/height and 50% border-radius
- [ ] Shimmer animation uses CSS keyframe, not JS
- [ ] `aria-hidden="true"` present
- [ ] Reduced motion respected
- [ ] Tests pass: `npx vitest run src/common/components/Skeleton/`

## Anti-Patterns
- Do not use JS animation for shimmer; CSS `@keyframes` only
- Do not use `motion` components for Skeleton; pure CSS
- Do not add `role="progressbar"`; skeleton is decorative, real status is communicated elsewhere
