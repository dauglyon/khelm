# Integration: design-system -> card

## Imports Required

### Theme and Tokens
- `vars` (theme contract) -- `color.inputType.*` for card type badge and accent bar, `color.status.*` for status indicators and animations, `color.surface`, `color.border`, `color.text`, `color.textMid`, `color.textLight`
- `InputType` enum -- determines card accent bar color, type badge color, and reference pill colors
- `sprinkles` for utility styling on card layout sections (header, body, chat panel)

### Components
- **Card** (`inputType`, `selected`, `children`) -- the presentational card container; each card instance wraps its content in this shell. `inputType` drives the 3px top accent bar color.
- **Chip** (`inputType`, `label`, `size: 'sm'`) -- type badge in every card header (e.g., "SQL", "Python", "Hypothesis"); also used for `suggestedQueries` chips in Hypothesis cards and cross-card reference pills in card body
- **Badge** (`status`, `label`, `pulse`) -- status indicator dot + label beside the type badge in every card header. `pulse: true` for `thinking`/`queued`/`running` statuses.
- **Button** (`variant`, `size: 'sm'`) -- retry button on error cards, upload/cancel buttons on data ingest cards, send button in chat panel, abort/retry in chat action bar
- **IconButton** -- card header action buttons (chat, copy, pin, delete), visible on hover/focus
- **TextInput** (`size: 'sm'`) -- inline shortname editing in card header (on click), chat panel input field
- **Spinner** (`size: 20`, `color`) -- running status indicator in card header, loading state during streaming
- **Skeleton** (`variant: 'text' | 'rect'`, `lines`) -- shimmer placeholder for card body content during `thinking` status
- **Stack** -- layout composition within card sections (header row, body column, chat message list, action bar)
- **Icon** -- status icons (checkmark for complete, error icon for error), card action icons (chat, copy, pin, delete), drag handle

### Animation Utilities
- **cardStatus** Motion variants -- subtle scale pulse per card status (thinking, queued, running, complete, error)
- **easing.out** -- status transition cross-fade duration (200ms)
- **fadeIn** variant -- result section fade-in on completion
- CSS **shimmer** keyframe -- card body shimmer overlay during `thinking` status
- CSS **pulse** keyframe -- status dot pulsing for `thinking`/`queued`/`running`
- **panelSlide** variant -- chat panel slide-in from right edge of card

### Typography
- `vars.font.mono` (JetBrains Mono) -- SQL query code blocks, Python code blocks
- `vars.font.serif` (Source Serif 4) -- Hypothesis claim callout block
- `vars.font.sans` (DM Sans) -- shortname (semibold), body text, chat messages
- Typography recipes: `mono` for code, `body` for general content, `heading` for shortname

## Acceptance Criteria

1. Every card instance wraps content in the design-system `Card` component with the correct `inputType` prop -- the 3px top accent bar matches the card's type color
2. Every card header renders a `Chip` with `inputType` matching the card type as the type badge
3. Every card header renders a `Badge` with `status` matching the card's current `CardStatus` -- dot color from `color.status.*` tokens
4. `Badge` has `pulse: true` when card status is `thinking`, `queued`, or `running`
5. Status indicator dot for `thinking` uses `color.status.thinking` (#B8660D) with CSS `pulse` keyframe
6. Status indicator dot for `running` uses `color.status.running` (#2B6CB0) with `Spinner`
7. Status indicator for `complete` shows a green checkmark using `color.status.complete` (#1A7F5A) with spring-easing scale-in
8. Status indicator for `error` shows a red error icon using `color.status.error` (#C53030) with subtle shake animation
9. Card body during `thinking` status renders `Skeleton` components with `shimmer` keyframe animation
10. SQL and Python card code blocks use `vars.font.mono` (JetBrains Mono)
11. Hypothesis claim callout uses `vars.font.serif` (Source Serif 4)
12. Inline shortname editing uses `TextInput` from the design system
13. Card header action buttons (chat, copy, pin, delete) use `IconButton` with `aria-label`
14. Chat panel slide-in uses `panelSlide` Motion variant
15. Chat panel input uses `TextInput`; send button uses `Button`
16. Suggested query chips in Hypothesis cards use `Chip` (clickable, creates new card)
17. Data ingest card shows upload progress -- upload/cancel buttons use `Button`; status uses `Badge`
18. All status transition cross-fades use `easing.out` (200ms) via Motion `AnimatePresence`
19. `prefers-reduced-motion` disables shimmer, pulse, and scale animations -- uses instant transitions and static icons per design-system accessibility spec
20. No raw hex color values appear in card domain code -- all colors sourced from `vars`
