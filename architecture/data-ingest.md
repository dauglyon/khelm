# Data Ingest

File drop, type detection, schema preview, and resumable upload for scientific data files.

**Status:** planned
**Dependencies:** design-system, workspace, card
**Research:** [RSH-008](research/rsh-008-file-handling-and-ingest.md), [RSH-010](research/rsh-010-drag-and-drop.md)

---

## Scope

| In Scope | Out of Scope |
|----------|-------------|
| OS file drop onto workspace | Server-side parsing and indexing |
| Client-side type detection (extension + magic bytes) | Post-upload data querying |
| Schema preview from first 64KB | Full-file client-side parsing |
| Preview card creation and rendering | User-defined custom schemas |
| Resumable tus upload with progress UI | Server-side tus endpoint (tusd) configuration |
| Schema inference on 64KB sample | |
| DOI / accession number resolution | |
| Recognized data ID (JGI, NCBI) fetch | |

## Ingest vs Note Rules

What becomes an ingest card vs a note card is determined by whether structured queryable data results.

| Input | Result | Rationale |
|-------|--------|-----------|
| File drag-and-drop | **ingest** | Schema detected, structured data |
| DOI / accession number | **ingest** | Resolves to source, extracts structured data (e.g. supplementary tables) |
| Recognized data ID (JGI, NCBI) | **ingest** | Fetches from known repository |
| Arbitrary URL | **note** | Fetched, summarized, stored as session context |

**Rule:** if structured queryable data comes in → ingest. If it's just content → note.

---

## Supported File Types

| Format | Extension(s) | Magic Bytes (hex) | Parser | Preview Content |
|--------|-------------|-------------------|--------|----------------|
| CSV | `.csv` | None (text) | Papa Parse | Column names, inferred types, sample rows |
| TSV | `.tsv`, `.tab` | None (text) | Papa Parse | Column names, inferred types, sample rows |
| FASTA | `.fasta`, `.fa`, `.fna`, `.faa` | `>` (0x3E) as first char | Custom | Sequence count, avg length, first 3 records |
| FASTQ | `.fastq`, `.fq` | `@` (0x40) as first char | Custom | Sequence count, avg length, quality summary, first 3 records |
| JSON | `.json` | `{` or `[` as first non-whitespace | `JSON.parse` on slice | Structure shape (object/array), key names, sample entries |
| Excel | `.xlsx`, `.xls` | `50 4B 03 04` (ZIP/PK) | SheetJS | Sheet names, column names, inferred types, sample rows |

---

## Pipeline Overview

```
File dropped onto workspace
        |
        v
  react-dropzone receives File object
        |
        v
  Type detection (extension + magic bytes from first 64KB)
        |
        v
  Schema preview parsing (first 64KB only)
        |
        v
  Preview card created on workspace
        |
        v
  User reviews / adjusts schema
        |
        v
  Uppy + tus resumable upload begins
        |
        v
  Progress shown in preview card until complete
```

---

## 1. File Drop Zone

### Component: `WorkspaceDropZone`

Wraps the workspace area. Uses `react-dropzone`'s `useDropzone` hook for headless control over UI.

| Aspect | Detail |
|--------|--------|
| Library | react-dropzone (`useDropzone` hook) |
| Drop target | Workspace container element |
| Accepted types | Extensions from Supported File Types table above |
| Max file size | Configurable; default 10 GB |
| Multiple files | Yes; each file creates its own preview card |

### Visual Feedback States

| State | Trigger | Visual |
|-------|---------|--------|
| Idle | No drag activity | No overlay |
| Drag active | `isDragActive` -- file dragged over workspace | Dashed border overlay, teal tint (`#E0F2F2`) |
| Drag accept | `isDragAccept` -- file type is valid | Border becomes solid teal (`#2D8E8E`) |
| Drag reject | `isDragReject` -- file type invalid | Border becomes red (`#C53030`), reject icon |

### Drop Zone Behavior

- Drop zone covers the full workspace area but does NOT interfere with card DnD (dnd-kit / pragmatic-drag-and-drop handles intra-workspace card sorting separately).
- The drop zone activates only when the drag payload originates from the OS (external files), not from within the app.
- On drop, each `File` object enters the type detection step immediately.

---

## 2. File Type Detection

Detection runs entirely client-side. The browser never loads the full file into memory.

### Detection Strategy

1. **Read first 64KB**: `File.slice(0, 65536)` via `FileReader.readAsArrayBuffer()`
2. **Check file extension** against the Supported File Types table
3. **Check magic bytes** from the buffer's first 4-8 bytes
4. **Resolve conflicts**: magic bytes take precedence over extension when they disagree
5. **Reject unknown**: if neither extension nor magic bytes match, show an unsupported-type error card

### Magic Byte Signatures

| Format | Bytes | Offset |
|--------|-------|--------|
| Excel (XLSX) | `50 4B 03 04` | 0 |
| Excel (XLS) | `D0 CF 11 E0` | 0 |
| FASTA | `3E` (`>`) | 0 (first non-whitespace) |
| FASTQ | `40` (`@`) | 0 (first non-whitespace) |
| JSON | `7B` (`{`) or `5B` (`[`) | 0 (first non-whitespace) |
| CSV/TSV | No signature | Fall back to extension; if no extension, try Papa Parse auto-detect delimiter |

### MIME Type Caveat

Do NOT rely on `File.type` (MIME) for CSV/TSV detection. macOS reports `text/plain`, Windows reports `application/vnd.ms-excel`. Always use extension + magic bytes.

---

## 3. Schema Preview

Schema preview parses only the first 64KB slice. No full-file reads in the browser.

### Parser Configuration by Type

| Format | Parser | Configuration |
|--------|--------|---------------|
| CSV | Papa Parse | `preview: 100`, `header: true`, `dynamicTyping: true`, auto-detect delimiter |
| TSV | Papa Parse | `preview: 100`, `header: true`, `dynamicTyping: true`, `delimiter: '\t'` |
| Excel | SheetJS | `XLSX.read(buffer)`, first sheet only, first 100 rows via `sheet_to_json` with `range` option |
| FASTA | Custom | Parse until 10 sequences or buffer exhausted; extract headers and sequence lengths |
| FASTQ | Custom | Parse until 10 records or buffer exhausted; extract headers, sequence lengths, quality scores |
| JSON | `JSON.parse` | Parse the 64KB slice; if truncated, parse up to last complete object/element |

### Preview Output Shape

All parsers produce a normalized preview result:

| Field | Type | Description |
|-------|------|-------------|
| `fileType` | string | Detected format (`csv`, `tsv`, `fasta`, `fastq`, `json`, `xlsx`) |
| `fileName` | string | Original file name |
| `fileSize` | number | Total file size in bytes |
| `columns` | `Column[]` | For tabular types: column definitions with inferred types |
| `sampleRows` | `Record[]` | For tabular types: first N data rows as objects |
| `sampleRecords` | `SequenceRecord[]` | For sequence types: first N sequence records |
| `structure` | object | For JSON: top-level shape description |
| `parseErrors` | `ParseError[]` | Any errors encountered during preview parse |

---

## 4. Schema Inference

Runs on the 64KB sample for tabular formats (CSV, TSV, Excel). Produces per-column type annotations.

### Inferred Column Types

| Type | Detection Rule |
|------|---------------|
| `integer` | All non-null sample values pass `Number.isInteger(parseFloat(v))` and `parseFloat(v).toString() === v.trim()` |
| `float` | All non-null sample values pass `isFinite(parseFloat(v))` but fail integer check |
| `boolean` | All non-null sample values are in `{true, false, yes, no, 0, 1, t, f, y, n}` (case-insensitive) |
| `date` | >90% of non-null sample values parse via ISO 8601 regex or `Date.parse()` returning a valid date |
| `categorical` | Unique value count / non-null row count < 0.1 (fewer than 10% unique values) AND type is string |
| `string` | Default fallback when no other type matches at >90% confidence |

### Inference Rules

| Rule | Detail |
|------|--------|
| Sample size | All rows from the 64KB preview (up to 100 rows) |
| Null handling | Empty strings, `NA`, `N/A`, `null`, `NaN`, `-` treated as null; excluded from type checks |
| Confidence threshold | A column gets a non-string type only if >=90% of non-null values match that type |
| Type priority | integer > float > boolean > date > categorical > string (check in this order; first match at threshold wins) |
| Mixed types | If no type reaches 90%, fall back to `string` |
| User override | All inferred types are editable by the user in the preview card before upload |

---

## 5. Preview Card

Created on the workspace immediately after schema preview completes. Uses the Data Ingest card type colors from the design system.

### Card Appearance

| Element | Detail |
|---------|--------|
| Card type color | Foreground `#2D8E8E`, Background `#E0F2F2`, Border `#A8D6D6` |
| Header | File name, detected type badge, file size |
| Body (tabular) | Column table: name, inferred type (editable dropdown), sample values |
| Body (sequence) | Record count, avg sequence length, quality summary (FASTQ), first 3 records |
| Body (JSON) | Structure shape, key listing, sample entries |
| Footer | "Upload" button, "Cancel" button |
| Error state | Parse errors shown inline with suggestions (e.g., "Could not detect delimiter -- is this a valid CSV?") |

### Card Status Lifecycle

| Status | Trigger | Visual |
|--------|---------|--------|
| `preview` | Schema preview complete, awaiting user action | Default card styling |
| `uploading` | User clicked "Upload" | Progress bar, percentage, upload speed |
| `paused` | Network interruption or user paused | Paused icon, "Resume" button |
| `complete` | tus upload finished | Success checkmark, data becomes available |
| `error` | Upload or parse failure | Error message, "Retry" button |

---

## 6. Resumable Upload

### Architecture

| Component | Role |
|-----------|------|
| Uppy (client) | Orchestrates file lifecycle, retry logic, progress tracking, React hooks |
| `@uppy/tus` plugin | Wraps `tus-js-client`, manages chunked resumable upload |
| tusd (server) | Reference tus server; receives chunks, stores to S3 backend |

### Upload Behavior

| Aspect | Detail |
|--------|--------|
| Protocol | tus v1 (resumable, chunked) |
| Chunk size | 5 MB default (configurable) |
| Retry | Exponential backoff; respects HTTP 429 |
| Resume | On network recovery, resumes from last confirmed byte offset |
| Parallelism | One upload per file; multiple files upload concurrently |
| Progress | Per-file: bytes uploaded, total bytes, percentage, estimated time remaining |
| Abort | User can cancel; partial upload cleaned up server-side |
| Metadata | File name, detected type, inferred schema sent as tus metadata headers |

### Progress UI

| Element | Location | Content |
|---------|----------|---------|
| Progress bar | Preview card footer | Filled bar with percentage |
| Speed indicator | Preview card footer | Current upload speed (e.g., "12.4 MB/s") |
| Time remaining | Preview card footer | Estimated time to completion |
| Pause/Resume | Preview card footer | Toggle button |
| Global indicator | Toolbar (app shell) | Count of active uploads, aggregate progress |

---

## 7. State Management

### Zustand Store: `useIngestStore`

| State Field | Type | Description |
|-------------|------|-------------|
| `files` | `Map<fileId, IngestFile>` | All files currently in the ingest pipeline |
| `activeUploads` | `number` | Count of files currently uploading |

### `IngestFile` Shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `file` | `File` | Browser File object reference |
| `status` | `'detecting' \| 'previewing' \| 'preview' \| 'uploading' \| 'paused' \| 'complete' \| 'error'` | Current pipeline stage |
| `detectedType` | `FileType \| null` | Result of type detection |
| `preview` | `PreviewResult \| null` | Parsed preview data |
| `schema` | `Column[] \| null` | Inferred (and possibly user-edited) schema |
| `uploadProgress` | `{ loaded: number, total: number }` | Upload byte progress |
| `error` | `string \| null` | Error message if failed |
| `cardId` | `string` | ID of the workspace card representing this file |

---

## 8. Error Handling

| Error | Cause | User-Facing Behavior |
|-------|-------|---------------------|
| Unsupported file type | Extension and magic bytes don't match any supported format | Error card: "Unsupported file type. Supported: CSV, TSV, FASTA, FASTQ, JSON, Excel." |
| Parse failure | 64KB slice cannot be parsed by the detected format's parser | Error card with raw preview of first 20 lines; suggest checking file integrity |
| Empty file | File size is 0 bytes | Error card: "File is empty." |
| Upload network error | Connection lost during tus upload | Card moves to `paused` status; auto-resumes when connection returns |
| Upload server error | tusd returns 5xx | Card shows error with "Retry" button; exponential backoff on auto-retry |
| File too large | Exceeds configured max file size | Immediate rejection at drop with size limit message |
| Duplicate file | Same file name + size already in workspace | Warning prompt: "A file with this name already exists. Replace or rename?" |

---

## 9. Key Constraints

| Constraint | Rationale |
|------------|-----------|
| Browser never loads full file into memory | Files can be multi-GB; `File.slice(0, 65536)` ensures constant memory usage |
| Preview parsing limited to 64KB | Provides instant feedback regardless of file size |
| Schema inference is sampling-based, not exhaustive | Speed over precision; user can override inferred types |
| Upload is always resumable (tus) | Scientific files are large; network reliability varies at field stations |
| Type detection uses extension + magic bytes, never MIME | `File.type` is inconsistent across operating systems |
| Drop zone is workspace-level, not per-card | Single clear drop target; each dropped file gets its own card |
