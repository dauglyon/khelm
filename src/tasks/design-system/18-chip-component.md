# Task 18: Chip Component

## Dependencies
- **02** Sprinkles utility API (for spacing)
- **03** Typography scale (for label text)
- **10** Icon component (for close icon on removable chips)

## Context
Chip is used for input-type badges and mention pills. It derives its color scheme from the input-type token set (`color.inputType.*`), making it visually consistent with the classification system. It optionally has a remove button.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Chip/Chip.tsx`** — Component implementation
2. **`src/common/components/Chip/Chip.css.ts`** — Styles
3. **`src/common/components/Chip/Chip.test.tsx`** — Tests
4. **`src/common/components/Chip/index.ts`** — Barrel export

### `Chip.tsx`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `inputType` | `InputType` enum | required |
| `label` | `string` | required |
| `onRemove` | `() => void` | optional |
| `size` | `'sm' \| 'md'` | `'md'` |
| `className` | `string` | optional |

- Import `InputType` from `src/theme`
- Render a `<span>` with the label text
- Colors derived from `vars.color.inputType[inputType]`: fg for text, bg for background, border for border
- When `onRemove` is provided: render a small close button (Icon `close`, size 16) with `aria-label="Remove {label}"`
- Size: sm (height 20px, font caption), md (height 26px, font bodySm)
- Border-radius: 9999px (pill shape)

### `Chip.css.ts`
- Import `vars` from `src/theme`
- Base: inline-flex, center-aligned, pill border-radius, 1px solid border
- Dynamic color application: use `style` with `vars.color.inputType` references
- Note: since inputType is dynamic, create a style variant per input type OR use `assignVars` / CSS custom properties
- Size variants: sm (height 20, padding 0 6px, caption), md (height 26, padding 0 10px, bodySm)
- Close button: 16px, no border/bg, cursor pointer, inherits fg color, margin-left 4px

### `Chip.test.tsx`
- Renders with label text
- Applies correct colors for a given input type (e.g., 'sql')
- Renders at sm and md sizes
- Shows close button when `onRemove` is provided
- Calls `onRemove` when close button is clicked
- Close button has accessible label
- No close button when `onRemove` is not provided

### `index.ts`
- Re-export `Chip` and `ChipProps`

## Demo Reference
Chips appear as input-type indicators in the input surface and as mention pills in TipTap.

## Integration Proofs
```bash
# Chip tests pass
npx vitest run --reporter=verbose src/common/components/Chip/

# Type-check
npx tsc --noEmit src/common/components/Chip/Chip.tsx
```

## Acceptance Criteria
- [ ] Colors derived from `inputType` token set (fg, bg, border)
- [ ] All six input types produce visually distinct chips
- [ ] Two sizes: sm (20px) and md (26px)
- [ ] Pill shape (border-radius 9999px)
- [ ] Optional remove button with accessible label
- [ ] `onRemove` callback fires on close button click
- [ ] Tests pass: `npx vitest run src/common/components/Chip/`

## Anti-Patterns
- Do not hardcode input-type colors; always derive from tokens
- Do not use the full Button component for the remove button; use a minimal button element
- Do not make the entire chip clickable; only the close button is interactive (unless extended later)
