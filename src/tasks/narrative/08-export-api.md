# Task 08: Export API Integration

## Dependencies

| Dependency | Domain | What's Needed |
|------------|--------|---------------|
| 01-narrative-store | narrative | `useCompositionPayload`, `exportNarrative` action |
| 07-narrative-preview | narrative | Preview functional; Export button slot to wire |
| API stubs pattern | app-shell | Orval + MSW setup pattern for API types and mocks |

## Context

The export feature sends the composed narrative (ordered card IDs + connective texts) to the backend, which generates a shareable artifact. The API is potentially async -- it may return a 202 with a poll URL for long exports. This task generates the API types (ideally via Orval from an OpenAPI spec fragment), creates MSW handlers for development/testing, and wires the export flow into the composition panel and preview modal.

## Implementation Requirements

### Files to Create

1. **`src/features/narrative/narrativeApi.ts`** (~100 lines)
2. **`src/mocks/handlers/narrativeHandlers.ts`** (~100 lines)

### API Endpoints

From the architecture spec:

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/narratives/export` | POST | `{ sessionId: string; orderedCardIds: string[]; connectiveTexts: Record<string, string>; format?: string }` | `{ narrativeId: string; downloadUrl: string }` or `202` with `{ narrativeId: string; statusUrl: string }` |
| `/api/narratives/{id}` | GET | -- | Full narrative artifact |
| `/api/narratives/{id}/status` | GET | -- | `{ status: 'pending' \| 'processing' \| 'complete' \| 'error'; progress?: number; downloadUrl?: string }` |

### TypeScript Types

```ts
interface ExportNarrativeRequest {
  sessionId: string;
  orderedCardIds: string[];
  connectiveTexts: Record<string, string>;
  format?: string;
}

interface ExportNarrativeResponse {
  narrativeId: string;
  downloadUrl: string;
}

interface ExportNarrativeAccepted {
  narrativeId: string;
  statusUrl: string;
}

interface NarrativeStatus {
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress?: number;
  downloadUrl?: string;
  error?: string;
}
```

### API Functions

| Function | Behavior |
|----------|----------|
| `exportNarrative(payload)` | POST to `/api/narratives/export`. If 200, return `ExportNarrativeResponse`. If 202, begin polling `statusUrl`. |
| `pollNarrativeStatus(id)` | GET `/api/narratives/{id}/status`. Returns `NarrativeStatus`. |
| `getNarrative(id)` | GET `/api/narratives/{id}`. Returns full artifact. |

### Export Flow

```
User clicks "Export"
  -> Show loading state on Export button
  -> POST /api/narratives/export
  -> If 200: open download URL
  -> If 202: poll /api/narratives/{id}/status every 2s
    -> Show progress in UI (if progress field present)
    -> On 'complete': open downloadUrl
    -> On 'error': show error message
  -> On network error: show error toast/message
```

### TanStack Query Integration

Use TanStack Query mutations and queries:

| Hook | Type | Purpose |
|------|------|---------|
| `useExportNarrative` | `useMutation` | Triggers the export POST |
| `useNarrativeStatus` | `useQuery` | Polls status endpoint (enabled only when narrativeId is set and status is not terminal) |

### MSW Handlers

Create mock handlers for development and testing:

| Handler | Behavior |
|---------|----------|
| `POST /api/narratives/export` | Returns 200 with `{ narrativeId, downloadUrl }` (immediate success mock) |
| `GET /api/narratives/:id/status` | Returns `{ status: 'complete', downloadUrl }` |
| `GET /api/narratives/:id` | Returns a mock narrative object |

Include a variant handler that returns 202 for testing the async polling flow.

### Wiring

- Wire `useExportNarrative` to the Export button in `CompositionPanel` header
- Wire `useExportNarrative` to the Export button in `NarrativePreview` header
- Show loading spinner on Export button while mutation is pending
- Show error state if export fails

### Store Action

Add `exportNarrative` action to the narrative store (or handle entirely via TanStack Query mutation -- the store tracks `previewOpen` and composition state, but export state can live in the mutation).

## Demo Reference

Vignette 5: the user clicks "Export" and the system generates a downloadable narrative artifact.

## Integration Proofs

```bash
# API types and handlers compile
npx vitest run src/features/narrative/narrativeApi.test.ts

# MSW handlers work in test environment
npx vitest run src/mocks/handlers/narrativeHandlers.test.ts

# Tests verify:
# 1. exportNarrative sends correct payload to POST endpoint
# 2. Successful 200 response returns downloadUrl
# 3. 202 response triggers polling
# 4. Polling resolves when status is 'complete'
# 5. Network error produces error state
# 6. Export button shows loading state during mutation
# 7. MSW handlers return expected mock data
```

### Test Files

Create **`src/features/narrative/narrativeApi.test.ts`** (~80 lines) with:
- Export mutation sends correct request payload
- Handles 200 response (immediate success)
- Handles 202 response (async with polling)
- Handles error response
- Polling stops when status reaches terminal state

Create **`src/mocks/handlers/narrativeHandlers.test.ts`** (~40 lines) with:
- MSW POST handler returns expected shape
- MSW GET status handler returns expected shape

## Acceptance Criteria

- [ ] `ExportNarrativeRequest` and response types are defined and exported
- [ ] `useExportNarrative` mutation sends POST with `{ sessionId, orderedCardIds, connectiveTexts }`
- [ ] 200 response opens the download URL
- [ ] 202 response triggers polling of the status endpoint
- [ ] Polling stops when status is `complete` or `error`
- [ ] Export button shows loading state while mutation is pending
- [ ] Error state displayed on export failure
- [ ] MSW handlers mock all three narrative API endpoints
- [ ] MSW handlers return correctly shaped response data
- [ ] Export button in both `CompositionPanel` and `NarrativePreview` triggers the mutation
- [ ] All tests pass

## Anti-Patterns

- Do NOT implement the actual backend export logic. This is frontend API integration with mocked endpoints.
- Do NOT use `setInterval` directly for polling. Use TanStack Query's `refetchInterval` option on the status query, conditionally enabled.
- Do NOT store export results in the narrative Zustand store. Use TanStack Query's cache for server state.
- Do NOT block the UI during export. The export is async; the user should be able to continue working.
- Do NOT hardcode API base URLs. Use the existing API configuration pattern from the app-shell.
- Do NOT skip error handling. Network failures, 4xx, and 5xx responses must produce user-visible feedback.
