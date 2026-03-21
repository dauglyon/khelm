# Task 13: Button Component

## Dependencies
- **02** Sprinkles utility API (for spacing and layout)
- **03** Typography scale (for button text styling)
- **10** Icon component (for leading icon slot)
- **11** Spinner component (for loading state)

## Context
Button is the primary interactive primitive. It supports three visual variants (solid, outline, ghost), three sizes, three color schemes, a leading icon slot, and a loading state that swaps the icon for a Spinner. All styling uses theme tokens.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Button/Button.tsx`** — Component implementation
2. **`src/common/components/Button/Button.css.ts`** — Styles
3. **`src/common/components/Button/Button.test.tsx`** — Tests
4. **`src/common/components/Button/index.ts`** — Barrel export

### `Button.tsx`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `color` | `'primary' \| 'danger' \| 'neutral'` | `'primary'` |
| `icon` | `ReactNode` | optional, leading icon slot |
| `loading` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `children` | `ReactNode` | button label |
| `className` | `string` | optional |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |

- When `loading` is true: replace `icon` with `<Spinner>` (sized to match button size), disable click, add `aria-busy="true"`
- When `disabled` is true: reduced opacity, `pointer-events: none`
- Render as `<button>` element
- Forward ref
- Spread remaining button HTML props
- Focus-visible ring: 2px offset, `color.text` color (per accessibility spec)

### `Button.css.ts`
- Import `vars` from `src/theme`
- Base styles: inline-flex, center-aligned, border-radius 6px, cursor pointer, transition on background/border/shadow
- **Size variants**: sm (height 28px, padding 0 10px, font bodySm), md (height 36px, padding 0 14px, font body), lg (height 44px, padding 0 18px, font body weight 500)
- **Color + variant matrix**: 3 colors x 3 variants = 9 style combinations
  - solid/primary: filled bg, white text
  - outline/primary: border with primary color, primary text, transparent bg
  - ghost/primary: no border, primary text, transparent bg, hover bg tint
  - (similar for danger, neutral)
- Disabled state: opacity 0.5
- Focus-visible: 2px outline, 2px offset, `vars.color.text`

### `Button.test.tsx`
- Renders with default props (solid, md, primary)
- Renders each variant (solid, outline, ghost)
- Renders each size (sm, md, lg)
- Renders with a leading icon
- Loading state shows Spinner and hides icon
- Loading state sets `aria-busy="true"`
- Disabled state prevents clicks
- Calls onClick handler when clicked
- Forwards ref
- Focus-visible outline is present (via class assertion)

### `index.ts`
- Re-export `Button` and `ButtonProps`

## Demo Reference
Buttons appear throughout the demo: submit button in input surface, action buttons in cards, toolbar actions.

## Integration Proofs
```bash
# Button tests pass
npx vitest run --reporter=verbose src/common/components/Button/

# Type-check
npx tsc --noEmit src/common/components/Button/Button.tsx
```

## Acceptance Criteria
- [ ] Three variants: solid, outline, ghost
- [ ] Three sizes: sm (28px), md (36px), lg (44px)
- [ ] Three colors: primary, danger, neutral
- [ ] Leading icon slot renders ReactNode before label
- [ ] Loading state replaces icon with Spinner and sets `aria-busy`
- [ ] Disabled state reduces opacity and prevents interaction
- [ ] Focus-visible ring present (2px, offset, text color)
- [ ] Renders as `<button>` with default `type="button"`
- [ ] Forwards ref
- [ ] Tests pass: `npx vitest run src/common/components/Button/`

## Anti-Patterns
- Do not use `<a>` or `<div>` for buttons; always `<button>`
- Do not hardcode colors; all from theme tokens
- Do not use Motion for button hover/active transitions; CSS transitions suffice
- Do not add icon-only mode; that is IconButton (task 14)
