# Task 09: Upload Manager (Uppy + tus)

## Summary

Implement the upload manager that wraps Uppy with the `@uppy/tus` plugin to handle resumable file uploads. The manager creates Uppy instances, configures tus, tracks progress, and syncs upload state back to the ingest store.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 01 (ingest-store) | in-domain | `useIngestStore` actions: `setStatus`, `setUploadProgress`, `setError` |

## Context

Scientific data files can be multi-GB. Network reliability varies at field stations and institutional networks. tus (resumable upload protocol) ensures uploads survive network interruptions. Uppy orchestrates the upload lifecycle with retry logic, progress tracking, and React integration.

Architecture reference: `architecture/data-ingest.md` section 6 (Resumable Upload).

## Demo Reference (Vignette 3)

> The ingested data is immediately queryable.

After preview, the user clicks "Upload". The file uploads in the background with progress UI. On completion, the data becomes available for querying.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/uploadManager.ts` | Upload manager module | ~180 |
| `src/features/data-ingest/uploadManager.test.ts` | Unit tests with mocked Uppy | ~250 |

### Architecture (from spec)

| Component | Role |
|-----------|------|
| Uppy (client) | Orchestrates file lifecycle, retry logic, progress tracking |
| `@uppy/tus` plugin | Wraps `tus-js-client`, manages chunked resumable upload |
| tusd (server) | Reference tus server; not implemented here -- mocked in tests |

### Upload manager API

```typescript
interface UploadManager {
  startUpload(fileId: string, file: File, metadata: UploadMetadata): void;
  pauseUpload(fileId: string): void;
  resumeUpload(fileId: string): void;
  cancelUpload(fileId: string): void;
  getUppy(): Uppy; // For progress UI hooks if needed
}

interface UploadMetadata {
  fileName: string;
  fileType: FileType;
  schema?: Column[];
}

function createUploadManager(tusEndpoint: string): UploadManager;
```

### Uppy configuration

| Setting | Value |
|---------|-------|
| Plugin | `@uppy/tus` |
| Chunk size | 5 MB default (configurable) |
| Retry count | 3 with exponential backoff |
| Endpoint | Configurable tus server URL |
| Metadata | File name, detected type, inferred schema as tus metadata headers |

### tus behavior (from architecture)

| Aspect | Detail |
|--------|--------|
| Protocol | tus v1 (resumable, chunked) |
| Chunk size | 5 MB default |
| Retry | Exponential backoff; respects HTTP 429 |
| Resume | On network recovery, resumes from last confirmed byte offset |
| Parallelism | One upload per file; multiple files upload concurrently |
| Progress | Per-file: bytes uploaded, total bytes, percentage, estimated time remaining |
| Abort | User can cancel; partial upload cleaned up |
| Metadata | File name, detected type, inferred schema sent as tus metadata headers |

### State synchronization

The upload manager syncs Uppy events back to the ingest store:

| Uppy Event | Store Action |
|------------|-------------|
| `upload-progress` | `setUploadProgress(fileId, loaded, total)` |
| `upload-success` | `setStatus(fileId, 'complete')` |
| `upload-error` | `setError(fileId, error.message)` |
| `upload-retry` | `setStatus(fileId, 'uploading')` |
| `pause-all` / `resume-all` | `setStatus(fileId, 'paused')` / `setStatus(fileId, 'uploading')` |

### Singleton pattern

One `UploadManager` instance per app session. Multiple files upload concurrently through the same Uppy instance.

### Dependencies (npm packages)

| Package | Purpose |
|---------|---------|
| `@uppy/core` | Uppy core |
| `@uppy/tus` | tus plugin |

## Integration Proofs

```bash
# Creates upload manager with tus endpoint
npx vitest run src/features/data-ingest/uploadManager.test.ts -t "creates upload manager with endpoint"

# Starts upload and reports progress
npx vitest run src/features/data-ingest/uploadManager.test.ts -t "reports upload progress to store"

# Handles upload success
npx vitest run src/features/data-ingest/uploadManager.test.ts -t "sets status complete on success"

# Handles upload error
npx vitest run src/features/data-ingest/uploadManager.test.ts -t "sets error on upload failure"

# Pause and resume
npx vitest run src/features/data-ingest/uploadManager.test.ts -t "pause sets status to paused"
npx vitest run src/features/data-ingest/uploadManager.test.ts -t "resume sets status to uploading"

# Cancel cleans up
npx vitest run src/features/data-ingest/uploadManager.test.ts -t "cancel removes file from uppy"

# Sends metadata with upload
npx vitest run src/features/data-ingest/uploadManager.test.ts -t "sends file metadata as tus headers"
```

## Acceptance Criteria

- [ ] `createUploadManager` returns an `UploadManager` with `startUpload`, `pauseUpload`, `resumeUpload`, `cancelUpload`
- [ ] Uses `@uppy/tus` plugin configured with the provided endpoint
- [ ] Chunk size defaults to 5 MB
- [ ] Retry logic uses exponential backoff (3 retries)
- [ ] `startUpload` adds the file to Uppy and triggers upload
- [ ] Upload progress syncs to ingest store via `setUploadProgress`
- [ ] Upload success syncs to ingest store via `setStatus('complete')`
- [ ] Upload error syncs to ingest store via `setError`
- [ ] Pause/resume correctly toggle between `paused` and `uploading` status
- [ ] Cancel removes the file from Uppy and does not trigger error
- [ ] File name, detected type, and schema sent as tus metadata
- [ ] Multiple concurrent uploads supported through single Uppy instance
- [ ] All tests pass: `npx vitest run src/features/data-ingest/uploadManager.test.ts`
- [ ] Tests mock Uppy -- no real HTTP requests

## Anti-Patterns

- Do NOT create a new Uppy instance per file -- use one instance with multiple files
- Do NOT put Uppy in React state -- the upload manager is a plain module, not a hook
- Do NOT use `@uppy/dashboard` or `@uppy/drag-drop` -- UI is custom (tasks 07/08/10)
- Do NOT implement retry logic manually -- Uppy/tus handle this
- Do NOT store upload progress in Uppy's state -- sync to the ingest Zustand store so React components can subscribe
- Do NOT block the main thread during upload -- Uppy handles this asynchronously
