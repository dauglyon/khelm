# Task 19: Badge Component

## Dependencies
- **02** Sprinkles utility API (for spacing and layout)
- **06** CSS keyframe animations (for `pulseStyle`)

## Context
Badge is a status indicator consisting of a colored dot and optional label text. The dot color maps to the status token set (`color.status.*`). For `thinking` and `running` statuses, the dot pulses using the CSS `pulse` keyframe. Status is also communicated via `aria-live` for screen readers.

## Implementation Requirements

### Files to Create
1. **`src/common/components/Badge/Badge.tsx`** — Component implementation
2. **`src/common/components/Badge/Badge.css.ts`** — Styles
3. **`src/common/components/Badge/Badge.test.tsx`** — Tests
4. **`src/common/components/Badge/index.ts`** — Barrel export

### `Badge.tsx`
- Props per the spec:

| Prop | Type | Default |
|------|------|---------|
| `status` | `'thinking' \| 'running' \| 'complete' \| 'error'` | required |
| `label` | `string` | optional |
| `pulse` | `boolean` | `true` for thinking/running, `false` otherwise |
| `className` | `string` | optional |

- Render a `<span>` containing: status dot (8px circle) + optional label text
- Dot color from `vars.color.status[status]`
- When `pulse` is true (or defaulted for thinking/running): apply CSS pulse animation to dot
- Wrap in `aria-live="polite"` region so status changes are announced
- Include `aria-label` with status text (e.g., "Status: running") even without visible label

### `Badge.css.ts`
- Import `vars` from `src/theme`
- Import `pulseStyle` from `src/common/animations/keyframes.css.ts`
- Base: inline-flex, center-aligned, gap 6px
- Dot: 8px width/height, border-radius 50%, background from status token
- Status color variants for each status
- Pulse animation class applied conditionally
- Label: `bodySm` typography, `vars.color.textMid`

### `Badge.test.tsx`
- Renders dot with correct color for each status
- Renders label text when provided
- No label text when `label` is not provided
- Pulse animation active for thinking status by default
- Pulse animation active for running status by default
- Pulse animation inactive for complete status by default
- `pulse={false}` overrides default pulse behavior
- Has `aria-live="polite"` region
- Has accessible status text

### `index.ts`
- Re-export `Badge` and `BadgeProps`

## Demo Reference
Badges appear on cards to show execution status (thinking, running, complete, error).

## Integration Proofs
```bash
# Badge tests pass
npx vitest run --reporter=verbose src/common/components/Badge/

# Type-check
npx tsc --noEmit src/common/components/Badge/Badge.tsx
```

## Acceptance Criteria
- [ ] Four status values: thinking, running, complete, error
- [ ] Dot color from `color.status.*` tokens
- [ ] Pulse animation on dot for thinking/running by default
- [ ] `pulse` prop allows override
- [ ] Optional label text beside dot
- [ ] `aria-live="polite"` for screen reader announcements
- [ ] Accessible status text present
- [ ] CSS-only pulse animation (no JS)
- [ ] Tests pass: `npx vitest run src/common/components/Badge/`

## Anti-Patterns
- Do not communicate status through color alone; use aria-live
- Do not use JS animation for pulse; CSS keyframe only
- Do not add click handlers; Badge is purely informational
