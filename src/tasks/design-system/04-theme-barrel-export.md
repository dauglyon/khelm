# Task 04: Theme Barrel Export

## Dependencies
- **01** Theme contract and values
- **02** Sprinkles utility API
- **03** Typography scale and font-face

## Context
The theme barrel (`src/theme/index.ts`) is the single public entry point for all theme exports. Other domains import from `src/theme` — never from internal files. This task creates that barrel and validates the public API surface.

## Implementation Requirements

### Files to Create
1. **`src/theme/index.ts`** — Re-exports from contract, theme, sprinkles, typography
2. **`src/theme/index.test.ts`** — Tests validating public API surface

### `index.ts`
Re-export the following:
- `vars` from `./contract.css.ts` (the theme contract)
- `themeClass` from `./theme.css.ts` (the theme class name)
- `sprinkles` and `Sprinkles` type from `./sprinkles.css.ts`
- All typography recipes and the `typography` record from `./typography.css.ts`
- `InputType` type/enum from `./contract.css.ts`

The barrel must not add any new logic; it is purely re-exports.

### `index.test.ts`
- Import everything from `src/theme`
- Verify `vars` is an object with `color`, `font`, `easing` keys
- Verify `themeClass` is a non-empty string
- Verify `sprinkles` is a function
- Verify `typography` record has all eight recipe keys
- Verify each named typography export (`displayLg`, `body`, etc.) is a string

## Demo Reference
Not applicable (infrastructure).

## Integration Proofs
```bash
# Barrel exports compile and tests pass
npx vitest run --reporter=verbose src/theme/index.test.ts

# Verify no circular imports
npx tsc --noEmit src/theme/index.ts

# All theme tests pass together
npx vitest run --reporter=verbose src/theme/
```

## Acceptance Criteria
- [ ] `src/theme/index.ts` re-exports `vars`, `themeClass`, `sprinkles`, `Sprinkles`, `typography`, all recipe names, and `InputType`
- [ ] Importing from `src/theme` provides the complete public API
- [ ] No logic or transformations in the barrel file
- [ ] Tests pass: `npx vitest run src/theme/index.test.ts`
- [ ] All theme tests pass as a suite: `npx vitest run src/theme/`

## Anti-Patterns
- Do not add computed values or helper functions to the barrel
- Do not re-export internal implementation details (e.g., `defineProperties` calls)
- Do not use `export *` without explicit verification that it does not leak internals
