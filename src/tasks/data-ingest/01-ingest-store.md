# Task 01: Ingest Types and Zustand Store

## Summary

Define the TypeScript types for the ingest pipeline and create the Zustand store (`useIngestStore`) that tracks all files through the detection-preview-upload lifecycle.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| design-system | cross-domain | `CardType` enum value `data_ingest` for type alignment |
| workspace | cross-domain | `addCard` action type signature; `CardState` shape (for `cardId` linkage) |

## Context

The ingest store is the central state for the data ingest pipeline. Every other task in this domain reads from or writes to it. The store must be usable outside React (Uppy callbacks, SSE handlers) via `getState`/`setState`, following the Zustand patterns established in the workspace store.

Architecture reference: `architecture/data-ingest.md` section 7 (State Management).

## Demo Reference (Vignette 3)

> Drag a file onto the workspace. The system detects the type, infers the schema, creates a preview card.

The store tracks each file through the stages: `detecting` -> `previewing` -> `preview` -> `uploading` -> `paused` -> `complete` -> `error`.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/ingestStore.ts` | Zustand store + types | ~150 |
| `src/features/data-ingest/ingestStore.test.ts` | Store unit tests | ~200 |

### Types to define

From `architecture/data-ingest.md` section 7:

- `FileType` -- union: `'csv' | 'tsv' | 'fasta' | 'fastq' | 'json' | 'xlsx'`
- `IngestStatus` -- union: `'detecting' | 'previewing' | 'preview' | 'uploading' | 'paused' | 'complete' | 'error'`
- `Column` -- `{ name: string; inferredType: ColumnType; sampleValues: unknown[] }`
- `ColumnType` -- union: `'integer' | 'float' | 'boolean' | 'date' | 'categorical' | 'string'`
- `SequenceRecord` -- `{ header: string; sequence: string; length: number; quality?: string }`
- `ParseError` -- `{ message: string; line?: number; column?: string }`
- `PreviewResult` -- normalized preview output shape (section 3)
- `IngestFile` -- full file state record (section 7)

### Store shape

```typescript
interface IngestState {
  files: Map<string, IngestFile>;
  activeUploads: number;
}
```

### Actions to implement

| Action | Signature | Effect |
|--------|-----------|--------|
| `addFile` | `(file: File) => string` | Creates `IngestFile` with unique ID, status `detecting`, adds to map. Returns the ID. |
| `updateFile` | `(id: string, patch: Partial<IngestFile>) => void` | Shallow merge patch into file state |
| `removeFile` | `(id: string) => void` | Removes from map, decrements `activeUploads` if was uploading |
| `setStatus` | `(id: string, status: IngestStatus) => void` | Updates status; adjusts `activeUploads` count |
| `setPreview` | `(id: string, preview: PreviewResult) => void` | Sets preview data, moves status to `preview` |
| `setUploadProgress` | `(id: string, loaded: number, total: number) => void` | Updates `uploadProgress` |
| `setError` | `(id: string, error: string) => void` | Sets error message, moves status to `error` |
| `getFile` | `(id: string) => IngestFile | undefined` | Selector for single file |

### Selectors to implement

| Selector | Returns |
|----------|---------|
| `useIngestFile(id)` | Single `IngestFile` |
| `useIngestFiles()` | All files as array |
| `useActiveUploadCount()` | Number of files with status `uploading` |

## Integration Proofs

```bash
# Store creates and retrieves a file
npx vitest run src/features/data-ingest/ingestStore.test.ts -t "addFile creates entry with detecting status"

# Status transitions update activeUploads counter
npx vitest run src/features/data-ingest/ingestStore.test.ts -t "activeUploads increments on uploading"

# Store is usable outside React via getState/setState
npx vitest run src/features/data-ingest/ingestStore.test.ts -t "getState returns current files outside React"

# removeFile cleans up correctly
npx vitest run src/features/data-ingest/ingestStore.test.ts -t "removeFile decrements activeUploads if uploading"
```

## Acceptance Criteria

- [ ] All types exported from `ingestStore.ts` and importable by other tasks
- [ ] `useIngestStore` Zustand store created with `create()` (not `createStore`)
- [ ] `addFile` generates a unique ID (crypto.randomUUID or nanoid)
- [ ] `setStatus` correctly maintains `activeUploads` count (increment on transition to `uploading`, decrement on transition away)
- [ ] `removeFile` cleans up `activeUploads` if the removed file was uploading
- [ ] All selectors use Zustand selector pattern for render isolation
- [ ] Store is accessible outside React via `useIngestStore.getState()`
- [ ] All tests pass: `npx vitest run src/features/data-ingest/ingestStore.test.ts`
- [ ] No raw hex colors or pixel values -- only type references that will align with design system tokens

## Anti-Patterns

- Do NOT use Redux or RTK -- this domain uses Zustand per architecture decisions
- Do NOT store the `File` object in Zustand state if it causes serialization issues in devtools; store a reference handle or use a WeakRef pattern
- Do NOT put upload logic (Uppy/tus) in the store -- the store is pure state; upload orchestration lives in task 09
- Do NOT import from workspace or card internals -- only import their public types
