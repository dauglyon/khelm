# Integration: design-system -> data-ingest

## Imports Required

### Theme and Tokens
- `vars` (theme contract) -- `color.inputType.dataIngest.*` (fg: `#2D8E8E`, bg: `#E0F2F2`, border: `#A8D6D6`) for preview card and drop zone styling, `color.status.*` for upload lifecycle states, `color.border` for drop zone idle state
- `InputType` enum -- `dataIngest` value used for preview card `Card` and `Chip` components
- `sprinkles` for utility styling on drop zone overlay, schema preview table, progress UI

### Components
- **Card** (`inputType: 'dataIngest'`) -- preview card container with data ingest accent bar color
- **Chip** (`inputType: 'dataIngest'`, `label`) -- detected file type badge in preview card header (e.g., "CSV", "FASTA", "Excel")
- **Badge** (`status`, `label`, `pulse`) -- upload status lifecycle indicator in preview card (maps `uploading` -> `running`, `paused` -> `queued`, `complete` -> `complete`, `error` -> `error`)
- **Button** (`variant: 'solid' | 'outline'`, `size: 'md'`) -- "Upload" button, "Cancel" button, "Retry" button, "Resume" button in preview card footer
- **IconButton** -- close/dismiss preview card
- **Select** (`size: 'sm'`) -- column type override dropdown in schema preview (integer, float, boolean, date, categorical, string)
- **Spinner** (`size: 20`) -- loading state during type detection and schema parsing
- **Skeleton** (`variant: 'rect'`) -- placeholder for schema table while parsing
- **Stack** -- layout for preview card sections (header, schema table, footer with progress)
- **Icon** -- file type icons, drag reject icon, upload/pause/resume icons, error icon

### Animation Utilities
- **dropzone** Motion variant -- `idle`, `active`, `accept`, `reject` states for the `WorkspaceDropZone` overlay (border dash animation + scale on file hover)
- **fadeIn** variant -- preview card appearance after schema parsing completes
- **easing.out** -- drop zone transition between states
- CSS **pulse** keyframe -- uploading progress indicator animation

## Acceptance Criteria

1. `WorkspaceDropZone` visual feedback uses the `dropzone` Motion variant for all four states (idle, active, accept, reject)
2. Drag-accept state uses `color.inputType.dataIngest.border` (`#A8D6D6` / teal) for the solid border
3. Drag-reject state uses `color.status.error` (`#C53030`) for the red border and reject icon
4. Preview cards use the design-system `Card` component with `inputType: 'dataIngest'` -- 3px teal accent bar
5. File type badge in preview card header uses `Chip` with `inputType: 'dataIngest'`
6. Upload status lifecycle maps to `Badge` component: `uploading` -> `status: 'running'` (with `pulse: true`), `paused` -> `status: 'queued'`, `complete` -> `status: 'complete'`, `error` -> `status: 'error'`
7. Column type override in schema preview uses design-system `Select` component
8. Upload/Cancel/Retry/Resume buttons use design-system `Button` component
9. Schema table loading state uses `Skeleton` components
10. All data-ingest colors come from `vars.color.inputType.dataIngest.*` and `vars.color.status.*` -- no hardcoded hex values
11. Drop zone overlay covers workspace area without visual artifacts (proper z-index, transparent background with teal tint from tokens)
