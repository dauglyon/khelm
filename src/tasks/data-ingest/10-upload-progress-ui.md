# Task 10: Upload Progress UI

## Summary

Implement the upload progress UI that renders inside preview card footers during upload. Shows a progress bar, upload speed, estimated time remaining, and pause/resume toggle. Also provides a global upload indicator for the app shell toolbar.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 07 (preview-card-tabular) | in-domain | Card footer integration point |
| 08 (preview-card-seq-json) | in-domain | Card footer integration point |
| 09 (upload-manager) | in-domain | `pauseUpload`, `resumeUpload`, `cancelUpload` actions |
| design-system | cross-domain | Button, Spinner, theme tokens, animation utilities |

## Context

During upload, the preview card footer transforms from "Upload/Cancel" buttons to a progress display. The user sees real-time progress and can pause, resume, or cancel. A global indicator in the toolbar shows aggregate upload status.

Architecture reference: `architecture/data-ingest.md` section 6 (Progress UI) and section 5 (Card Status Lifecycle).

## Demo Reference (Vignette 3)

The upload progress is visible in the preview card while the file transfers. The user can continue working with other cards while uploads proceed in the background.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/UploadProgress.tsx` | Progress bar component for card footer | ~120 |
| `src/features/data-ingest/UploadProgressGlobal.tsx` | Global toolbar indicator | ~60 |
| `src/features/data-ingest/UploadProgress.test.tsx` | Tests for both components | ~200 |

### Card footer progress (replaces Upload/Cancel buttons during upload)

| Element | Content |
|---------|---------|
| Progress bar | Filled bar showing `loaded / total` as percentage |
| Percentage | Text: `XX%` |
| Speed | Current upload speed (e.g., "12.4 MB/s") |
| Time remaining | Estimated time to completion (e.g., "~2m 30s") |
| Pause/Resume button | Toggle: Pause icon when uploading, Play icon when paused |
| Cancel button | Stops upload, removes file |

### Progress calculation

```typescript
interface ProgressDisplay {
  percentage: number;           // loaded / total * 100
  speed: string;                // formatted bytes/sec
  timeRemaining: string;        // formatted duration
  status: 'uploading' | 'paused' | 'complete' | 'error';
}
```

Speed calculation: track bytes uploaded over a rolling 3-second window. Time remaining: `(total - loaded) / speed`.

### Card status lifecycle visuals

| Status | Visual in footer |
|--------|-----------------|
| `uploading` | Progress bar animating, speed + time shown, Pause button |
| `paused` | Progress bar frozen, "Paused" label, Resume button |
| `complete` | Success checkmark, "Upload complete" text |
| `error` | Error message, "Retry" button |

### Global toolbar indicator

| Element | Content |
|---------|---------|
| Icon | Upload icon with badge showing count of active uploads |
| Tooltip | "N files uploading (XX% overall)" |
| Visibility | Only visible when `activeUploads > 0` |

Reads from `useActiveUploadCount()` selector and aggregates progress across all uploading files.

### Formatting utilities

| Function | Input | Output |
|----------|-------|--------|
| `formatBytes(bytes)` | `1048576` | `"1.0 MB"` |
| `formatSpeed(bytesPerSec)` | `13000000` | `"12.4 MB/s"` |
| `formatDuration(seconds)` | `150` | `"~2m 30s"` |
| `formatFileSize(bytes)` | `1073741824` | `"1.0 GB"` |

## Integration Proofs

```bash
# Renders progress bar with percentage
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "renders progress bar with percentage"

# Shows upload speed
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "displays upload speed"

# Shows time remaining
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "displays time remaining"

# Pause button calls pauseUpload
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "pause button triggers pause"

# Resume button calls resumeUpload
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "resume button triggers resume"

# Shows complete state
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "shows complete state with checkmark"

# Shows error state with retry
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "shows error state with retry button"

# Global indicator shows active count
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "global indicator shows active upload count"

# Global indicator hidden when no uploads
npx vitest run src/features/data-ingest/UploadProgress.test.tsx -t "global indicator hidden when no uploads"
```

## Acceptance Criteria

- [ ] `UploadProgress` reads from `useIngestFile(id)` for per-file progress
- [ ] Progress bar width tracks `loaded / total` percentage
- [ ] Upload speed calculated from rolling window, formatted as human-readable
- [ ] Time remaining calculated and formatted (e.g., "~2m 30s")
- [ ] Pause button visible during `uploading` status, calls `pauseUpload`
- [ ] Resume button visible during `paused` status, calls `resumeUpload`
- [ ] Complete state shows success checkmark
- [ ] Error state shows error message and Retry button
- [ ] Cancel button available in all pre-complete states
- [ ] `UploadProgressGlobal` reads from `useActiveUploadCount()` selector
- [ ] Global indicator only renders when `activeUploads > 0`
- [ ] All formatting utilities handle edge cases (0 bytes, very large files, 0 speed)
- [ ] All colors/icons from design system tokens
- [ ] All tests pass: `npx vitest run src/features/data-ingest/UploadProgress.test.tsx`

## Anti-Patterns

- Do NOT poll for progress -- subscribe to the Zustand store selector, which is updated by the upload manager's Uppy event handlers
- Do NOT calculate speed from single data points -- use a rolling window to smooth fluctuations
- Do NOT show raw byte counts to users -- always format as human-readable (KB, MB, GB)
- Do NOT render the global indicator as a modal or overlay -- it is a small toolbar badge
- Do NOT put upload control logic (Uppy calls) directly in the component -- call through the upload manager API
