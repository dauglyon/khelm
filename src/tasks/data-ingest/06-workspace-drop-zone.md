# Task 06: Workspace Drop Zone Component

## Summary

Implement the `WorkspaceDropZone` component that wraps the workspace area, receives OS file drops via `react-dropzone`, provides visual feedback during drag, and hands dropped files to the ingest pipeline.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 01 (ingest-store) | in-domain | `useIngestStore.addFile()` action |
| design-system | cross-domain | `dropzone` Motion variants, theme tokens (`color.inputType.dataIngest.*`), design token colors |
| workspace | cross-domain | Workspace container element as drop target, `WorkspacePanel` component tree |

## Context

The drop zone covers the full workspace area but does not interfere with card DnD (dnd-kit handles intra-workspace card sorting separately). The drop zone activates only when the drag payload originates from the OS (external files), not from within the app. On drop, each `File` object enters the ingest pipeline.

Architecture reference: `architecture/data-ingest.md` section 1 (File Drop Zone).

## Demo Reference (Vignette 3)

> Drag a file onto the workspace.

The user drags a file from their OS file manager onto the workspace. Visual feedback shows whether the file type is accepted or rejected. On drop, detection begins immediately.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/WorkspaceDropZone.tsx` | Drop zone component | ~120 |
| `src/features/data-ingest/WorkspaceDropZone.css.ts` | vanilla-extract styles | ~50 |
| `src/features/data-ingest/WorkspaceDropZone.test.tsx` | Component tests | ~180 |

### react-dropzone configuration

```typescript
const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
  onDrop: handleDrop,
  accept: { /* mapped from supported extensions */ },
  maxSize: MAX_FILE_SIZE, // default 10 GB
  multiple: true,
  noClick: true,  // don't open file picker on click
  noKeyboard: true, // keyboard handled by workspace
});
```

### Accepted file extensions (from architecture)

```
.csv, .tsv, .tab, .fasta, .fa, .fna, .faa, .fastq, .fq, .json, .xlsx, .xls
```

### Visual feedback states

| State | Trigger | Visual |
|-------|---------|--------|
| Idle | No drag activity | No overlay |
| Drag active | `isDragActive` -- file dragged over workspace | Dashed border overlay, teal tint (`#E0F2F2` via theme token) |
| Drag accept | `isDragAccept` -- file type is valid | Border becomes solid teal (`#2D8E8E` via theme token) |
| Drag reject | `isDragReject` -- file type invalid | Border becomes red (`#C53030` via status.error token), reject icon |

### Overlay component

A positioned overlay div that renders inside the drop zone when drag is active. Uses Motion variants (`dropzone` variant set from design-system) for animated transitions between states.

### Drop handler

```typescript
function handleDrop(acceptedFiles: File[], rejectedFiles: FileRejection[]) {
  // For each accepted file: call addFile on the ingest store
  // For each rejected file: create an error entry in the ingest store
  // The pipeline (task 11) will pick up new files and run detection
}
```

### Integration with workspace

- `WorkspaceDropZone` wraps the workspace content as a child-rendering wrapper
- It passes `getRootProps()` to the wrapper div
- Children (the masonry grid) render inside the drop zone
- The hidden `<input>` from `getInputProps()` is included but never shown

### Max file size

Default 10 GB (`10 * 1024 * 1024 * 1024` bytes). Configurable via prop or environment variable.

## Integration Proofs

```bash
# Renders children without overlay when idle
npx vitest run src/features/data-ingest/WorkspaceDropZone.test.tsx -t "renders children without overlay when idle"

# Shows overlay on drag active
npx vitest run src/features/data-ingest/WorkspaceDropZone.test.tsx -t "shows drag active overlay"

# Calls addFile on drop
npx vitest run src/features/data-ingest/WorkspaceDropZone.test.tsx -t "calls addFile for each dropped file"

# Rejects files exceeding max size
npx vitest run src/features/data-ingest/WorkspaceDropZone.test.tsx -t "rejects files exceeding max size"

# Shows reject state for unsupported extensions
npx vitest run src/features/data-ingest/WorkspaceDropZone.test.tsx -t "shows reject overlay for unsupported type"

# Does not interfere with card DnD events
npx vitest run src/features/data-ingest/WorkspaceDropZone.test.tsx -t "ignores non-file drag events"
```

## Acceptance Criteria

- [ ] `WorkspaceDropZone` uses `react-dropzone` `useDropzone` hook
- [ ] Drop zone covers the full workspace area (wraps children)
- [ ] `noClick: true` -- clicking the workspace does not open a file picker
- [ ] Accepted extensions match all supported file types from architecture
- [ ] Max file size defaults to 10 GB
- [ ] Multiple files accepted -- each creates its own ingest entry
- [ ] Four visual states: idle (no overlay), drag active (dashed teal border), drag accept (solid teal border), drag reject (red border)
- [ ] Overlay uses Motion variants from design-system (`dropzone` variant set)
- [ ] All overlay colors reference design tokens, not raw hex values
- [ ] On drop, each accepted file is passed to `useIngestStore.addFile()`
- [ ] Rejected files (wrong type or too large) create error entries
- [ ] Drop zone does NOT activate for intra-app drag events (only OS file drops)
- [ ] All tests pass: `npx vitest run src/features/data-ingest/WorkspaceDropZone.test.tsx`

## Anti-Patterns

- Do NOT use `noClick: false` -- the workspace is not a file picker button
- Do NOT handle card DnD here -- that is dnd-kit's domain (workspace spec)
- Do NOT put detection/parsing logic in the drop handler -- just register files in the store. Pipeline orchestration is task 11.
- Do NOT use raw hex colors in styles -- use vanilla-extract theme tokens
- Do NOT use `accept` MIME types -- use file extensions only (MIME is unreliable per architecture constraint)
