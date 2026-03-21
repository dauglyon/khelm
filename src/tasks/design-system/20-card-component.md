# Task 20: Card Component

## Dependencies
- **02** Sprinkles utility API (for spacing, layout, border)
- **08** Motion variants (for `cardEnterExit` and `cardStatus` animations)

## Context
Card is the presentational container for all card types. It provides the visual shell (surface background, border, accent bar, selection state) but contains no business logic -- that belongs in the `card` domain. The top accent bar is colored by the input type. The component is a Motion-enabled wrapper to support enter/exit and status animations.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Card/Card.tsx`** — Component implementation
2. **`src/common/components/Card/Card.css.ts`** — Styles
3. **`src/common/components/Card/Card.test.tsx`** — Tests
4. **`src/common/components/Card/index.ts`** — Barrel export

### `Card.tsx`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `inputType` | `InputType` enum | required |
| `selected` | `boolean` | `false` |
| `children` | `ReactNode` | required |
| `className` | `string` | optional |

- Import `InputType` from `src/theme`
- Import `cardEnterExit` from `src/common/animations/variants`
- Render using Motion's `m.div` (not `motion.div`, since we use LazyMotion)
- Apply `cardEnterExit` variants for mount/unmount animations
- `surface` background, `border` border, `8px` border-radius, `16px` padding
- Top 3px accent bar colored by `vars.color.inputType[inputType].border`
- Selected state: elevated box-shadow, slightly highlighted border
- Use `layoutId` prop support (pass through for card-to-detail transitions used by card domain)

### `Card.css.ts`
- Import `vars` from `src/theme`
- Base: `vars.color.surface` background, `1px solid vars.color.border`, border-radius 8px, padding 16px, `position: relative`
- Accent bar: `::before` pseudo-element, 3px height, full width, top 0, border-radius top corners
- Accent color variants per input type (using `vars.color.inputType[type].border`)
- Selected state: `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`, border-color slightly darker or highlighted
- Transition on box-shadow and border-color

### `Card.test.tsx`
- Renders children content
- Applies accent bar color for a given input type
- Selected state applies elevated shadow class
- Non-selected state has no elevated shadow
- Merges custom className
- Has correct base styles (surface bg, border, border-radius, padding)
- Accessible: no implicit role (it is a generic container)

### `index.ts`
- Re-export `Card` and `CardProps`

## Demo Reference
Cards are the primary workspace element, visible in every workspace vignette.

## Integration Proofs
```bash
# Card tests pass
npx vitest run --reporter=verbose src/common/components/Card/

# Type-check
npx tsc --noEmit src/common/components/Card/Card.tsx
```

## Acceptance Criteria
- [ ] Surface background, border, 8px border-radius, 16px padding
- [ ] Top 3px accent bar colored by input type
- [ ] All six input types produce correct accent colors
- [ ] Selected state: elevated box-shadow + border highlight
- [ ] Uses `m.div` from Motion (LazyMotion compatible)
- [ ] `cardEnterExit` variants applied for enter/exit animation
- [ ] Children render inside the card
- [ ] Tests pass: `npx vitest run src/common/components/Card/`

## Anti-Patterns
- Do not add business logic (status, streaming, actions) to Card; it is purely presentational
- Do not hardcode accent colors; derive from tokens
- Do not use `motion.div`; use `m.div` for LazyMotion tree-shaking
- Do not add header/footer sections; the card domain composes those from children
- Do not add click handlers; selection logic belongs in the card domain
