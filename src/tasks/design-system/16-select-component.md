# Task 16: Select Component

## Dependencies
- **15** TextInput component (shares same size scale and styling patterns)
- **10** Icon component (for chevron-down suffix icon)

## Context
Select is a styled native `<select>` element with the same visual treatment as TextInput. It uses a chevron-down icon as a fixed suffix. Keeping the native `<select>` ensures accessibility and mobile-friendly behavior.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Select/Select.tsx`** — Component implementation
2. **`src/common/components/Select/Select.css.ts`** — Styles
3. **`src/common/components/Select/Select.test.tsx`** — Tests
4. **`src/common/components/Select/index.ts`** — Barrel export

### `Select.tsx`
- Props:

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md'` | `'md'` |
| `error` | `boolean \| string` | `false` |
| `children` | `ReactNode` (option elements) | required |
| `className` | `string` | optional |
| `placeholder` | `string` | optional |

- Plus all standard `<select>` HTML attributes (value, onChange, etc.)
- Render wrapper div with `<select>` inside and `<Icon name="chevron-down">` as suffix
- Same size heights as TextInput (sm: 32px, md: 40px)
- Same error styling as TextInput
- Hide native select arrow via CSS (`appearance: none`)
- Forward ref to the `<select>` element
- Focus-visible ring on wrapper

### `Select.css.ts`
- Mirrors TextInput styling: wrapper, sizes, error state, focus ring
- Select element: reset `appearance`, transparent bg, flex-grow, inherit font
- Chevron icon positioned on right side, pointer-events-none

### `Select.test.tsx`
- Renders with option children
- Renders at each size (sm, md)
- Shows chevron-down icon
- Error state shows border and message
- Passes value and onChange
- Forwards ref to select element
- Native select arrow is hidden

### `index.ts`
- Re-export `Select` and `SelectProps`

## Demo Reference
Select appears in settings and filter panels.

## Integration Proofs
```bash
# Select tests pass
npx vitest run --reporter=verbose src/common/components/Select/

# Type-check
npx tsc --noEmit src/common/components/Select/Select.tsx
```

## Acceptance Criteria
- [ ] Uses native `<select>` element for full accessibility
- [ ] Two sizes: sm (32px) and md (40px), matching TextInput
- [ ] Chevron-down icon rendered as suffix
- [ ] Native select arrow hidden via `appearance: none`
- [ ] Error state matches TextInput behavior
- [ ] Focus-visible ring on wrapper
- [ ] Forwards ref to `<select>`
- [ ] Tests pass: `npx vitest run src/common/components/Select/`

## Anti-Patterns
- Do not build a custom dropdown; use native `<select>` for accessibility
- Do not duplicate TextInput styling; share CSS patterns or utilities
- Do not make the chevron interactive; it is decorative
