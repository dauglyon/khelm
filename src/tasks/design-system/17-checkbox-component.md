# Task 17: Checkbox Component

## Dependencies
- **02** Sprinkles utility API (for spacing and layout)
- **03** Typography scale (for label text)

## Context
Checkbox is a styled checkbox with support for a text label and an indeterminate state. It uses a custom visual treatment while maintaining native checkbox accessibility via a hidden `<input type="checkbox">`.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Checkbox/Checkbox.tsx`** — Component implementation
2. **`src/common/components/Checkbox/Checkbox.css.ts`** — Styles
3. **`src/common/components/Checkbox/Checkbox.test.tsx`** — Tests
4. **`src/common/components/Checkbox/index.ts`** — Barrel export

### `Checkbox.tsx`
- Props:

| Prop | Type | Default |
|------|------|---------|
| `checked` | `boolean` | `false` |
| `indeterminate` | `boolean` | `false` |
| `label` | `string` | optional |
| `disabled` | `boolean` | `false` |
| `onChange` | `(checked: boolean) => void` | optional |
| `className` | `string` | optional |
| `id` | `string` | auto-generated if not provided |

- Render a `<label>` containing a hidden `<input type="checkbox">` and a visual checkbox indicator
- Visual indicator: 18x18 box with `vars.color.border` border, rounded 4px
- Checked state: filled background, white check icon (from Icon component or inline SVG)
- Indeterminate state: filled background, white minus icon
- Set `indeterminate` property on the DOM input via ref (it is not an HTML attribute)
- Forward ref to the `<input>` element
- Focus-visible ring on the visual indicator when input is focused

### `Checkbox.css.ts`
- Hidden input: `position: absolute`, `opacity: 0`, `width/height: 0`
- Visual indicator: 18x18, border, border-radius 4px, transition on background/border
- Checked/indeterminate: `vars.color.text` background (or appropriate primary), white icon
- Disabled: opacity 0.5, cursor not-allowed
- Focus-visible (via `:focus-visible` on hidden input + adjacent sibling selector): 2px outline on indicator
- Label text: `body` typography, margin-left 8px

### `Checkbox.test.tsx`
- Renders unchecked by default
- Renders with label text
- Checked state shows check indicator
- Indeterminate state shows minus indicator
- Calls onChange with new checked value on click
- Disabled prevents interaction
- Forwards ref to the input element
- Label click toggles checkbox

### `index.ts`
- Re-export `Checkbox` and `CheckboxProps`

## Demo Reference
Checkboxes appear in card selection for narrative composition and settings panels.

## Integration Proofs
```bash
# Checkbox tests pass
npx vitest run --reporter=verbose src/common/components/Checkbox/

# Type-check
npx tsc --noEmit src/common/components/Checkbox/Checkbox.tsx
```

## Acceptance Criteria
- [ ] Uses hidden native `<input type="checkbox">` for accessibility
- [ ] Custom visual indicator: 18x18 box
- [ ] Checked state shows check icon
- [ ] Indeterminate state shows minus icon (set via DOM ref)
- [ ] Label text is clickable to toggle
- [ ] Disabled state: opacity 0.5, no interaction
- [ ] Focus-visible ring on visual indicator
- [ ] Forwards ref to input
- [ ] Tests pass: `npx vitest run src/common/components/Checkbox/`

## Anti-Patterns
- Do not omit the native input; it is required for form semantics and accessibility
- Do not use `role="checkbox"` on a div; use the real input
- Do not handle form state internally; this is a controlled component
