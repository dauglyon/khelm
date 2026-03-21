# Task 03: Tabular Schema Parsers (CSV, TSV, Excel)

## Summary

Implement preview parsers for CSV, TSV, and Excel formats that operate on the 64KB buffer from type detection. Each parser extracts column names, sample rows, and produces the normalized `PreviewResult` shape.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 01 (ingest-store) | in-domain | `PreviewResult`, `Column`, `ParseError` types |
| 02 (type-detection) | in-domain | `DetectionResult` with `buffer` and `fileType` |

## Context

Preview parsing runs on the 64KB slice already loaded during type detection. The buffer is reused -- no second file read. CSV and TSV use Papa Parse; Excel uses SheetJS. All produce the same normalized `PreviewResult` shape.

Architecture reference: `architecture/data-ingest.md` section 3 (Schema Preview).

## Demo Reference (Vignette 3)

> ...infers the schema, creates a preview card.

For tabular files, the preview card shows column names, inferred types, and sample rows. This task produces the data that the preview card renders.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/parsers/tabular.ts` | CSV, TSV, Excel parsers | ~180 |
| `src/features/data-ingest/parsers/tabular.test.ts` | Parser tests with fixture data | ~300 |

### Parser configurations (from architecture)

| Format | Parser | Configuration |
|--------|--------|---------------|
| CSV | Papa Parse | `preview: 100`, `header: true`, `dynamicTyping: true`, auto-detect delimiter |
| TSV | Papa Parse | `preview: 100`, `header: true`, `dynamicTyping: true`, `delimiter: '\t'` |
| Excel | SheetJS | `XLSX.read(buffer)`, first sheet only, first 100 rows via `sheet_to_json` with `range` option |

### Function signatures

```typescript
function parseTabularPreview(
  buffer: ArrayBuffer,
  fileType: 'csv' | 'tsv' | 'xlsx',
  fileName: string,
  fileSize: number
): PreviewResult

// Internal helpers
function parseCsvPreview(text: string, fileName: string, fileSize: number): PreviewResult
function parseTsvPreview(text: string, fileName: string, fileSize: number): PreviewResult
function parseExcelPreview(buffer: ArrayBuffer, fileName: string, fileSize: number): PreviewResult
```

### Output shape (normalized PreviewResult fields for tabular)

| Field | Value |
|-------|-------|
| `fileType` | `'csv'`, `'tsv'`, or `'xlsx'` |
| `fileName` | Original file name |
| `fileSize` | Total file size in bytes |
| `columns` | Array of `Column` objects with `name` and placeholder `inferredType: 'string'` (inference happens in task 05) |
| `sampleRows` | First N rows as `Record<string, unknown>[]` |
| `sampleRecords` | `null` (sequence types only) |
| `structure` | `null` (JSON type only) |
| `parseErrors` | Any Papa Parse or SheetJS errors |

### Dependencies (npm packages)

| Package | Purpose |
|---------|---------|
| `papaparse` | CSV/TSV parsing |
| `@types/papaparse` | TypeScript types |
| `xlsx` (SheetJS) | Excel parsing |

### Edge cases

- CSV with no header row: Papa Parse detects this; columns become `Column_0`, `Column_1`, etc.
- Excel with multiple sheets: parse first sheet only; note other sheet names in a metadata field
- Buffer contains partial last row (64KB cutoff): Papa Parse handles this gracefully; SheetJS reads complete rows from the parsed workbook
- Delimiter auto-detection for CSV: let Papa Parse handle it; if it detects tab, and fileType is `csv`, still trust Papa Parse's delimiter choice
- Empty columns: include in output with all-null sample values

## Integration Proofs

```bash
# Parses CSV with headers and sample rows
npx vitest run src/features/data-ingest/parsers/tabular.test.ts -t "parses csv with headers"

# Parses TSV with tab delimiter
npx vitest run src/features/data-ingest/parsers/tabular.test.ts -t "parses tsv with tab delimiter"

# Parses Excel first sheet
npx vitest run src/features/data-ingest/parsers/tabular.test.ts -t "parses xlsx first sheet"

# Limits to 100 preview rows
npx vitest run src/features/data-ingest/parsers/tabular.test.ts -t "limits preview to 100 rows"

# Returns parse errors for malformed CSV
npx vitest run src/features/data-ingest/parsers/tabular.test.ts -t "captures parse errors"

# Produces normalized PreviewResult shape
npx vitest run src/features/data-ingest/parsers/tabular.test.ts -t "output matches PreviewResult shape"
```

## Acceptance Criteria

- [ ] `parseTabularPreview` dispatches to correct parser based on `fileType`
- [ ] CSV parser uses Papa Parse with `preview: 100`, `header: true`, `dynamicTyping: true`
- [ ] TSV parser uses Papa Parse with explicit `delimiter: '\t'`
- [ ] Excel parser uses SheetJS `XLSX.read()` on the ArrayBuffer, extracts first sheet, limits to 100 rows
- [ ] All parsers produce the normalized `PreviewResult` shape with `columns` and `sampleRows`
- [ ] Column objects include `name` and `sampleValues` extracted from sample rows
- [ ] Parse errors are captured in `parseErrors` array, not thrown
- [ ] Buffer from type detection is reused (CSV/TSV: decode to string; Excel: pass ArrayBuffer directly)
- [ ] All tests pass: `npx vitest run src/features/data-ingest/parsers/tabular.test.ts`
- [ ] Tests use inline string/buffer fixtures, no external test files

## Anti-Patterns

- Do NOT read the file again -- reuse the 64KB buffer from detection
- Do NOT parse more than 100 rows -- preview is a sample, not the full dataset
- Do NOT run schema inference here -- that is task 05. Columns should have placeholder type `string`
- Do NOT use `readAsText` with a specific encoding assumption -- use `TextDecoder` for proper UTF-8 handling
- Do NOT attempt to parse all Excel sheets -- first sheet only per architecture spec
