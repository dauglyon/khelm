# 02 -- TipTap Single-Line Editor

## Dependencies

| Dependency | Type | What it provides |
|------------|------|------------------|
| 01 (store) | intra-domain | Store hook (not consumed directly here, but editor updates feed the classifier which writes to store) |
| design-system | cross-domain | Typography tokens (DM Sans), surface/border colors, input primitives |

## Context

The TipTap editor is the text entry component for the input surface. It operates in single-line mode: no block-level nodes, Enter triggers submit (not newline), pasted text is flattened. This task sets up the editor shell without mentions (task 03) or classification (task 05).

Reference: `architecture/input-surface.md` sections 1 (TipTap Editor) and 6 (Keyboard Shortcuts).

## Implementation Requirements

### Files to create

1. `src/features/input-surface/editor/SingleLineEditor.tsx` -- React component wrapping TipTap
2. `src/features/input-surface/editor/singleLineEditor.css.ts` -- vanilla-extract styles
3. `src/features/input-surface/editor/SingleLineEditor.test.tsx` -- Unit tests

### Packages required

| Package | Version constraint | Purpose |
|---------|--------------------|---------|
| `@tiptap/core` | latest | Editor kernel |
| `@tiptap/react` | latest | `useEditor`, `EditorContent` |
| `@tiptap/extension-text` | latest | Text node |
| `@tiptap/extension-paragraph` | latest | Paragraph node (required by core) |

### Editor configuration

| Aspect | Specification |
|--------|---------------|
| Document schema | `Document.extend({ content: 'text*' })` -- no block-level nodes |
| Extensions | Custom Document, Text, Paragraph (will add Mention in task 03) |
| Enter key | Calls `onSubmit` prop callback; returns `true` to prevent newline |
| Shift+Enter | Returns `true` (no-op, no multi-line) |
| Paste transform | Strip `\n` and `\r` from pasted text via `transformPastedText` |
| Placeholder | Configurable via prop, e.g. "Ask a question, write code, or drop a file..." |
| Focus | Auto-focus on mount |

### Component API

```tsx
interface SingleLineEditorProps {
  onSubmit: (text: string, json: JSONContent) => void;
  onUpdate: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  editorRef?: React.MutableRefObject<Editor | null>;
}
```

- `onSubmit` -- called on Enter with plain text and TipTap JSON
- `onUpdate` -- called on every content change (debounced classification happens upstream)
- `editorRef` -- exposes the editor instance for external control (e.g., clearing after submit)

### Styling

- Renders as a single-line input bar
- Uses design-system surface color for background, border tokens for outline
- DM Sans font family
- No visible scrollbar; overflow hidden horizontally

## Demo Reference (Vignette 1 -- The Core Loop)

The editor is where the user types their intent. In the demo, the user types "SELECT * FROM biosample WHERE ecosystem_type = 'Soil'" into the input bar. The editor captures this text and, on Enter, passes it to the submit flow.

## Integration Proofs

```bash
# Editor renders and accepts text input
vitest run src/features/input-surface/editor --reporter=verbose

# Verify: typing text triggers onUpdate with plain text
# Verify: pressing Enter calls onSubmit, does not insert newline
# Verify: Shift+Enter does nothing
# Verify: pasting multi-line text flattens to single line
# Verify: editor can be cleared via editorRef
```

### Manual verification

- Mount `<SingleLineEditor>` in isolation
- Type text, confirm single line
- Paste multi-line content, confirm it flattens
- Press Enter, confirm `onSubmit` fires

## Acceptance Criteria

- [ ] `SingleLineEditor` component renders a TipTap editor in single-line mode
- [ ] Document schema restricts to `text*` (no block nodes)
- [ ] Enter key calls `onSubmit` with both plain text and JSON content
- [ ] Shift+Enter is a no-op
- [ ] Pasted text has newlines stripped
- [ ] `onUpdate` fires on every content change with plain text
- [ ] `editorRef` exposes the editor instance
- [ ] `disabled` prop prevents editing
- [ ] Styles use vanilla-extract with design-system tokens
- [ ] Component is testable in Vitest with Happy DOM

## Anti-Patterns

- Do not add Mention extension here. That is task 03.
- Do not debounce inside the editor. Debouncing is the classifier's responsibility (task 05).
- Do not manage classification state in the editor. The editor emits text; the classifier consumes it.
- Do not use `contentEditable` directly. Use TipTap's `useEditor` hook.
