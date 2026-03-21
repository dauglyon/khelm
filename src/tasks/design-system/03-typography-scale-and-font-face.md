# Task 03: Typography Scale and Font-Face

## Dependencies
- **01** Theme contract and values (needs `vars.font.*` tokens)

## Context
Typography defines `@font-face` declarations for the three font families (JetBrains Mono, DM Sans, Source Serif 4) and exports typographic recipe styles matching the typography scale table. These recipes combine font-family, size, weight, and line-height into reusable style objects.

## Implementation Requirements

### Files to Create
1. **`src/theme/typography.css.ts`** — Font-face declarations and typographic recipes
2. **`src/theme/typography.test.ts`** — Tests validating recipe exports

### `typography.css.ts`
- Use `fontFace()` and `style()` from `@vanilla-extract/css`
- Import `vars` from `./contract.css.ts`

**Font-face declarations:**
- `JetBrains Mono` (400 weight, swap display)
- `DM Sans` (400, 500, 600, 700 weights, swap display)
- `Source Serif 4` (400 weight, swap display)
- Use Google Fonts CDN URLs or local font file references (document which approach)
- Note: actual font loading strategy may use `<link>` tags in HTML; the `@font-face` here ensures vanilla-extract can reference the families

**Typographic recipes (exported as named style objects):**

| Export Name | Size | Weight | Line Height | Font Token |
|-------------|------|--------|-------------|------------|
| `displayLg` | 28px | 700 | 1.2 | `vars.font.sans` |
| `displaySm` | 22px | 600 | 1.3 | `vars.font.sans` |
| `heading` | 18px | 600 | 1.4 | `vars.font.sans` |
| `body` | 15px | 400 | 1.5 | `vars.font.sans` |
| `bodySm` | 13px | 400 | 1.5 | `vars.font.sans` |
| `caption` | 11px | 500 | 1.4 | `vars.font.sans` |
| `mono` | 14px | 400 | 1.6 | `vars.font.mono` |
| `monoSm` | 12px | 400 | 1.6 | `vars.font.mono` |

Each recipe is a `style()` call producing a class name string.

- Also export a `typography` record object mapping recipe names to their class names for programmatic access

### `typography.test.ts`
- Verify each named recipe export is a non-empty string
- Verify the `typography` record has all eight keys
- Verify all eight keys map to non-empty strings

## Demo Reference
Not applicable (infrastructure).

## Integration Proofs
```bash
# Typography compiles and tests pass
npx vitest run --reporter=verbose src/theme/typography.test.ts

# Type-check
npx tsc --noEmit src/theme/typography.css.ts
```

## Acceptance Criteria
- [ ] All eight typographic recipe styles are exported by name
- [ ] `typography` record object is exported with all eight entries
- [ ] Each recipe references `vars.font.*` tokens, not raw font-family strings
- [ ] Font sizes, weights, and line heights match the spec table exactly
- [ ] `@font-face` declarations specify `font-display: swap`
- [ ] Tests pass: `npx vitest run src/theme/typography.test.ts`

## Anti-Patterns
- Do not hardcode font-family strings in recipes; always reference `vars.font.*`
- Do not add responsive font sizes; the scale is fixed
- Do not define fonts that are not in the spec (no italics, no extra weights beyond what is listed)
- Do not use `globalFontFace`; keep font-face declarations scoped to the theme
