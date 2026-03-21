# Task 11: Spinner Component

## Dependencies
- **02** Sprinkles utility API (for color tokens)
- **06** CSS keyframe animations (for `spinStyle`)

## Context
Spinner is a small loading indicator using the CSS `spin` keyframe animation. It is used standalone and as a loading replacement inside buttons. Zero JS animation overhead.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Spinner/Spinner.tsx`** — Component implementation
2. **`src/common/components/Spinner/Spinner.css.ts`** — Styles
3. **`src/common/components/Spinner/Spinner.test.tsx`** — Tests
4. **`src/common/components/Spinner/index.ts`** — Barrel export

### `Spinner.tsx`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `size` | `16 \| 20 \| 24` | `20` |
| `color` | token path string | `color.textMid` |
| `className` | `string` | optional |

- Render a circular SVG (ring with a gap) that rotates via the `spin` keyframe
- Apply `role="status"` and `aria-label="Loading"` for accessibility
- Use `vars.color.textMid` as default color reference

### `Spinner.css.ts`
- Import `spinStyle` from `src/common/animations/keyframes.css.ts`
- Base style applies the spin animation
- Size variants for 16, 20, 24
- Respects reduced motion (inherits from keyframes reduced motion media query)

### `Spinner.test.tsx`
- Renders with default size (20px)
- Renders at each size variant (16, 20, 24)
- Has `role="status"` for accessibility
- Has `aria-label="Loading"`
- Applies custom className

### `index.ts`
- Re-export `Spinner` and `SpinnerProps`

## Demo Reference
Spinner appears inside buttons when `loading` prop is set, and in card status indicators.

## Integration Proofs
```bash
# Spinner tests pass
npx vitest run --reporter=verbose src/common/components/Spinner/

# Type-check
npx tsc --noEmit src/common/components/Spinner/Spinner.tsx
```

## Acceptance Criteria
- [ ] Spinner renders a rotating circular indicator
- [ ] Size prop controls dimensions (16, 20, 24)
- [ ] Default color is `textMid` token
- [ ] Uses CSS `spin` keyframe, not JS animation
- [ ] `role="status"` and `aria-label="Loading"` present
- [ ] Reduced motion respected (via keyframes media query)
- [ ] Tests pass: `npx vitest run src/common/components/Spinner/`

## Anti-Patterns
- Do not use JS `requestAnimationFrame` or Motion for the spin animation
- Do not hardcode colors; reference tokens
- Do not make Spinner interactive; it is purely visual feedback
