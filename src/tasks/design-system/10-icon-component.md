# Task 10: Icon Component

## Dependencies
- **02** Sprinkles utility API (for color utility)

## Context
Icon is a wrapper for inline SVG icons that provides consistent sizing and color inheritance. Icons are registered in a map (not a font or sprite sheet) and referenced by name. This task sets up the Icon component and a starter set of icons needed by other primitives (close, chevron-down, check, minus, search, spinner indicators).

## Implementation Requirements

### Files to Create
1. **`src/common/components/Icon/icons.tsx`** — SVG icon registry map
2. **`src/common/components/Icon/Icon.tsx`** — Component implementation
3. **`src/common/components/Icon/Icon.css.ts`** — Styles
4. **`src/common/components/Icon/Icon.test.tsx`** — Tests
5. **`src/common/components/Icon/index.ts`** — Barrel export

### `icons.tsx`
- Export an `iconRegistry` map: `Record<string, React.FC<React.SVGProps<SVGSVGElement>>>`
- Include starter icons needed by other design-system components:
  - `close` (X mark, for Chip onRemove)
  - `chevron-down` (for Select)
  - `check` (for Checkbox)
  - `minus` (for Checkbox indeterminate)
  - `search` (for TextInput prefix)
- Each icon is a simple inline SVG component with `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={2}`
- SVGs should be clean, minimal path data

### `Icon.tsx`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `name` | `string` (key from icon registry) | required |
| `size` | `16 \| 20 \| 24` | `20` |
| `color` | `'currentColor' \| string` | `'currentColor'` |
| `className` | `string` | optional |

- Look up `name` in `iconRegistry`
- Render the SVG component at the specified `size` (width and height)
- Apply `color` to the SVG
- If `name` is not found, render nothing (or a fallback empty span) and log a dev warning
- Apply `aria-hidden="true"` by default (decorative); consumers add `aria-label` when meaningful

### `Icon.css.ts`
- Base icon style: `display: inline-flex`, `align-items: center`, `justify-content: center`, `flex-shrink: 0`
- Size variants for 16, 20, 24

### `Icon.test.tsx`
- Renders an icon by name
- Applies correct size (width/height attributes)
- Applies color prop
- Renders nothing for unknown icon name
- Has `aria-hidden="true"` by default
- Applies custom className

### `index.ts`
- Re-export `Icon`, `IconProps`, and `iconRegistry`

## Demo Reference
Icons appear throughout all vignettes as part of buttons, inputs, chips, and status indicators.

## Integration Proofs
```bash
# Icon tests pass
npx vitest run --reporter=verbose src/common/components/Icon/

# Type-check
npx tsc --noEmit src/common/components/Icon/Icon.tsx
```

## Acceptance Criteria
- [ ] `Icon` renders SVGs from a registry by name
- [ ] Size prop controls width and height (16, 20, 24)
- [ ] Color defaults to `currentColor` for CSS inheritance
- [ ] `aria-hidden="true"` applied by default
- [ ] Starter icon set includes: close, chevron-down, check, minus, search
- [ ] Unknown icon names render nothing gracefully
- [ ] Tests pass: `npx vitest run src/common/components/Icon/`

## Anti-Patterns
- Do not use an icon font or sprite sheet
- Do not import SVG files; icons are inline React components
- Do not add click handlers to Icon; it is purely presentational (use IconButton for interactive icons)
- Do not bundle a large icon library; only include what is needed
