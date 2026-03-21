# Task 05: Easing Constants

## Dependencies
- **01** Theme contract and values (easing token values for reference)

## Context
Easing constants are used by both CSS animations (string format) and Motion (array format). This module exports named constants in both formats so animation code never contains raw cubic-bezier strings.

## Implementation Requirements

### Files to Create
1. **`src/common/animations/easing.ts`** — Named easing constants
2. **`src/common/animations/easing.test.ts`** — Tests validating exports

### `easing.ts`
Export easing values in two formats:

**CSS string format** (for vanilla-extract `style()` and CSS `animation-timing-function`):
```typescript
export const easingCSS = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  outQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
} as const;
```

**Motion array format** (for Motion's `transition.ease` prop):
```typescript
export const easingMotion = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
} as const;
```

Both objects must use the same names (`out`, `inOut`, `outQuart`) and their numerical values must correspond exactly.

### `easing.test.ts`
- Verify `easingCSS` has all three keys
- Verify `easingMotion` has all three keys
- Verify each CSS string contains `cubic-bezier`
- Verify each Motion array has exactly 4 numeric elements
- Verify the numeric values in Motion arrays match the numbers in the CSS strings

## Demo Reference
Not applicable (infrastructure).

## Integration Proofs
```bash
# Easing tests pass
npx vitest run --reporter=verbose src/common/animations/easing.test.ts

# Type-check
npx tsc --noEmit src/common/animations/easing.ts
```

## Acceptance Criteria
- [ ] `easingCSS` exported with `out`, `inOut`, `outQuart` keys
- [ ] `easingMotion` exported with `out`, `inOut`, `outQuart` keys
- [ ] Values match the spec exactly: out = `(0.16, 1, 0.3, 1)`, inOut = `(0.4, 0, 0.2, 1)`, outQuart = `(0.25, 1, 0.5, 1)`
- [ ] Both objects are `as const` for type narrowing
- [ ] Tests pass: `npx vitest run src/common/animations/easing.test.ts`

## Anti-Patterns
- Do not import from the theme contract for easing values; these are standalone constants (the contract stores them as CSS custom properties, but Motion needs raw arrays)
- Do not define additional easing curves beyond the three specified
- Do not export a single object with both formats mixed; keep CSS and Motion formats separate
