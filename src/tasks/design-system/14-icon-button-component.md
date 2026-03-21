# Task 14: IconButton Component

## Dependencies
- **13** Button component (IconButton is a variant/wrapper of Button)

## Context
IconButton is a square, icon-only button. It shares styling logic with Button but enforces square dimensions and requires `aria-label` for accessibility (since there is no visible text label).

## Implementation Requirements

### Files to Create
1. **`src/common/components/IconButton/IconButton.tsx`** — Component implementation
2. **`src/common/components/IconButton/IconButton.css.ts`** — Additional styles
3. **`src/common/components/IconButton/IconButton.test.tsx`** — Tests
4. **`src/common/components/IconButton/index.ts`** — Barrel export

### `IconButton.tsx`
- Props: same as Button except:
  - `children` is replaced by `icon` (required `ReactNode`)
  - `aria-label` is **required** (string)
  - No `children` prop
- Renders a `<button>` with square dimensions matching size: sm (28x28), md (36x36), lg (44x44)
- Uses same variant/color/size styling as Button
- Forward ref
- Spread remaining button HTML props

### `IconButton.css.ts`
- Square dimension overrides (equal width and height per size)
- Center-aligned content (the icon)
- Padding: 0 (icon centered in square)

### `IconButton.test.tsx`
- Renders with required `aria-label`
- Has square dimensions per size
- Renders the icon child
- TypeScript enforces `aria-label` is required (document in test comment)
- Loading state replaces icon with Spinner
- Disabled state works
- onClick fires
- Forwards ref

### `index.ts`
- Re-export `IconButton` and `IconButtonProps`

## Demo Reference
IconButton appears for close buttons, action menus, card collapse toggles.

## Integration Proofs
```bash
# IconButton tests pass
npx vitest run --reporter=verbose src/common/components/IconButton/

# Type-check
npx tsc --noEmit src/common/components/IconButton/IconButton.tsx
```

## Acceptance Criteria
- [ ] Square dimensions: sm 28x28, md 36x36, lg 44x44
- [ ] `aria-label` is a required prop
- [ ] Supports same variant, color, size props as Button
- [ ] Loading state shows Spinner in place of icon
- [ ] Focus-visible ring present
- [ ] Forwards ref
- [ ] Tests pass: `npx vitest run src/common/components/IconButton/`

## Anti-Patterns
- Do not allow text children; icon-only
- Do not make `aria-label` optional; it is required for accessibility
- Do not duplicate Button styling logic; share or compose with Button internals
