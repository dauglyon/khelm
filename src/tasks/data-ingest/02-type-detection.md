# Task 02: File Type Detection Utility

## Summary

Implement a pure utility function that reads the first 64KB of a `File` object and determines the file format using extension matching and magic byte inspection. No UI, no state -- just detection logic.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 01 (ingest-store) | in-domain | `FileType` union type |

## Context

Type detection is the first step after a file is dropped. It must run entirely client-side, never loading the full file into memory. The browser reads `File.slice(0, 65536)` via `FileReader.readAsArrayBuffer()`, then checks extension and magic bytes. Magic bytes take precedence over extension when they disagree.

Architecture reference: `architecture/data-ingest.md` section 2 (File Type Detection).

## Demo Reference (Vignette 3)

> The system detects the type...

Detection happens instantly after drop. The user sees a brief `detecting` status before the type badge appears.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/detectFileType.ts` | Detection function + helpers | ~120 |
| `src/features/data-ingest/detectFileType.test.ts` | Unit tests with fixture data | ~250 |

### Main function signature

```typescript
async function detectFileType(file: File): Promise<DetectionResult>

interface DetectionResult {
  fileType: FileType | null;
  confidence: 'high' | 'medium' | 'low';
  buffer: ArrayBuffer; // The 64KB slice, reused by parsers
  error?: string;
}
```

### Detection strategy (from architecture)

1. Read first 64KB: `file.slice(0, 65536)` via `FileReader.readAsArrayBuffer()`
2. Check file extension against supported extensions table
3. Check magic bytes from the buffer's first 4-8 bytes
4. Resolve conflicts: magic bytes take precedence over extension
5. Reject unknown: return `null` fileType if neither matches

### Magic byte signatures

| Format | Bytes (hex) | Offset |
|--------|------------|--------|
| Excel XLSX | `50 4B 03 04` | 0 |
| Excel XLS | `D0 CF 11 E0` | 0 |
| FASTA | `3E` (`>`) | first non-whitespace byte |
| FASTQ | `40` (`@`) | first non-whitespace byte |
| JSON | `7B` (`{`) or `5B` (`[`) | first non-whitespace byte |
| CSV/TSV | No signature | extension only; if no extension, try Papa Parse auto-detect |

### Extension map

| Extensions | FileType |
|-----------|----------|
| `.csv` | `csv` |
| `.tsv`, `.tab` | `tsv` |
| `.fasta`, `.fa`, `.fna`, `.faa` | `fasta` |
| `.fastq`, `.fq` | `fastq` |
| `.json` | `json` |
| `.xlsx`, `.xls` | `xlsx` |

### Edge cases

- File with no extension: rely on magic bytes only
- Extension says CSV but magic bytes say JSON: trust magic bytes, return `json`
- Extension says `.fasta` but first char is `@`: trust magic bytes, return `fastq`
- Empty file (0 bytes): return error, do not attempt detection
- File smaller than 64KB: read entire file (slice handles this naturally)

## Integration Proofs

```bash
# Detects CSV by extension
npx vitest run src/features/data-ingest/detectFileType.test.ts -t "detects csv by extension"

# Detects XLSX by magic bytes
npx vitest run src/features/data-ingest/detectFileType.test.ts -t "detects xlsx by magic bytes PK header"

# Magic bytes override extension mismatch
npx vitest run src/features/data-ingest/detectFileType.test.ts -t "magic bytes override conflicting extension"

# Returns null for unsupported type
npx vitest run src/features/data-ingest/detectFileType.test.ts -t "returns null for unsupported file type"

# Handles empty file
npx vitest run src/features/data-ingest/detectFileType.test.ts -t "returns error for empty file"

# Returns the 64KB buffer for downstream parsers
npx vitest run src/features/data-ingest/detectFileType.test.ts -t "returns buffer for reuse by parsers"
```

## Acceptance Criteria

- [ ] `detectFileType` is a pure async function, no side effects, no store interaction
- [ ] Reads at most 64KB from the File object (`File.slice(0, 65536)`)
- [ ] Correctly maps all extensions from the supported file types table
- [ ] Checks magic bytes for XLSX, XLS, FASTA, FASTQ, JSON
- [ ] Magic bytes take precedence over extension on conflict
- [ ] Returns `null` fileType for unrecognized formats with descriptive error
- [ ] Returns error for empty files (0 bytes)
- [ ] Returns the `ArrayBuffer` slice for reuse by downstream parsers (avoid re-reading)
- [ ] Does NOT rely on `File.type` (MIME) for detection -- per architecture constraint
- [ ] All tests pass: `npx vitest run src/features/data-ingest/detectFileType.test.ts`
- [ ] Tests use synthetic `File` objects (no filesystem access needed)

## Anti-Patterns

- Do NOT use `File.type` (MIME type) -- it is inconsistent across operating systems (macOS reports CSV as `text/plain`, Windows as `application/vnd.ms-excel`)
- Do NOT read the full file -- only the first 64KB slice
- Do NOT import Papa Parse here -- that belongs in the parser tasks (03/04). Detection uses only magic bytes and extensions.
- Do NOT store results in the ingest store from this function -- the pipeline orchestrator (task 11) handles that
- Do NOT use `FileReader.readAsText()` -- use `readAsArrayBuffer()` for consistent binary access
