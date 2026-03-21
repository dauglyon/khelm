# Task 04: Sequence and JSON Parsers (FASTA, FASTQ, JSON)

## Summary

Implement preview parsers for FASTA, FASTQ, and JSON formats that operate on the 64KB buffer from type detection. FASTA/FASTQ use custom parsers; JSON uses native `JSON.parse` with truncation handling. All produce the normalized `PreviewResult` shape.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 01 (ingest-store) | in-domain | `PreviewResult`, `SequenceRecord`, `ParseError` types |
| 02 (type-detection) | in-domain | `DetectionResult` with `buffer` and `fileType` |

## Context

FASTA and FASTQ are bioinformatics sequence formats common in DOE BER research. They have simple line-based structures but can be multi-GB. JSON files may contain structured data objects or arrays. All parsing operates on the 64KB slice only.

Architecture reference: `architecture/data-ingest.md` sections 3 (Schema Preview) and the Supported File Types table.

## Demo Reference (Vignette 3)

> The system detects the type, infers the schema, creates a preview card.

For sequence files, the preview shows record count, average length, and first 3 records. For JSON, it shows structure shape and sample entries.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/parsers/sequenceJson.ts` | FASTA, FASTQ, JSON parsers | ~200 |
| `src/features/data-ingest/parsers/sequenceJson.test.ts` | Parser tests with fixture data | ~300 |

### FASTA parser

FASTA format: lines starting with `>` are headers; subsequent lines until the next `>` are the sequence.

```
>sequence_1 description
ATCGATCGATCG
ATCGATCG
>sequence_2 description
GCTAGCTAGCTA
```

| Config | Value |
|--------|-------|
| Parse limit | 10 sequences or buffer exhausted |
| Extract | Headers (without `>`), sequence lengths |
| Preview content | Sequence count (in sample), avg length, first 3 full records |

### FASTQ parser

FASTQ format: 4-line records: `@header`, sequence, `+`, quality scores.

```
@read_1
ATCGATCG
+
IIIIIIII
```

| Config | Value |
|--------|-------|
| Parse limit | 10 records or buffer exhausted |
| Extract | Headers (without `@`), sequence lengths, quality scores |
| Preview content | Record count (in sample), avg length, quality summary, first 3 records |

### JSON parser

| Config | Value |
|--------|-------|
| Strategy | `JSON.parse` on the 64KB slice; if truncated, parse up to last complete `}` or `]` |
| Extract | Top-level shape (object or array), key names (object) or element count (array) |
| Preview content | Structure shape, key listing, sample entries |

### Function signatures

```typescript
function parseFastaPreview(text: string, fileName: string, fileSize: number): PreviewResult
function parseFastqPreview(text: string, fileName: string, fileSize: number): PreviewResult
function parseJsonPreview(text: string, fileName: string, fileSize: number): PreviewResult

// Dispatcher
function parseSequenceJsonPreview(
  buffer: ArrayBuffer,
  fileType: 'fasta' | 'fastq' | 'json',
  fileName: string,
  fileSize: number
): PreviewResult
```

### Output shape (PreviewResult for these types)

| Field | FASTA/FASTQ | JSON |
|-------|------------|------|
| `fileType` | `'fasta'` or `'fastq'` | `'json'` |
| `columns` | `null` | `null` (unless array of objects -- then extract keys as columns) |
| `sampleRows` | `null` | Sample entries if array of objects |
| `sampleRecords` | `SequenceRecord[]` | `null` |
| `structure` | `null` | `{ shape: 'object' | 'array'; keys?: string[]; elementCount?: number }` |

### SequenceRecord shape

```typescript
interface SequenceRecord {
  header: string;      // Header line content (without > or @)
  sequence: string;    // Full sequence text
  length: number;      // Sequence length in characters
  quality?: string;    // Quality scores (FASTQ only)
}
```

### Edge cases

- FASTA with multi-line sequences: concatenate lines between headers
- FASTQ with quality scores shorter than sequence: record as parse error
- JSON truncated mid-string: strip back to last complete JSON value
- JSON that is a single primitive (number, string, boolean): report as `shape: 'primitive'`
- Buffer ends mid-sequence in FASTA/FASTQ: include partial last record with a note

## Integration Proofs

```bash
# Parses FASTA with multiple sequences
npx vitest run src/features/data-ingest/parsers/sequenceJson.test.ts -t "parses fasta with multiple sequences"

# Parses FASTQ with quality scores
npx vitest run src/features/data-ingest/parsers/sequenceJson.test.ts -t "parses fastq with quality scores"

# Handles truncated JSON gracefully
npx vitest run src/features/data-ingest/parsers/sequenceJson.test.ts -t "handles truncated json"

# FASTA limits to 10 sequences
npx vitest run src/features/data-ingest/parsers/sequenceJson.test.ts -t "fasta limits to 10 sequences"

# JSON array-of-objects extracts keys as columns
npx vitest run src/features/data-ingest/parsers/sequenceJson.test.ts -t "json array of objects extracts keys"

# Produces normalized PreviewResult shape
npx vitest run src/features/data-ingest/parsers/sequenceJson.test.ts -t "output matches PreviewResult shape"
```

## Acceptance Criteria

- [ ] FASTA parser correctly splits records on `>` headers and concatenates multi-line sequences
- [ ] FASTQ parser reads 4-line records: header, sequence, `+` separator, quality
- [ ] Both sequence parsers limit to 10 records maximum from the 64KB buffer
- [ ] SequenceRecord includes `header`, `sequence`, `length`, and optionally `quality`
- [ ] JSON parser handles truncated buffers by finding last complete JSON value
- [ ] JSON parser reports top-level shape (object, array, primitive)
- [ ] JSON array-of-objects: extracts keys as pseudo-columns and first entries as sample rows
- [ ] All parsers produce the normalized `PreviewResult` shape
- [ ] Parse errors are captured in `parseErrors`, not thrown
- [ ] All tests pass: `npx vitest run src/features/data-ingest/parsers/sequenceJson.test.ts`
- [ ] Tests use inline string fixtures representing realistic bioinformatics data

## Anti-Patterns

- Do NOT attempt to parse the full file -- only the 64KB buffer
- Do NOT use external FASTA/FASTQ parsing libraries -- the format is simple enough for a custom ~50-line parser
- Do NOT silently swallow parse errors -- always populate `parseErrors`
- Do NOT return raw unparsed text as the preview -- structure it into the `PreviewResult` shape
