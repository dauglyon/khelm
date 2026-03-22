# Input Surface

The single input component through which all user intent enters the system. Covers the TipTap editor, mention pills, input classification, classification preview, and submit flow.

## Scope

| In Scope | Out of Scope |
|----------|-------------|
| TipTap editor setup and single-line mode | Card rendering after creation (see `card.md`) |
| Mention pills and autocomplete dropdown | Workspace layout / masonry grid (see `workspace.md`) |
| Input classification (local + API fallback) | File drag-and-drop / upload (see `data-ingest.md`) |
| Classification preview (live type indicator) | Chat UI inside cards (see `card.md`) |
| Submit flow (Enter key, card creation) | Collaboration / multi-user sync (see `collaboration.md`) |

---

## 1. TipTap Editor

### Packages

| Package | Purpose |
|---------|---------|
| `@tiptap/core` | Editor kernel |
| `@tiptap/react` | `useEditor` hook, `EditorContent` component |
| `@tiptap/extension-mention` | Inline mention nodes |
| `@tiptap/suggestion` | Autocomplete trigger, positioning, keyboard nav |
| `@tiptap/extension-text` | Text node |
| `@tiptap/extension-paragraph` | Paragraph node (required by core) |

### Single-Line Mode

| Aspect | Specification |
|--------|---------------|
| Document schema | `Document.extend({ content: 'text*' })` -- strips block-level nodes |
| Enter key | Intercepted -- triggers submit (see section 5), does not insert newline |
| Shift+Enter | No-op (no multi-line support) |
| Paste behavior | Strip newlines from pasted text, flatten to single line |
| Visual style | Renders as a single-line input bar at bottom of workspace |

### Content Access

| Method | Returns | Use |
|--------|---------|-----|
| `editor.getText()` | Plain text with mention labels inline | Feed to classifier on every change |
| `editor.getJSON()` | ProseMirror JSON with mention node data | Persist to API on submit |
| `editor.on('update')` | Callback on every transaction | Triggers debounced classification |

---

## 2. Mention Pills

Mentions let users reference existing cards inline. They render as colored pill/chip elements within the input text.

### Trigger and Behavior

| Aspect | Specification |
|--------|---------------|
| Trigger character | `@` |
| Suggestion source | Query workspace cards in current session |
| Filter | Case-insensitive substring match on card shortname and title |
| Selection | Click or Enter to insert; Escape to dismiss |
| Keyboard nav | Arrow Up / Arrow Down to navigate suggestions |
| Max suggestions | 8 items visible, scrollable if more |

### Pill Rendering

| Aspect | Specification |
|--------|---------------|
| Renderer | `ReactNodeViewRenderer` -- each pill is a React component |
| Content | Card shortname (e.g., `@query-1`, `@note-3`) |
| Styling | Background and border color from the referenced card's input type colors (see README.md) |
| Behavior | Atomic -- cannot edit characters within the pill; backspace deletes the entire pill |
| Data stored | `{ id: string, label: string }` in the mention node attrs |

### Suggestion Dropdown

| Aspect | Specification |
|--------|---------------|
| Positioning | Anchored below the `@` trigger character via Suggestion API |
| Empty state | "No matching cards" message |
| Loading state | Spinner while fetching card list (if async) |
| Item display | Card shortname, title, and type color indicator |

---

## 3. Input Classification

Determines the user's intent so the system can route the input to the correct execution path.

### Input Types

| Type | Intent | Example |
|------|--------|---------|
| SQL | Execute a query against data sources | `SELECT * FROM biosample WHERE ecosystem_type = 'Soil'` |
| Python | Run code in a sandbox | `import pandas as pd; df.groupby('phylum').count()` |
| Literature | Search scientific literature | "Recent papers on CRISPR-Cas9 in methanotrophs" |
| Hypothesis | Structure a testable claim | "Acidobacteria abundance correlates with soil pH below 5.5" |
| Note | Store a free-text annotation | "Remember to check the QC flags on JGI run 3045" |
| Data Ingest | Parse a file reference and load data | "Load the CSV from /uploads/soil_samples_2024.csv" |

### Classification Pipeline

```
User types --> debounce (300ms) --> editor.getText() --> classify() --> update preview
```

### Local Model (Primary)

| Aspect | Specification |
|--------|---------------|
| Model | Qwen3.5-4B |
| Runtime | Ollama (local inference server) |
| Thinking mode | `/no_think` -- suppress chain-of-thought, return answer directly |
| Output format | Structured JSON via grammar-constrained decoding |
| Expected latency | 100-200ms |
| Cost | Zero per-token (local) |
| Upgrade path | Qwen3.5-9B if accuracy insufficient; LoRA fine-tune on Qwen3-1.7B if labeled data accumulates |

### API Fallback

Used when Ollama is unavailable (network deployment, local model not running).

| Aspect | Specification |
|--------|---------------|
| Primary fallback | Gemini 2.5 Flash Lite ($0.10/$0.40 per MTok) |
| Secondary fallback | GPT-4.1 nano ($0.05/$0.20 per MTok) |
| Detection | Health-check Ollama on app init; if unreachable, switch to API mode |
| Output format | Structured JSON output (provider-native JSON schema mode) |
| Expected latency | 200-400ms |

### Classification Output Schema

```
{
  "type": "sql" | "python" | "literature" | "hypothesis" | "note" | "data_ingest" | "task",
  "confidence": 0.0 - 1.0,
  "alternatives": [
    { "type": "...", "confidence": 0.0 - 1.0 },
    { "type": "...", "confidence": 0.0 - 1.0 }
  ]
}
```

### Prompt Requirements

| Element | Detail |
|---------|--------|
| System context | Classify by what the user wants to DO, not what the input is ABOUT |
| Category definitions | Action-oriented descriptions for each of the seven types |
| Few-shot examples | 5 per category, including 2 ambiguous/tricky examples per category |
| Disambiguation rules | Imperative + data verb = SQL; declarative claim = Hypothesis; "papers"/"studies" = Literature; personal/task language = Note; tool/container/pipeline invocation = Task |
| Output constraint | JSON schema as defined above; `max_tokens=50` |

---

## 4. Classification Preview

A live type indicator that updates as the user types, showing what the system thinks the input is.

### Confidence-Based UX

| Confidence | Behavior | Visual |
|------------|----------|--------|
| >= 0.80 | Show classified type | Type pill with solid background in the type's color; no user action needed |
| 0.50 - 0.79 | Show type, offer alternatives | Type pill with dashed border; clicking opens a dropdown with top alternatives |
| < 0.50 | Let user pick | No pre-selected type; show top 2-3 options as selectable pills |

### Type Indicator

| Aspect | Specification |
|--------|---------------|
| Position | Inline with the input bar, leading edge (left side) |
| Content | Type label (e.g., "SQL", "Python", "Hypothesis") |
| Colors | Foreground, background, and border from Input Type Colors in README.md |
| Animation | Fade transition (150ms, `easing.inOut`) when type changes |
| Interaction | Clickable -- opens type selector dropdown regardless of confidence |
| Empty state | No indicator shown until user has typed >= 3 characters |

### Type Selector Dropdown

| Aspect | Specification |
|--------|---------------|
| Trigger | Click the type indicator, or automatic when confidence < 0.50 |
| Content | All seven types as selectable items, each with its color |
| Ordering | Classifier-ranked (highest confidence first) when available; alphabetical otherwise |
| Selection | Click to override the classified type; override persists for this input until text changes significantly |
| Dismiss | Click outside, Escape, or select a type |

### Debounce and Timing

| Aspect | Specification |
|--------|---------------|
| Debounce delay | 300ms after last keystroke before triggering classification |
| Stale cancellation | New classification request cancels any in-flight request |
| Minimum input | No classification triggered for inputs < 3 characters |
| Loading state | Subtle pulse animation on type indicator while classification is in-flight |

---

## 5. Submit Flow

### Trigger

| Action | Result |
|--------|--------|
| Enter | Submit the current input |
| Empty input + Enter | No-op |
| Click submit button | Submit the current input (button visible at trailing edge of input bar) |

### Submit Sequence

| Step | Detail |
|------|--------|
| 1. Resolve type | Use the currently displayed type (classified or user-overridden) |
| 2. Extract content | `editor.getJSON()` for structured content with mention references |
| 3. Create card | POST to card creation API with `{ type, content, mentions[] }` |
| 4. Optimistic UI | Immediately add a placeholder card to the workspace (thinking state) |
| 5. WebSocket broadcast | Server broadcasts `card:created` event to all session participants |
| 6. Clear input | Reset editor content and classification preview |
| 7. Execution | Server routes card to the appropriate execution path based on type |

### Card Creation Payload

```
{
  "type": "sql" | "python" | "literature" | "hypothesis" | "note" | "data_ingest" | "task",
  "content": { /* TipTap JSON document */ },
  "mentions": [ { "cardId": "...", "label": "..." } ],
  "sessionId": "..."
}
```

### Error Handling

| Scenario | Behavior |
|----------|----------|
| API unreachable | Show inline error toast; keep input content so user can retry |
| WebSocket disconnected | Queue the submission; send when reconnected |
| Classification unavailable | Let user manually select type from dropdown before submitting |

---

## 6. Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| Enter | Input focused, no dropdown open | Submit |
| Enter | Suggestion dropdown open | Select highlighted suggestion |
| Escape | Suggestion dropdown open | Dismiss dropdown |
| Escape | Type selector open | Dismiss type selector |
| Arrow Up / Down | Suggestion dropdown open | Navigate suggestions |
| Backspace | Cursor adjacent to mention pill | Delete entire pill |
| `@` | Anywhere in input | Open suggestion dropdown |

---

## 7. State

Managed via Zustand (not global Redux -- local to the input surface).

| State Field | Type | Purpose |
|-------------|------|---------|
| `editorContent` | TipTap JSON | Current editor document (source of truth is the editor instance) |
| `classifiedType` | string or null | Result from classifier |
| `confidence` | number or null | Classifier confidence score |
| `alternatives` | array | Top alternative classifications |
| `userOverrideType` | string or null | User-selected type override (takes precedence over classifier) |
| `isClassifying` | boolean | Whether a classification request is in-flight |
| `isSubmitting` | boolean | Whether a submit request is in-flight |
| `classifierMode` | `"local"` or `"api"` | Which classification backend is active |

---

## 8. Dependencies

| Depends On | Why |
|------------|-----|
| design-system | Tokens for type colors, typography, easing, button/input primitives |
| app-shell | Layout slot for the input bar; session context for `sessionId` |

| Depended On By | Why |
|----------------|-----|
| workspace | Receives `card:created` events to add cards to the grid |
| card | Card model originates from input surface submissions |
| collaboration | Card creation is broadcast to other session participants |
