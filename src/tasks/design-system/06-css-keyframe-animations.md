# Task 06: CSS Keyframe Animations

## Dependencies
- **01** Theme contract and values (for token references in styles)
- **05** Easing constants (for `outQuart` in `fadeInUp`)

## Context
CSS `@keyframes` animations run on the compositor thread with zero JS cost. They are used for loading states (shimmer, pulse, spin) and entry animations (fadeInUp). All are defined via vanilla-extract's `keyframes()` API and exported as reusable style fragments.

## Implementation Requirements

### Files to Create
1. **`src/common/animations/keyframes.css.ts`** — CSS keyframe definitions and associated styles
2. **`src/common/animations/keyframes.test.ts`** — Tests validating exports

### `keyframes.css.ts`
- Import `keyframes`, `style` from `@vanilla-extract/css`
- Import `easingCSS` from `./easing`

Define four animations per the spec:

**`shimmer`**
- Animates `transform: translateX(-100%)` to `translateX(100%)`
- Duration: 1.5s, timing: linear, iteration: infinite
- Export both the keyframe name and a `shimmerStyle` class

**`pulse`**
- Animates `opacity` from 1 to 0.4 and back
- Duration: 1.5s, timing: ease-in-out, iteration: infinite
- Export both the keyframe name and a `pulseStyle` class

**`spin`**
- Animates `transform: rotate(0deg)` to `rotate(360deg)`
- Duration: 0.8s, timing: linear, iteration: infinite
- Export both the keyframe name and a `spinStyle` class

**`fadeInUp`**
- Animates `opacity: 0, transform: translateY(8px)` to `opacity: 1, transform: translateY(0)`
- Duration: 300ms, timing: `easingCSS.outQuart`, iteration: once (forwards)
- Export both the keyframe name and a `fadeInUpStyle` class

**Reduced motion:**
- Export a `reducedMotion` style that sets `animation-duration: 0.01ms !important` and `animation-iteration-count: 1 !important`
- This style should be applied via a `@media (prefers-reduced-motion: reduce)` condition on each animation style

### `keyframes.test.ts`
- Verify all four keyframe names are exported as non-empty strings
- Verify all four style classes are exported as non-empty strings
- Verify the `reducedMotion` style is exported

## Demo Reference
Not applicable (infrastructure, consumed by Spinner, Skeleton, Badge, toast).

## Integration Proofs
```bash
# Keyframe tests pass
npx vitest run --reporter=verbose src/common/animations/keyframes.test.ts

# Type-check
npx tsc --noEmit src/common/animations/keyframes.css.ts
```

## Acceptance Criteria
- [ ] Four keyframes defined: `shimmer`, `pulse`, `spin`, `fadeInUp`
- [ ] Each keyframe has a corresponding style class export
- [ ] `shimmer`: translateX, 1.5s linear infinite
- [ ] `pulse`: opacity, 1.5s ease-in-out infinite
- [ ] `spin`: rotate, 0.8s linear infinite
- [ ] `fadeInUp`: opacity + translateY, 300ms outQuart forwards
- [ ] Reduced motion media query applied to all animation styles
- [ ] Tests pass: `npx vitest run src/common/animations/keyframes.test.ts`

## Anti-Patterns
- Do not use JS-driven animations for these effects; they must be CSS-only
- Do not hardcode easing strings; import from `easing.ts`
- Do not define component-specific animation variations here; this is the base set only
- Do not use `globalKeyframes`; use scoped `keyframes()` from vanilla-extract
