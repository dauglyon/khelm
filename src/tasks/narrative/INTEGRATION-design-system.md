# Integration: design-system -> narrative

## Imports Required

### Theme and Tokens
- `vars` (theme contract) -- `color.inputType.*` for type badges in card summaries, `color.status.running` (`#2B6CB0`) for selected card highlight border, `color.surface`, `color.border`, `color.text`
- `InputType` enum -- used for type badge rendering in `CardSummary` components within the composition panel
- `sprinkles` for utility styling on composition panel, card list, preview modal

### Components
- **Chip** (`inputType`, `label`, `size: 'sm'`) -- type badge in each `CardSummary` row within the composition panel (e.g., "[SQL] User query...")
- **Checkbox** -- card selection control on each card in the compressed card list (composition mode)
- **Button** (`variant: 'solid' | 'outline'`, `size: 'md'`) -- "Compose" toolbar button (enter composition mode), "Exit" button, "Preview" button, "Export" button, "Select All" / "Clear" bulk actions, "Close" on preview modal
- **IconButton** -- drag handle icon on sortable card summary rows, close button on preview modal
- **Badge** (`label`) -- card count indicator ("4 selected") in the composition toolbar
- **Card** (`inputType`) -- card rendering in the compressed card list view (composition mode) and potentially in the narrative preview
- **Stack** -- layout for composition panel sections, card list, toolbar actions, preview modal content
- **Icon** -- drag handle grip dots, compose icon, export icon, close icon

### Animation Utilities
- **panelSlide** variant -- composition panel slide-in from right edge when entering composition mode
- **fadeIn** variant -- preview modal appearance
- **easing.out** -- composition panel transition, card list compression animation

### Typography
- `vars.font.serif` (Source Serif 4) -- narrative preview body text (document reading mode)
- `vars.font.sans` (DM Sans) -- card summary text, connective text, panel UI

## Acceptance Criteria

1. Composition panel uses `panelSlide` Motion variant for open/close animation
2. Card selection checkboxes in composition mode use the design-system `Checkbox` component with labels referencing card title
3. Selected cards show a highlight border using `color.status.running` (`#2B6CB0`) -- sourced from `vars.color.status.running`, not hardcoded
4. Each `CardSummary` in the composition panel renders a `Chip` with the correct `inputType` for the type badge
5. "Compose" / "Exit" / "Preview" / "Export" toolbar buttons use design-system `Button` component
6. Card count badge ("4 selected") uses design-system `Badge` component
7. Drag handle on sortable card summaries uses `Icon` component with grip dots
8. Narrative preview modal renders card content with `vars.font.serif` (Source Serif 4) for document reading
9. Cards in `thinking` or `running` status have their `Checkbox` disabled (not selectable)
10. Composition panel empty state text uses `vars.color.textMid` for the prompt message
11. No raw hex color values in narrative domain code -- all sourced from `vars`
