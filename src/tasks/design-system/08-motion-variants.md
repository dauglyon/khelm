# Task 08: Motion Variants

## Dependencies
- **05** Easing constants (for transition easing values)
- **07** LazyMotion provider (variants are used inside LazyMotion context)

## Context
Motion variants are predefined animation configuration objects for the `variants` prop on Motion components. Each variant set maps state names to animation configs (opacity, scale, position, border-color) using easing tokens. These are consumed by card, panel, and list components across the app.

## Implementation Requirements

### Files to Create
1. **`src/common/animations/variants.ts`** — All variant objects
2. **`src/common/animations/variants.test.ts`** — Tests validating structure

### `variants.ts`
- Import `easingMotion` from `./easing`

Define and export the following variant sets, each as an object with `variants` and `transition` properties:

**`cardStatus`**
- States: `thinking`, `running`, `complete`, `error`
- Animates: `borderColor` (mapped to status colors), subtle `scale` pulse for thinking/running (1.0 to 1.005)
- Transition: `easingMotion.inOut`, duration 0.3s

**`cardEnterExit`**
- States: `initial`, `animate`, `exit`
- `initial`: opacity 0, y: 12
- `animate`: opacity 1, y: 0
- `exit`: opacity 0, scale: 0.96
- Transition: `easingMotion.out`, duration 0.25s

**`panelSlide`**
- States: `hidden`, `visible`
- `hidden`: x: '100%', opacity: 0
- `visible`: x: 0, opacity: 1
- Transition: `easingMotion.out`, duration 0.3s

**`fadeIn`**
- States: `initial`, `animate`
- `initial`: opacity 0
- `animate`: opacity 1
- Transition: `easingMotion.inOut`, duration 0.2s

**`staggerContainer`**
- States: `initial`, `animate`
- `animate`: has `transition.staggerChildren: 0.05`
- No visual properties on the container itself

**`staggerChild`**
- States: `initial`, `animate`
- `initial`: opacity 0, y: 8
- `animate`: opacity 1, y: 0
- Transition: `easingMotion.out`, duration 0.2s

**`dropzone`**
- States: `idle`, `active`, `accept`, `reject`
- `idle`: scale 1, borderStyle 'dashed'
- `active`: scale 1.01, borderColor highlight
- `accept`: borderColor green (status.complete token reference)
- `reject`: borderColor red (status.error token reference), brief shake (x oscillation)
- Transition: `easingMotion.out`, duration 0.15s

### `variants.test.ts`
- Verify each of the 7 variant sets is exported
- Verify each has a `variants` property that is a non-empty object
- Verify each has a `transition` property
- Verify `cardEnterExit.variants` has `initial`, `animate`, `exit` keys
- Verify `cardStatus.variants` has `thinking`, `running`, `complete`, `error` keys
- Verify `staggerContainer.variants.animate.transition.staggerChildren` is a number

## Demo Reference
Not applicable (consumed by card and workspace domains).

## Integration Proofs
```bash
# Variant tests pass
npx vitest run --reporter=verbose src/common/animations/variants.test.ts

# Type-check
npx tsc --noEmit src/common/animations/variants.ts
```

## Acceptance Criteria
- [ ] Seven variant sets exported: `cardStatus`, `cardEnterExit`, `panelSlide`, `fadeIn`, `staggerContainer`, `staggerChild`, `dropzone`
- [ ] Each variant set has `variants` and `transition` properties
- [ ] Easing values come from `easingMotion`, not hardcoded arrays
- [ ] State names match the spec exactly
- [ ] `staggerContainer` includes `staggerChildren` timing
- [ ] Tests pass: `npx vitest run src/common/animations/variants.test.ts`

## Anti-Patterns
- Do not hardcode easing arrays; import from `easing.ts`
- Do not import color values directly; use string references that will be resolved at render time via theme tokens
- Do not couple variants to specific components; these are generic and reusable
- Do not add reduced-motion handling here; that is handled at the LazyMotion/component level
