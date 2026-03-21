# Task 09: Stack Component

## Dependencies
- **02** Sprinkles utility API (for layout utility classes)

## Context
Stack is a flex layout utility component that provides a declarative API for common flex patterns (vertical/horizontal stacking with consistent spacing). It replaces manual flexbox CSS for simple layout composition.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Stack/Stack.tsx`** — Component implementation
2. **`src/common/components/Stack/Stack.test.tsx`** — Tests
3. **`src/common/components/Stack/index.ts`** — Barrel export

### `Stack.tsx`
- Import `sprinkles` from `src/theme`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `direction` | `'row' \| 'column'` | `'column'` |
| `gap` | `0 \| 4 \| 8 \| 12 \| 16 \| 20 \| 24 \| 32 \| 48 \| 64` | `8` |
| `align` | CSS align-items values | `'stretch'` |
| `justify` | CSS justify-content values | `'flex-start'` |
| `wrap` | `boolean` | `false` |
| `as` | `React.ElementType` | `'div'` |
| `children` | `ReactNode` | required |
| `className` | `string` | optional, merged with sprinkles output |

- Render a `<div>` (or `as` element) with sprinkles-generated flex classes
- Merge `className` prop with generated classes
- Forward `ref` via `React.forwardRef`
- Spread remaining HTML props onto the element

### `Stack.test.tsx`
- Renders children in a flex container
- Default direction is column
- `direction="row"` renders with row flex-direction
- `gap` prop applies spacing
- `wrap` prop enables flex-wrap
- Accepts and applies a custom `className`
- Renders with a custom `as` element type
- Forwards ref to the underlying DOM element

### `index.ts`
- Re-export `Stack` and its props type `StackProps`

## Demo Reference
Stack is used across all vignettes as the primary layout primitive; no dedicated vignette.

## Integration Proofs
```bash
# Stack tests pass
npx vitest run --reporter=verbose src/common/components/Stack/

# Type-check
npx tsc --noEmit src/common/components/Stack/Stack.tsx
```

## Acceptance Criteria
- [ ] `Stack` renders a flex container with configurable direction, gap, alignment, and wrapping
- [ ] Default direction is `'column'`, default gap is `8`
- [ ] Props match the spec table exactly
- [ ] Supports polymorphic `as` prop
- [ ] Forwards ref
- [ ] Merges custom `className` with sprinkles output
- [ ] Tests pass: `npx vitest run src/common/components/Stack/`

## Anti-Patterns
- Do not add padding/margin props to Stack; use sprinkles directly for outer spacing
- Do not use inline styles; all styling through sprinkles
- Do not nest Stack-specific CSS in a separate `.css.ts` file; sprinkles covers all needs
- Do not add responsive breakpoint behavior
