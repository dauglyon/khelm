# Data Ingest -- Task Breakdown

The data ingest domain provides file drop, client-side type detection, schema preview, and resumable upload for scientific data files. Users drag files onto the workspace; the system reads the first 64KB to detect format and infer schema; a preview card renders column definitions and sample data; and the file uploads via the tus resumable protocol with progress UI. The domain handles CSV, TSV, FASTA, FASTQ, JSON, and Excel formats, never loading the full file into browser memory.

## Implementation Targets

| Target | Source |
|--------|--------|
| File drop with visual feedback | architecture/data-ingest.md section 1 |
| Client-side type detection (extension + magic bytes) | architecture/data-ingest.md section 2 |
| Schema preview parsing (64KB, 6 formats) | architecture/data-ingest.md section 3 |
| Schema inference for tabular types | architecture/data-ingest.md section 4 |
| Preview card creation and rendering | architecture/data-ingest.md section 5 |
| Resumable tus upload with Uppy | architecture/data-ingest.md section 6 |
| Ingest state management (Zustand) | architecture/data-ingest.md section 7 |
| Error handling and edge cases | architecture/data-ingest.md section 8 |

## Cross-Domain Dependencies

| Domain | What is needed | Expected interface |
|--------|---------------|-------------------|
| design-system | Theme tokens (`color.inputType.dataIngest.*`), Card primitive, Badge, Button, Chip, Spinner, Skeleton, animation variants (`dropzone`) | Imports from `src/theme` and `src/common/components/` |
| workspace | `WorkspacePanel` container element (drop target), session store `addCard` action, `CardState` type with `type: 'data_ingest'` | Imports from workspace store and types |
| card | `CardType` enum (`data_ingest`), card container integration, card header/footer patterns | Imports from card domain types and components |

## Task Table

| ID | Summary | Files | Deps | Status | Preflight |
|----|---------|-------|------|--------|-----------|
| 01 | Ingest types and Zustand store | 2 | design-system, workspace (types only) | planned | `npx vitest run src/features/data-ingest/ingestStore.test.ts` |
| 02 | File type detection utility | 2 | 01 | planned | `npx vitest run src/features/data-ingest/detectFileType.test.ts` |
| 03 | Tabular schema parsers (CSV, TSV, Excel) | 2 | 02 | planned | `npx vitest run src/features/data-ingest/parsers/tabular.test.ts` |
| 04 | Sequence and JSON parsers (FASTA, FASTQ, JSON) | 2 | 02 | planned | `npx vitest run src/features/data-ingest/parsers/sequenceJson.test.ts` |
| 05 | Schema inference engine | 2 | 03 | planned | `npx vitest run src/features/data-ingest/schemaInference.test.ts` |
| 06 | Workspace drop zone component | 3 | 01, design-system, workspace | planned | `npx vitest run src/features/data-ingest/WorkspaceDropZone.test.tsx` |
| 07 | Preview card body -- tabular | 3 | 01, 05, design-system, card | planned | `npx vitest run src/features/data-ingest/PreviewCardTabular.test.tsx` |
| 08 | Preview card body -- sequence and JSON | 3 | 01, 04, design-system, card | planned | `npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx` |
| 09 | Upload manager (Uppy + tus) | 2 | 01 | planned | `npx vitest run src/features/data-ingest/uploadManager.test.ts` |
| 10 | Upload progress UI | 3 | 07, 08, 09, design-system | planned | `npx vitest run src/features/data-ingest/UploadProgress.test.tsx` |
| 11 | Drop-to-card pipeline orchestration | 2 | 02, 03, 04, 05, 06, 09 | planned | `npx vitest run src/features/data-ingest/ingestPipeline.test.ts` |
| 12 | Error handling and edge cases | 2 | 06, 11 | planned | `npx vitest run src/features/data-ingest/errorHandling.test.ts` |

## Critical Path DAG

```
                 design-system ──┐
                    workspace ───┤
                         card ───┤
                                 │
                          ┌──────┘
                          v
                   [01 ingest-store]
                     /    |    \
                    v     |     v
         [02 type-detect] |  [09 upload-mgr]
              /    \      |        |
             v      v     |        |
    [03 tabular] [04 seq] |        |
         |               |        |
         v               |        |
    [05 inference]        |        |
         |     \          |        |
         v      v         v        |
    [07 card-tab] [08 card-seq]    |
         |             |           |
         v             v           v
              [10 upload-progress-ui]
                        |
                        v
              [11 pipeline-orchestration]
                        |
                        v
              [12 error-handling]
                        |
                        v
                      DONE
```

Note: Task 06 (drop zone) depends on 01 + cross-domain deps and can run in parallel with the parsers (02-05). It feeds into task 11 (pipeline).

```
              [06 drop-zone] ──────────────────> [11 pipeline]
```

## Parallelism Waves

| Wave | Tasks | Can start when |
|------|-------|---------------|
| 1 | 01 (ingest store) | design-system types, workspace types available |
| 2 | 02 (type detection), 09 (upload manager), 06 (drop zone) | Task 01 complete |
| 3 | 03 (tabular parsers), 04 (sequence/JSON parsers) | Task 02 complete |
| 4 | 05 (schema inference) | Task 03 complete |
| 5 | 07 (preview card tabular), 08 (preview card seq/JSON) | Tasks 05, 04, 01 complete + card domain |
| 6 | 10 (upload progress UI) | Tasks 07, 08, 09 complete |
| 7 | 11 (pipeline orchestration) | Tasks 02-06, 09 complete |
| 8 | 12 (error handling) | Tasks 06, 11 complete |

Maximum parallelism is 3 tasks (wave 2 or wave 3).
