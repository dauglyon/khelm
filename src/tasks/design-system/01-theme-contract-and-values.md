# Task 01: Theme Contract and Values

## Dependencies
- None (foundational task)

## Context
The theme contract defines the shape of all design tokens without assigning values. The theme then binds concrete values (hex colors, font stacks, easing curves) to that contract. All downstream code references `vars` (the contract), never raw values. Token values are defined authoritatively in `architecture/README.md#design-tokens`.

## Implementation Requirements

### Files to Create
1. **`src/theme/contract.css.ts`** — Token shape via `createThemeContract`
2. **`src/theme/theme.css.ts`** — Token values via `createTheme`
3. **`src/theme/contract.test.ts`** — Tests validating contract structure and theme binding

### `contract.css.ts`
- Use `createThemeContract()` from `@vanilla-extract/css`
- Define nested token structure matching the contract table in the spec:
  - `color.bg`, `color.surface`, `color.border`, `color.text`, `color.textMid`, `color.textLight`
  - `color.status.thinking`, `color.status.queued`, `color.status.running`, `color.status.complete`, `color.status.error`
  - `color.inputType.[type].fg`, `color.inputType.[type].bg`, `color.inputType.[type].border` for each of: `sql`, `python`, `literature`, `hypothesis`, `note`, `dataIngest`, `task`
  - `font.mono`, `font.sans`, `font.serif`
  - `easing.out`, `easing.inOut`, `easing.outQuart`
- Export the contract as `vars`

### `theme.css.ts`
- Use `createTheme()` from `@vanilla-extract/css` bound to the contract
- Populate every token with the exact values from architecture/README.md Design Tokens section
- Export the generated class name as `themeClass`

### `contract.test.ts`
- Verify `vars` object has all expected top-level keys (`color`, `font`, `easing`)
- Verify `vars.color.inputType` has all seven type keys
- Verify each inputType has `fg`, `bg`, `border` sub-keys
- Verify `vars.color.status` has all five status keys
- Verify `themeClass` is a non-empty string

## Demo Reference
Not applicable (infrastructure, no visual component).

## Integration Proofs
```bash
# Contract and theme compile without errors
npx vitest run --reporter=verbose src/theme/contract.test.ts

# TypeScript compiles the theme files
npx tsc --noEmit src/theme/contract.css.ts src/theme/theme.css.ts
```

## Acceptance Criteria
- [ ] `vars` exports a fully typed contract object matching all token paths from the spec
- [ ] `themeClass` binds every contract variable to a concrete value
- [ ] All color hex values match architecture/README.md exactly
- [ ] Font stacks include the specified fallbacks (e.g., `'JetBrains Mono', Menlo, monospace`)
- [ ] Easing values match the cubic-bezier strings in the spec
- [ ] `InputType` enum or union type is defined and exported for the seven input types
- [ ] Tests pass: `npx vitest run src/theme/contract.test.ts`
- [ ] No raw hex, px, or font values appear outside of `theme.css.ts`

## Anti-Patterns
- Do not put token values directly in the contract file; the contract is shape-only
- Do not create multiple themes in this task (single theme only for now)
- Do not export individual token values as standalone constants; all access goes through `vars`
- Do not import from `theme.css.ts` in component code; components import `vars` from the contract
