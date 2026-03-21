# Task 02: Sprinkles Utility API

## Dependencies
- **01** Theme contract and values (needs `vars` for token references)

## Context
Sprinkles provides a type-safe utility-class API built from our design tokens. It maps CSS properties to constrained scales (spacing, color, typography, layout, sizing, border) so components can compose styles inline without writing custom CSS for common patterns.

## Implementation Requirements

### Files to Create
1. **`src/theme/sprinkles.css.ts`** — `defineProperties` + `createSprinkles`
2. **`src/theme/sprinkles.test.ts`** — Tests validating sprinkles function

### `sprinkles.css.ts`
- Import `vars` from `./contract.css.ts`
- Use `defineProperties()` and `createSprinkles()` from `@vanilla-extract/sprinkles`
- Define property groups per the spec:

**Color properties:**
- `color`, `backgroundColor`, `borderColor` mapped to `color.*` tokens from the contract

**Spacing properties:**
- `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`
- `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`
- `gap`
- Scale: `0, 4, 8, 12, 16, 20, 24, 32, 48, 64` (px values)

**Typography properties:**
- `fontFamily` mapped to `font.*` tokens
- `fontSize` scale matching typography table: `11, 12, 13, 14, 15, 18, 22, 28` (px)
- `fontWeight`: `400, 500, 600, 700`
- `lineHeight`: `1.2, 1.3, 1.4, 1.5, 1.6`

**Layout properties:**
- `display`: `'none', 'flex', 'grid', 'block', 'inline', 'inline-flex'`
- `flexDirection`: `'row', 'column', 'row-reverse', 'column-reverse'`
- `alignItems`: `'stretch', 'center', 'flex-start', 'flex-end', 'baseline'`
- `justifyContent`: `'flex-start', 'center', 'flex-end', 'space-between', 'space-around'`
- `flexWrap`: `'wrap', 'nowrap'`

**Sizing properties:**
- `width`, `height`: fractions (`'25%', '50%', '75%', '100%'`) + `'auto'`
- `maxWidth`: fractions + fixed breakpoints
- `minHeight`: `0, '100%', '100vh'`

**Border properties:**
- `borderRadius`: `0, 2, 4, 8, 12, 9999` (px)
- `borderWidth`: `0, 1, 2` (px)
- `borderStyle`: `'none', 'solid', 'dashed'`

- Export the sprinkles function as `sprinkles`
- Export the `Sprinkles` type via `Parameters<typeof sprinkles>[0]`

### `sprinkles.test.ts`
- Verify `sprinkles` is callable and returns a string (class name)
- Verify passing valid color token keys produces a class string
- Verify spacing values from the scale are accepted
- Verify TypeScript catches invalid property values (compile-time, documented in test comments)

## Demo Reference
Not applicable (infrastructure API).

## Integration Proofs
```bash
# Sprinkles compile and tests pass
npx vitest run --reporter=verbose src/theme/sprinkles.test.ts

# Type-check
npx tsc --noEmit src/theme/sprinkles.css.ts
```

## Acceptance Criteria
- [ ] `sprinkles()` function is exported and callable
- [ ] All six property groups (color, spacing, typography, layout, sizing, border) are defined
- [ ] Spacing scale matches spec: `0, 4, 8, 12, 16, 20, 24, 32, 48, 64`
- [ ] Color properties reference contract tokens, not raw hex values
- [ ] `Sprinkles` type is exported for use in component prop types
- [ ] Tests pass: `npx vitest run src/theme/sprinkles.test.ts`

## Anti-Patterns
- Do not use raw hex or px values in sprinkles definitions; reference `vars` for colors
- Do not define responsive conditions yet (single breakpoint for now)
- Do not add `position`, `overflow`, or `z-index` to sprinkles; those go in component-specific styles
- Do not re-export sprinkles from `index.ts` in this task (that is task 04)
