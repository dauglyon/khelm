# Task 06: ConnectiveEditor

## Dependencies

| Dependency | Domain | What's Needed |
|------------|--------|---------------|
| 01-narrative-store | narrative | `useConnectiveText(index)`, `setConnectiveText(index, text)`, `useOrderedCardIds` |
| 05-card-summary-reorder | narrative | Card summaries rendered in order (editors slot between them) |
| TipTap base | input-surface | TipTap editor configuration patterns (if shared config exists) |

## Context

Between each pair of card summaries in the composition panel (and before the first card and after the last card), there is a small TipTap editor instance for "connective text" -- transitional prose that bridges one card's content to the next. These editors use a minimal TipTap configuration: bold, italic, and links only.

The connective text is keyed by position index in the `connectiveTexts` record: `"0"` is before the first card, `"1"` is between card 1 and card 2, etc. When cards are reordered, the connective texts stay at their positional indices (they describe the transition at that position, not attached to a specific card).

## Implementation Requirements

### Files to Create

1. **`src/features/narrative/ConnectiveEditor.tsx`** (~120 lines)
2. **`src/features/narrative/ConnectiveEditor.css.ts`** (~60 lines)

### Component: `ConnectiveEditor`

A minimal TipTap editor instance for one connective text slot.

| Prop | Type | Description |
|------|------|-------------|
| `positionIndex` | `string` | Key into `connectiveTexts` (e.g., `"0"`, `"1"`) |

### TipTap Configuration

| Extension | Purpose |
|-----------|---------|
| `StarterKit` | Base text editing (paragraphs, hard breaks) |
| `Bold` | Bold formatting |
| `Italic` | Italic formatting |
| `Link` | Hyperlinks |

Do NOT include: mentions, code blocks, headings, lists, images, or any other extensions.

### Behavior

| Aspect | Detail |
|--------|--------|
| Initial content | Read from `useConnectiveText(positionIndex)` |
| Update | On editor `onUpdate`, call `setConnectiveText(positionIndex, editor.getHTML())` |
| Debounce | Debounce the `setConnectiveText` call by 300ms to avoid excessive store updates while typing |
| Placeholder | "Add connective text..." in `textLight` color |
| Empty state | Editor collapses to a thin clickable bar; expands on focus |
| Focus | Standard TipTap focus management; Tab moves to next editor/element |

### Styling

| Property | Value |
|----------|-------|
| Background | `surface` token, slightly darker than panel background |
| Border | `border` token, dashed style to distinguish from card summaries |
| Min height | 40px (collapsed); grows with content |
| Typography | DM Sans, body size |
| Padding | Design token spacing |

### Integration with CardSummaryList

The connective editors are interleaved with card summaries in the composition panel body. The rendering pattern in the parent component (which composes tasks 05 + 06):

```
ConnectiveEditor (position "0")
CardSummary (card 0)
ConnectiveEditor (position "1")
CardSummary (card 1)
ConnectiveEditor (position "2")
...
ConnectiveEditor (position "N")  // after last card
```

This interleaving logic may live in `CompositionPanel` or a new wrapper component. The important thing is that `ConnectiveEditor` is a standalone component that receives its `positionIndex` as a prop.

## Demo Reference

Vignette 5: the user types transitional text between cards in the composition panel.

## Integration Proofs

```bash
# Component renders and tests pass
npx vitest run src/features/narrative/ConnectiveEditor.test.tsx

# Tests verify:
# 1. TipTap editor renders with placeholder text
# 2. Typing updates the narrative store via setConnectiveText
# 3. Initial content loads from store
# 4. Debounce prevents excessive store updates
# 5. Only bold, italic, and link extensions are active
# 6. Editor is accessible (focusable, has role)
```

### Test File

Create **`src/features/narrative/ConnectiveEditor.test.tsx`** (~80 lines) with:
- Render: editor appears with placeholder
- Content: initial content loaded from `useConnectiveText`
- Update: typing calls `setConnectiveText` after debounce
- Extensions: bold/italic/link available; code block not available
- Accessibility: editor element is focusable

## Acceptance Criteria

- [ ] `ConnectiveEditor` renders a TipTap editor at the specified position index
- [ ] Editor loads initial content from `connectiveTexts[positionIndex]` in the narrative store
- [ ] Typing in the editor updates the store via `setConnectiveText` with a 300ms debounce
- [ ] Only bold, italic, and link formatting are available
- [ ] Placeholder text "Add connective text..." shown when editor is empty
- [ ] Editor collapses to a thin bar when empty and unfocused
- [ ] Multiple `ConnectiveEditor` instances can coexist on the page without interference
- [ ] All tests pass: `npx vitest run src/features/narrative/ConnectiveEditor.test.tsx`

## Anti-Patterns

- Do NOT use the full TipTap configuration from the input surface. The connective editor is deliberately minimal.
- Do NOT store TipTap editor instances in global state. Each editor manages its own instance locally.
- Do NOT make the editor a controlled component that re-renders on every keystroke. Use TipTap's `onUpdate` callback with debounce.
- Do NOT attach connective text to card IDs. They are keyed by positional index and stay at their position when cards are reordered.
- Do NOT add mention/pill support to the connective editor. It is plain rich text only.
