# Task 11: Drop-to-Card Pipeline Orchestration

## Summary

Implement the orchestration function that wires the full ingest pipeline: file drop -> type detection -> schema preview parsing -> schema inference -> preview card creation on workspace. This is the glue that connects all prior tasks into a single cohesive flow.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 02 (type-detection) | in-domain | `detectFileType` function |
| 03 (tabular-parsers) | in-domain | `parseTabularPreview` function |
| 04 (sequence-json-parsers) | in-domain | `parseSequenceJsonPreview` function |
| 05 (schema-inference) | in-domain | `inferColumnTypes` function |
| 06 (workspace-drop-zone) | in-domain | Drop handler integration point |
| 09 (upload-manager) | in-domain | `startUpload` for when user clicks Upload |
| workspace | cross-domain | `addCard` action to create the card on the workspace |

## Context

Each prior task implements one stage of the pipeline. This task connects them into a sequential flow triggered by a file drop. The pipeline runs async (file reads are async), updates the ingest store at each stage, and creates a workspace card when preview is ready.

Architecture reference: `architecture/data-ingest.md` Pipeline Overview.

## Demo Reference (Vignette 3)

> Drag a file onto the workspace. The system detects the type, infers the schema, creates a preview card. The ingested data is immediately queryable.

This task implements the full "drag -> preview card" flow end-to-end.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/ingestPipeline.ts` | Pipeline orchestration | ~120 |
| `src/features/data-ingest/ingestPipeline.test.ts` | Integration tests | ~250 |

### Pipeline function

```typescript
async function processFile(fileId: string): Promise<void>
```

Called after `addFile` registers a file in the ingest store. Orchestrates the full pipeline:

### Pipeline stages

| Stage | Status in store | Action |
|-------|----------------|--------|
| 1. Detection | `detecting` | Call `detectFileType(file)`. On success, update `detectedType`. On failure, set error. |
| 2. Parse | `previewing` | Dispatch to correct parser based on `detectedType`. Call `parseTabularPreview` or `parseSequenceJsonPreview`. |
| 3. Inference | `previewing` | For tabular types only: call `inferColumnTypes` on the parsed columns. |
| 4. Preview ready | `preview` | Set `preview` and `schema` on the ingest file. |
| 5. Create card | `preview` | Call workspace `addCard` with type `data_ingest`, linking to the ingest file via `cardId`. |

### Store updates at each stage

```typescript
// Stage 1: detection
store.setStatus(fileId, 'detecting');
const detection = await detectFileType(file);
if (!detection.fileType) {
  store.setError(fileId, detection.error ?? 'Unsupported file type');
  return;
}
store.updateFile(fileId, { detectedType: detection.fileType });

// Stage 2: parse
store.setStatus(fileId, 'previewing');
const preview = isTabular(detection.fileType)
  ? parseTabularPreview(detection.buffer, detection.fileType, file.name, file.size)
  : parseSequenceJsonPreview(detection.buffer, detection.fileType, file.name, file.size);

// Stage 3: inference (tabular only)
let schema = preview.columns;
if (isTabular(detection.fileType) && preview.columns) {
  schema = inferColumnTypes(preview.columns, preview.sampleRows ?? []);
}

// Stage 4: preview ready
store.setPreview(fileId, preview);
store.updateFile(fileId, { schema });

// Stage 5: create workspace card
const cardId = workspaceStore.addCard({
  type: 'data_ingest',
  shortname: file.name,
  // ...
});
store.updateFile(fileId, { cardId });
```

### Upload trigger

When the user clicks "Upload" in the preview card, the pipeline calls:

```typescript
function triggerUpload(fileId: string): void {
  const file = store.getFile(fileId);
  uploadManager.startUpload(fileId, file.file, {
    fileName: file.file.name,
    fileType: file.detectedType!,
    schema: file.schema ?? undefined,
  });
  store.setStatus(fileId, 'uploading');
}
```

### Multi-file handling

When multiple files are dropped at once, `processFile` is called for each file independently. Files process concurrently (Promise.all or individual async calls).

### Helper

```typescript
function isTabular(fileType: FileType): boolean {
  return ['csv', 'tsv', 'xlsx'].includes(fileType);
}
```

## Integration Proofs

```bash
# Full pipeline: CSV file -> detection -> parse -> inference -> card creation
npx vitest run src/features/data-ingest/ingestPipeline.test.ts -t "processes csv file end to end"

# Full pipeline: FASTA file -> detection -> parse -> card creation (no inference)
npx vitest run src/features/data-ingest/ingestPipeline.test.ts -t "processes fasta file end to end"

# Detection failure creates error entry
npx vitest run src/features/data-ingest/ingestPipeline.test.ts -t "detection failure sets error status"

# Parse failure creates error entry
npx vitest run src/features/data-ingest/ingestPipeline.test.ts -t "parse failure sets error status"

# Multiple files process concurrently
npx vitest run src/features/data-ingest/ingestPipeline.test.ts -t "processes multiple files concurrently"

# Upload trigger sends file to upload manager
npx vitest run src/features/data-ingest/ingestPipeline.test.ts -t "triggerUpload starts upload with metadata"

# Workspace card created with correct type
npx vitest run src/features/data-ingest/ingestPipeline.test.ts -t "creates workspace card with data_ingest type"
```

## Acceptance Criteria

- [ ] `processFile` orchestrates detection -> parsing -> inference -> card creation
- [ ] Store status updates at each stage (`detecting` -> `previewing` -> `preview`)
- [ ] Detection failure short-circuits pipeline and sets error status
- [ ] Parse failure short-circuits pipeline and sets error status
- [ ] Schema inference runs only for tabular types (CSV, TSV, Excel)
- [ ] Workspace card created via `addCard` with `type: 'data_ingest'`
- [ ] Card ID linked back to the ingest file in the store
- [ ] `triggerUpload` correctly calls upload manager with file metadata
- [ ] Multiple concurrent file processing supported
- [ ] All tests pass: `npx vitest run src/features/data-ingest/ingestPipeline.test.ts`
- [ ] Tests mock all dependencies (detection, parsers, inference, workspace store, upload manager)

## Anti-Patterns

- Do NOT put pipeline logic in React components -- this is a pure async orchestration module
- Do NOT swallow errors silently -- every failure must set error status in the store
- Do NOT block on one file before processing the next -- files are independent
- Do NOT re-read the file in the parse stage -- reuse the `buffer` from detection
- Do NOT skip store status updates -- components rely on status to render correct UI
- Do NOT call upload automatically -- the user must click "Upload" in the preview card
