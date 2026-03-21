# Card Domain Spec

This spec defines the card data model, type-specific rendering, status lifecycle, streaming content, and inline chat panel. A card is the atomic unit of work in The Helm -- every user input produces a card, and every card accumulates into the session workspace.

## Data Model

### Card Record

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string (uuid)` | yes | Unique identifier |
| `shortname` | `string` | yes | User-facing label (editable, max 60 chars) |
| `type` | `CardType` enum | yes | Determines rendering and color; set by classifier |
| `status` | `CardStatus` enum | yes | Current lifecycle state |
| `content` | `CardContent` | yes | Type-specific input payload (query text, code, claim, etc.) |
| `result` | `CardResult \| null` | no | Type-specific output payload; null until execution completes |
| `error` | `{ code: string; message: string } \| null` | no | Present when `status === "error"` |
| `references` | `string[]` | no | Array of card IDs this card depends on or cites |
| `createdAt` | `ISO 8601 string` | yes | Creation timestamp |
| `updatedAt` | `ISO 8601 string` | yes | Last modification timestamp |
| `createdBy` | `string` | yes | User ID of creator |
| `lockedBy` | `string \| null` | no | User ID holding the edit lock (see collaboration spec) |
| `sessionId` | `string` | yes | Parent session |

### CardType Enum

| Value | Description |
|-------|-------------|
| `sql` | Database query |
| `python` | Python code execution |
| `literature` | Literature/publication search |
| `hypothesis` | Structured scientific claim |
| `note` | Free-form text |
| `data_ingest` | File upload with schema detection |

### CardStatus Enum

| Value | Description |
|-------|-------------|
| `thinking` | Classifier/AI is processing input, generating executable form |
| `running` | Query or code is executing against a backend |
| `complete` | Execution finished successfully; result is populated |
| `error` | Execution failed; error is populated |

## Card Types and Rendering

Each card type has a distinct content shape, result shape, and body renderer.

### Content and Result Shapes

| Type | `content` shape | `result` shape |
|------|----------------|----------------|
| SQL | `{ query: string; dataSource: string }` | `{ columns: Column[]; rows: Row[]; rowCount: number; truncated: boolean }` |
| Python | `{ code: string; language: "python" }` | `{ stdout: string; stderr: string; returnValue: any; figures: Figure[] }` |
| Literature | `{ searchTerms: string[]; filters?: LitFilters }` | `{ hits: Publication[]; totalCount: number }` |
| Hypothesis | `{ claim: string; evidence?: string; domain?: string }` | `{ analysis: string; suggestedQueries: SuggestedQuery[]; confidence?: number }` |
| Note | `{ text: string }` | `null` (notes have no execution result) |
| Data Ingest | `{ fileName: string; fileSize: number; mimeType: string }` | `{ schema: SchemaField[]; sampleRows: Row[]; totalRows: number; uploadId: string }` |

### Body Rendering by Type

| Type | Body content |
|------|-------------|
| SQL | Code block (JetBrains Mono) showing `content.query`, followed by a scrollable result table with column headers and rows. Show `rowCount` and a "truncated" badge when applicable. |
| Python | Code block showing `content.code`, followed by stdout/stderr output panels. Render `figures` as inline images below output. |
| Literature | List of publication cards: title, authors (truncated), year, source. Each item is clickable to expand abstract. Show `totalCount` vs displayed count. |
| Hypothesis | Structured display: claim in a callout block (Serif font), followed by AI analysis text (streamed). Below analysis, render `suggestedQueries` as clickable chips that create new cards. |
| Note | Editable plain text area. No execution, no result section. |
| Data Ingest | Two-section layout: schema preview (field name, inferred type, sample values) as a compact table, followed by a data sample table showing first N rows. Show upload progress bar while `status === "running"`. |

## Card Header

Every card renders a consistent header regardless of type.

| Element | Behavior |
|---------|----------|
| Shortname | Displayed as primary text (DM Sans, semibold). Editable on click -- inline text input, blur or Enter to save. |
| Type badge | Pill-shaped badge showing the card type name. Uses the type's foreground color on its background color (see Input Type Colors in README). |
| Status indicator | Small dot or icon beside the type badge. Color from Status Colors in README. Animated per status (see Status Lifecycle below). |
| Action buttons | Icon buttons, visible on hover or focus. Actions: open chat panel, copy card, pin/unpin, delete. Delete requires confirmation. |

## Status Lifecycle

Cards progress through statuses with distinct visual treatments. Motion `variants` drive all transitions.

### State Machine

```
         submit
  -------> thinking
  |            |
  |        classify + transform
  |            |
  |            v
  |        running
  |            |
  |       +---------+
  |       |         |
  |       v         v
  |   complete    error
  |                 |
  |          retry  |
  +--------<--------+
```

### Status Animations

| Status | Visual treatment | Animation |
|--------|-----------------|-----------|
| `thinking` | Amber (`#B8660D`) pulsing dot; shimmer overlay on card body | CSS `@keyframes` pulse on dot (compositor thread). CSS shimmer gradient on body placeholder. |
| `running` | Blue (`#2B6CB0`) spinning indicator; content streams in | Motion `animate` on spinner. Streaming content rendered token-by-token (see Streaming below). |
| `complete` | Green (`#1A7F5A`) static checkmark; full result visible | Motion `variants` fade-in on result section. Checkmark scales in with spring easing. |
| `error` | Red (`#C53030`) error icon; error message displayed | Motion `variants` with subtle shake on error icon (2-3px horizontal, 300ms). Error message fades in. |

### Status Transitions

All transitions use Motion `AnimatePresence` to cross-fade outgoing and incoming content. Duration: 200ms, easing: `cubic-bezier(0.16, 1, 0.3, 1)` (the `out` token).

## Streaming Content Rendering

When a card is in `running` status and the backend streams results (SQL result rows, Python output, Hypothesis analysis), content renders incrementally.

### Architecture

| Component | Role |
|-----------|------|
| Zustand card store | Holds `streamingContent: string` per card, separate from final `result` |
| Token buffer | Plain JS variable (not React state) accumulates tokens from the SSE stream |
| Flush interval | `setInterval` at 50ms (20 flushes/sec) writes buffer contents to Zustand `streamingContent` |
| React subscriber | Card body component subscribes to `streamingContent` via Zustand selector, re-renders only when its own card's content changes |
| Completion | On stream end, move `streamingContent` into `result`, clear streaming state |

### Rendering Rules

| Rule | Detail |
|------|--------|
| Cursor | Blinking cursor (`CSS @keyframes`, 530ms interval) appended to last text node during streaming |
| Markdown | Render streamed content as Markdown. Use a renderer that tolerates incomplete Markdown (unclosed bold, partial code blocks). |
| Code blocks | Syntax-highlighted as they stream in. Language hint from card type (SQL, Python). |
| Tables | Buffer table rows; render table only after header row + at least one data row received. Append rows as they arrive. |
| Scroll | Auto-scroll card body to bottom during streaming. Pause auto-scroll if user scrolls up. Resume on new user interaction. |

## Inline Chat Panel

Each card has an associated chat panel for error recovery, context injection, and discussion. The panel is secondary UI -- not a full chat application.

### When It Opens

| Trigger | Behavior |
|---------|----------|
| User clicks chat action button in card header | Panel slides in from the right edge of the card |
| Card enters `error` status | Chat button pulses to suggest opening; does not auto-open |

### Panel Layout

| Element | Detail |
|---------|--------|
| Container | Slide-in panel anchored to the right side of the card. Width: 320px or 40% of card width, whichever is larger. Motion `AnimatePresence` for enter/exit. |
| Message list | Scrollable list of messages. User messages right-aligned, AI messages left-aligned. Auto-scroll to bottom on new messages; pause if user scrolls up. |
| Input field | Single-line text input at bottom with send button. Disabled while AI is streaming a response. |
| Action bar | Below input: Abort button (visible during streaming), Retry button (visible after error or completion). |

### Chat Data Flow

| Step | Detail |
|------|--------|
| Open | Panel opens. System context message is injected (not visible to user): card type, original query/code, error details, data source, result summary. |
| User message | Added to message list immediately (optimistic). Sent to backend via `fetch` POST with `ReadableStream` response. |
| AI streaming | Tokens buffered in a plain JS ref, flushed to Zustand at 50ms intervals. Blinking cursor shown during streaming. |
| Tool call | AI may return a tool call (e.g., `retry_query`, `modify_code`). Frontend dispatches the corresponding card update action. Card re-executes with new parameters. |
| Completion | Final AI message committed to message array. Card status and result update reflected in card body. |
| Abort | User clicks abort. `AbortController.abort()` cancels the fetch. Partial AI response is kept with a "stopped" indicator. |
| Retry | Overwrites the last AI message. Resubmits the conversation (sliced before last assistant message) to the backend. |

### Implementation

| Concern | Approach |
|---------|----------|
| Transport | Custom `fetch` + `ReadableStream`. No EventSource (needs POST + auth headers). ~150 lines. |
| SSE parsing | `TextDecoder({ stream: true })` for UTF-8 safety. Split on `\n`, parse `data:` lines, handle `data: [DONE]`. |
| State | Zustand store keyed by card ID. Shape: `{ messages: Message[]; streamingContent: string; isStreaming: boolean; error: string \| null }` |
| Abort | `AbortController` ref. Catch `AbortError` by name, commit partial content. |
| Retry | Slice message array before last assistant message, resubmit. Overwrite mode (no branching). |
| Scope | One conversation per card. Conversation ID = card ID. |

### Message Shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique message ID |
| `role` | `"user" \| "assistant" \| "system"` | Sender role. System messages are hidden from the user. |
| `content` | `string` | Message text (Markdown) |
| `toolCall` | `{ name: string; params: Record<string, any> } \| null` | Present when AI requests a card action |
| `timestamp` | `ISO 8601 string` | When the message was created |
| `status` | `"pending" \| "streaming" \| "complete" \| "error" \| "aborted"` | Message delivery state |

## Cross-Card References

Cards can reference other cards. References are stored as an array of card IDs on the referencing card.

| Behavior | Detail |
|----------|--------|
| Display | Referenced cards shown as clickable pills in the card body (shortname + type badge color). |
| Navigation | Clicking a reference pill scrolls the workspace to the referenced card and briefly highlights it (Motion scale pulse, 300ms). |
| Creation | References are created when the AI generates a card that builds on another (e.g., a Hypothesis card citing a SQL card's results). User can also manually add references via the card chat panel. |
| Deletion | Deleting a referenced card does not delete the reference -- the pill shows "deleted card" in muted text. |

## Accessibility

| Concern | Requirement |
|---------|-------------|
| Keyboard | All card actions reachable via Tab. Enter/Space to activate buttons. Escape to close chat panel. |
| Screen reader | Card header announces: shortname, type, status. Status changes announced as live region updates (`aria-live="polite"`). |
| Reduced motion | Respect `prefers-reduced-motion`: replace animations with instant transitions, disable shimmer, use static status icons. |
| Focus management | Opening chat panel moves focus to the input field. Closing returns focus to the chat action button. |

## Open Questions

1. Should chat history persist across sessions or be ephemeral?
2. Maximum number of simultaneously open chat panels (one vs. many)?
3. Should the AI be able to proactively suggest opening the chat panel on error?
4. Card size constraints -- fixed width with variable height, or user-resizable?
