# Integration: design-system -> workspace

## Imports Required

### Theme and Tokens
- `vars` (theme contract) -- `color.inputType.*` for cross-card reference pill colors, `color.status.*` for status-driven styling, spacing tokens for grid gaps
- `InputType` enum -- used to determine pill background/border colors for cross-card reference pills
- `sprinkles` for utility styling on grid container and card containers

### Components
- **Chip** (`inputType`, `label`, `size: 'sm'`) -- cross-card reference pills rendered inline in card content and workspace (shortname + type color)
- **Stack** -- layout utility for the workspace panel, detail overlay, card container internals
- **Skeleton** (`variant: 'rect'`) -- placeholder for cards before measurement/data load

### Animation Utilities
- **cardEnterExit** variant -- fade + slide-up on first render of each card container (`initial: { opacity: 0, y: 20 }`, `animate: { opacity: 1, y: 0 }`)
- **easing.outQuart** -- enter animation easing (300ms duration)
- **easing.out** -- detail transition (layoutId shared-element FLIP) easing (200ms)
- **LazyMotionProvider** -- already provided at app root; workspace relies on it for `motion.div` card containers

### Typography
- Typography recipes for card shortname display in reference pills

## Acceptance Criteria

1. Card container enter animation uses the `cardEnterExit` Motion variant with `easing.outQuart` (300ms) -- only on first render, not on re-entering viewport after scroll
2. Detail transition (grid card to detail panel) uses Motion `layoutId` with `easing.out` (200ms)
3. Cross-card reference pills use `Chip` with the `inputType` prop matching the referenced card's type -- background, border, and foreground colors derive from `color.inputType.[type].*`
4. Reference pill click navigates to the referenced card with a scale-pulse highlight animation (300ms, using Motion)
5. Grid gap spacing uses `vars` spacing tokens (not raw px values)
6. Deleted-card reference pills render in a muted state using `vars.color.textLight` for text
7. Card container uses `vars.color.surface` for background and `vars.color.border` for borders
8. No raw hex color values or hardcoded easing curves appear in workspace code -- all sourced from `vars` and easing constants
