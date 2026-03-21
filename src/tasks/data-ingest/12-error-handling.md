# Task 12: Error Handling and Edge Cases

## Summary

Implement comprehensive error handling for the ingest pipeline: unsupported file types, parse failures, empty files, upload errors, file size limits, and duplicate file detection. Each error state renders a distinct error card with actionable user guidance.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 06 (workspace-drop-zone) | in-domain | Rejection handler for oversized/wrong-type files |
| 11 (pipeline-orchestration) | in-domain | Error paths in the pipeline |
| 01 (ingest-store) | in-domain | `setError` action, error state in `IngestFile` |
| design-system | cross-domain | Error status color (`#C53030`), Button (Retry), Card primitive |

## Context

Error handling spans the full pipeline -- from drop rejection to upload failure. Each error type has a specific user-facing message and recovery action defined in the architecture spec. Error cards must be visually distinct and actionable.

Architecture reference: `architecture/data-ingest.md` section 8 (Error Handling).

## Demo Reference (Vignette 3)

Error handling ensures the "happy path" demo works smoothly -- but also that users get clear feedback when things go wrong (wrong file type, network failure, empty file).

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/IngestErrorCard.tsx` | Error card component | ~120 |
| `src/features/data-ingest/errorHandling.test.ts` | Error scenario tests | ~300 |

### Error types (from architecture)

| Error | Cause | User-Facing Message | Recovery Action |
|-------|-------|---------------------|-----------------|
| Unsupported file type | Extension and magic bytes don't match supported formats | "Unsupported file type. Supported: CSV, TSV, FASTA, FASTQ, JSON, Excel." | Dismiss card |
| Parse failure | 64KB slice cannot be parsed by detected format's parser | Raw preview of first 20 lines; "Check file integrity" suggestion | Dismiss or retry |
| Empty file | File size is 0 bytes | "File is empty." | Dismiss card |
| Upload network error | Connection lost during tus upload | Card moves to `paused`; auto-resumes when connection returns | Automatic resume, manual retry |
| Upload server error | tusd returns 5xx | Error message with "Retry" button; exponential backoff on auto-retry | Retry button |
| File too large | Exceeds configured max file size | Immediate rejection at drop with size limit message | Dismiss; re-drop smaller file |
| Duplicate file | Same file name + size already in workspace | Warning prompt: "A file with this name already exists. Replace or rename?" | Replace, rename, or cancel |

### IngestErrorCard component

Renders when `IngestFile.status === 'error'`. Replaces the preview card body.

```
IngestErrorCard
  ErrorIcon (status.error color)
  ErrorMessage (from IngestFile.error)
  ErrorSuggestion (contextual help text)
  ActionButtons
    RetryButton (if retryable)
    DismissButton (always)
```

### Error classification

```typescript
interface IngestError {
  code: 'UNSUPPORTED_TYPE' | 'PARSE_FAILURE' | 'EMPTY_FILE' | 'UPLOAD_NETWORK' | 'UPLOAD_SERVER' | 'FILE_TOO_LARGE' | 'DUPLICATE_FILE';
  message: string;
  suggestion?: string;
  retryable: boolean;
  rawPreview?: string; // First 20 lines for parse failures
}
```

### Duplicate file detection

Check on drop (in the drop handler or pipeline start):
1. Compare `file.name` and `file.size` against all existing `IngestFile` entries
2. If match found, show a confirmation dialog (not a card) with three options:
   - **Replace**: remove old file/card, process new file
   - **Rename**: append `(2)` to file name, process as new
   - **Cancel**: discard the dropped file

### Parse failure raw preview

When the parser fails, show the first 20 lines of the raw file as a monospace text block. This helps users identify corruption or format issues.

```typescript
function getRawPreview(buffer: ArrayBuffer, maxLines: number = 20): string {
  const text = new TextDecoder().decode(buffer);
  const lines = text.split('\n').slice(0, maxLines);
  return lines.join('\n');
}
```

### Network error auto-resume

Upload network errors (`UPLOAD_NETWORK`) should:
1. Immediately set status to `paused`
2. Listen for `navigator.onLine` events
3. When connection returns, automatically call `resumeUpload`
4. Show "Connection lost. Will resume automatically." message

### Retry behavior

| Error type | Retry behavior |
|-----------|---------------|
| Parse failure | Re-run detection and parsing from scratch |
| Upload server error | Re-attempt tus upload from last byte offset (Uppy handles this) |
| Upload network error | Automatic resume via tus protocol |
| Unsupported type | Not retryable |
| Empty file | Not retryable |
| File too large | Not retryable |

## Integration Proofs

```bash
# Unsupported file type shows correct error message
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "unsupported type shows error card"

# Empty file shows error card
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "empty file shows error card"

# Parse failure shows raw preview
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "parse failure shows raw preview"

# File too large rejected at drop
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "file too large rejected at drop"

# Duplicate file shows confirmation
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "duplicate file shows replace rename cancel"

# Upload network error sets paused status
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "network error sets paused status"

# Upload server error shows retry button
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "server error shows retry button"

# Retry re-runs pipeline
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "retry re-runs pipeline from detection"

# Dismiss removes card and file
npx vitest run src/features/data-ingest/errorHandling.test.ts -t "dismiss removes card and file"
```

## Acceptance Criteria

- [ ] `IngestErrorCard` renders for all error types with distinct messages
- [ ] Error messages match the architecture spec exactly
- [ ] Unsupported type error lists all supported formats
- [ ] Parse failure shows raw preview of first 20 lines in monospace
- [ ] Empty file detected before pipeline starts (check `file.size === 0`)
- [ ] File too large rejected at drop zone level (react-dropzone `maxSize`)
- [ ] Duplicate file detection compares name + size against existing ingest files
- [ ] Duplicate confirmation offers Replace, Rename, and Cancel options
- [ ] Upload network error auto-pauses and auto-resumes on reconnect
- [ ] Upload server error shows Retry button with exponential backoff
- [ ] Retry button re-runs the pipeline for parse failures
- [ ] Dismiss button removes both the ingest file and the workspace card
- [ ] Error states use `color.status.error` token for visual treatment
- [ ] All tests pass: `npx vitest run src/features/data-ingest/errorHandling.test.ts`

## Anti-Patterns

- Do NOT show technical error messages (stack traces, HTTP status codes) to users -- translate to human-readable messages
- Do NOT auto-dismiss error cards -- the user must explicitly dismiss or retry
- Do NOT retry unsupported type or empty file errors -- they are not transient
- Do NOT block other file processing when one file errors -- errors are per-file
- Do NOT silently skip duplicate files -- always ask the user
- Do NOT use `window.alert` or `window.confirm` for the duplicate dialog -- use a proper modal/dialog component from the design system
