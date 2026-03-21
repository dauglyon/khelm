# Task 01: Card Types and Data Model

## Dependencies

- **design-system**: `InputType` enum from `src/theme/` (maps to `CardType`)
- No runtime dependencies; this task is pure TypeScript types and constants

## Context

The card data model is the foundation for the entire card domain. Every other task imports from this file. The types must precisely match the architecture spec in `architecture/card.md` -- field names, optionality, and shape constraints are authoritative.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/types.ts`** (~120 lines)

### Type Definitions

Define the following types and enums:

```
CardType = 'sql' | 'python' | 'literature' | 'hypothesis' | 'note' | 'data_ingest'
CardStatus = 'thinking' | 'running' | 'complete' | 'error'
```

**Card record** -- all fields per architecture/card.md Data Model table:
- `id`, `shortname`, `type`, `status`, `content`, `result`, `error`, `references`, `createdAt`, `updatedAt`, `createdBy`, `lockedBy`, `sessionId`

**Content shapes** (discriminated union on `type`):
- `SqlContent`: `{ query: string; dataSource: string }`
- `PythonContent`: `{ code: string; language: 'python' }`
- `LiteratureContent`: `{ searchTerms: string[]; filters?: LitFilters }`
- `HypothesisContent`: `{ claim: string; evidence?: string; domain?: string }`
- `NoteContent`: `{ text: string }`
- `DataIngestContent`: `{ fileName: string; fileSize: number; mimeType: string }`

**Result shapes** (discriminated union on `type`):
- `SqlResult`: `{ columns: Column[]; rows: Row[]; rowCount: number; truncated: boolean }`
- `PythonResult`: `{ stdout: string; stderr: string; returnValue: any; figures: Figure[] }`
- `LiteratureResult`: `{ hits: Publication[]; totalCount: number }`
- `HypothesisResult`: `{ analysis: string; suggestedQueries: SuggestedQuery[]; confidence?: number }`
- `NoteResult`: `null`
- `DataIngestResult`: `{ schema: SchemaField[]; sampleRows: Row[]; totalRows: number; uploadId: string }`

**Supporting types**: `Column`, `Row`, `Figure`, `Publication`, `SuggestedQuery`, `SchemaField`, `LitFilters`

**Chat message shape** (per architecture/card.md Inline Chat Panel > Message Shape):
- `Message`: `{ id, role, content, toolCall, timestamp, status }`
- `MessageRole = 'user' | 'assistant' | 'system'`
- `MessageStatus = 'pending' | 'streaming' | 'complete' | 'error' | 'aborted'`

**Error shape**: `{ code: string; message: string }`

### Constraints

- Export a `CARD_TYPES` constant array for iteration
- Export a `CARD_STATUSES` constant array for iteration
- All types use `interface` (not `type`) where possible for better error messages
- `CardContent` is a discriminated union using a mapped type keyed by `CardType`
- `CardResult` is a discriminated union using a mapped type keyed by `CardType`
- No runtime code beyond const arrays -- this file is purely types + constants

## Demo Reference

**Vignette 1**: A SQL card with `status: 'complete'` has `content: SqlContent` and `result: SqlResult`. TypeScript enforces that `result.columns` exists.

**Vignette 2**: A Note card always has `result: null`. TypeScript rejects `result.analysis` on a Note card.

## Integration Proofs

1. **Type compilation**: `npx tsc --noEmit src/features/cards/types.ts` exits 0
2. **Type safety test**: Create a test file that assigns incorrect result shapes to card types and verify `tsc` reports errors (expect-error comments)
3. **Import test**: A separate file imports all exported types and the const arrays; compiles without error

## Acceptance Criteria

- [ ] `CardType` enum has exactly 6 values matching architecture spec
- [ ] `CardStatus` enum has exactly 4 values matching architecture spec
- [ ] Card record interface has all 12 fields from the Data Model table
- [ ] Content shapes match the Content and Result Shapes table for all 6 types
- [ ] Result shapes match the Content and Result Shapes table for all 6 types
- [ ] `Message` interface matches the Message Shape table (6 fields)
- [ ] `CARD_TYPES` and `CARD_STATUSES` const arrays are exported
- [ ] No runtime imports (file is types + constants only)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Type discrimination test verifies incorrect assignments are caught

## Anti-Patterns

- Do not use `any` for content/result -- use proper discriminated unions
- Do not couple types to rendering logic or store actions
- Do not import from other feature directories -- this is the leaf dependency
- Do not use string literal types inline; define the enum union once and reference it
- Do not make optional fields required or vice versa -- match the spec exactly
