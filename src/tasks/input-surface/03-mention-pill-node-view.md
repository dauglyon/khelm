# 03 -- Mention Pill Node View

## Dependencies

| Dependency | Type | What it provides |
|------------|------|------------------|
| 02 (editor) | intra-domain | TipTap editor instance to extend with Mention |
| design-system | cross-domain | Input type color tokens for pill styling |

## Context

Mentions let users reference existing cards inline. They render as colored pills within the editor text. This task adds the TipTap Mention extension and the React node view that renders each pill. The suggestion dropdown (autocomplete) is task 04.

Reference: `architecture/input-surface.md` section 2 (Mention Pills).

## Implementation Requirements

### Files to create

1. `src/features/input-surface/mention/MentionPill.tsx` -- React node view component for the pill
2. `src/features/input-surface/mention/mentionPill.css.ts` -- vanilla-extract styles with type-based color variants

### Packages required

| Package | Version constraint | Purpose |
|---------|--------------------|---------|
| `@tiptap/extension-mention` | latest | Mention node type |
| `@tiptap/suggestion` | latest | Suggestion trigger (configured in task 04) |

### Mention extension configuration

| Aspect | Specification |
|--------|---------------|
| Trigger character | `@` |
| Node attrs | `{ id: string, label: string }` |
| Node view | `ReactNodeViewRenderer(MentionPill)` |
| Atomic | `true` -- backspace deletes the entire pill, cannot edit characters within |
| Inline | `true` -- renders inline within text flow |

### MentionPill component

| Aspect | Specification |
|--------|---------------|
| Content | Displays `@{label}` (e.g., `@query-1`, `@note-3`) |
| Styling | Background and border color derived from the referenced card's input type |
| Props from node | `node.attrs.id`, `node.attrs.label` |
| Border radius | Rounded pill shape |
| Typography | DM Sans, slightly smaller than surrounding text |

### Type color mapping

The pill color is determined by the card type extracted from the label prefix (e.g., `query-1` maps to SQL type). If the type cannot be determined, use a neutral default (Note colors).

### Integration with editor (task 02)

The `SingleLineEditor` must accept the Mention extension in its extensions array. This task adds the extension configuration but passes `suggestion: { items: () => [], render: () => ({}) }` as a stub. Task 04 provides the real suggestion dropdown.

## Demo Reference (Vignette 1 -- The Core Loop)

When the user types `@` in the input, previously created cards appear as suggestions. Selecting one inserts a colored pill. The pill is included in the TipTap JSON when the input is submitted, preserving the card reference.

## Integration Proofs

```bash
# Mention pill renders with correct attrs
vitest run src/features/input-surface/mention --reporter=verbose

# Verify: Mention extension registers in TipTap without errors
# Verify: MentionPill renders label with @ prefix
# Verify: pill applies type-based color styling
# Verify: pill is atomic (backspace deletes whole pill)
# Verify: editor.getJSON() includes mention node with id and label
```

## Acceptance Criteria

- [ ] Mention extension configured with `@` trigger and `{ id, label }` attrs
- [ ] `MentionPill` renders as a React node view inside the editor
- [ ] Pill displays `@{label}` text
- [ ] Pill colors are derived from input type color tokens
- [ ] Pill is atomic (cannot partially edit, backspace removes entire pill)
- [ ] `editor.getJSON()` serializes mention nodes with `id` and `label`
- [ ] `editor.getText()` includes mention labels inline
- [ ] Suggestion is stubbed (empty items, no-op render) -- real dropdown is task 04
- [ ] Styles use vanilla-extract

## Anti-Patterns

- Do not build the suggestion dropdown in this task. That is task 04.
- Do not query any API for card lists here. The suggestion source is provided by task 04.
- Do not hardcode colors. Use design-system tokens mapped by input type.
