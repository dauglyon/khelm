# Task 15: TextInput Component

## Dependencies
- **02** Sprinkles utility API (for spacing and layout)
- **03** Typography scale (for input text styling)

## Context
TextInput is the standard text input field with support for adornments (prefix/suffix icons or text) and error states. It follows the same size scale as other form components.

## Implementation Requirements

### Files to Create
1. **`src/common/components/TextInput/TextInput.tsx`** — Component implementation
2. **`src/common/components/TextInput/TextInput.css.ts`** — Styles
3. **`src/common/components/TextInput/TextInput.test.tsx`** — Tests
4. **`src/common/components/TextInput/index.ts`** — Barrel export

### `TextInput.tsx`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md'` | `'md'` |
| `error` | `boolean \| string` | `false` |
| `prefix` | `ReactNode` | optional, left adornment |
| `suffix` | `ReactNode` | optional, right adornment |
| `className` | `string` | optional |
| `id` | `string` | optional, for label association |

- Plus all standard `<input>` HTML attributes (type, placeholder, value, onChange, etc.)
- Render wrapper div containing: optional prefix, `<input>`, optional suffix
- When `error` is a string: render error message below input
- When `error` is true/string: apply error border color (`vars.color.status.error`)
- Forward ref to the `<input>` element
- Focus-visible ring on the wrapper when input is focused (2px, `vars.color.text`)

### `TextInput.css.ts`
- Import `vars` from `src/theme`
- Wrapper: flex row, `vars.color.surface` background, `vars.color.border` border, border-radius 6px
- Size variants: sm (height 32px, font bodySm), md (height 40px, font body)
- Input element: reset appearance, inherit font, transparent background, flex-grow
- Prefix/suffix: flex-shrink-0, `vars.color.textMid`, padding
- Error state: border color changes to `vars.color.status.error`
- Error message: `vars.color.status.error`, caption font size, margin-top 4px
- Focus state: outline on wrapper, not on input directly

### `TextInput.test.tsx`
- Renders with default props
- Renders at each size (sm, md)
- Renders with prefix adornment
- Renders with suffix adornment
- Shows error border when `error={true}`
- Shows error message when `error="message"`
- Passes value and onChange to underlying input
- Forwards ref to the input element
- Renders placeholder text
- Focus outline appears on wrapper (class-based assertion)

### `index.ts`
- Re-export `TextInput` and `TextInputProps`

## Demo Reference
TextInput is used in form contexts, settings panels, and as basis for the Select component.

## Integration Proofs
```bash
# TextInput tests pass
npx vitest run --reporter=verbose src/common/components/TextInput/

# Type-check
npx tsc --noEmit src/common/components/TextInput/TextInput.tsx
```

## Acceptance Criteria
- [ ] Two sizes: sm (32px) and md (40px)
- [ ] Prefix and suffix adornment slots
- [ ] Error state: boolean toggles border, string shows message
- [ ] Error border uses `status.error` token
- [ ] Focus-visible ring on wrapper div
- [ ] Ref forwards to the `<input>` element
- [ ] All standard input HTML attributes supported
- [ ] Tests pass: `npx vitest run src/common/components/TextInput/`

## Anti-Patterns
- Do not use `<textarea>`; this is single-line input only
- Do not handle form state (value/onChange) internally; this is a controlled component
- Do not hardcode colors; use theme tokens
- Do not put focus ring on the input; put it on the wrapper for visual consistency with adornments
