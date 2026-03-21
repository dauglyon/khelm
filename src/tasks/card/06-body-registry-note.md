# Task 06: Card Body Registry and Note Body

## Dependencies

- **01-card-types**: `CardType`, content/result type unions
- **05-card-shell**: `Card` component (renders `CardBody`)
- **design-system**: typography tokens, `TextInput` or textarea styles

## Context

Each card type has a distinct body renderer (architecture/card.md > Body Rendering by Type). The `CardBody` component acts as a registry/dispatcher: given a card type, it renders the appropriate body component. This task creates the registry and implements the simplest body -- the Note type, which is just an editable plain text area with no execution result.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/CardBody.tsx`** (~50 lines)
2. **`src/features/cards/bodies/NoteBody.tsx`** (~60 lines)
3. **`src/features/cards/bodies/NoteBody.css.ts`** (~30 lines)
4. **`src/features/cards/__tests__/CardBody.test.tsx`** (~50 lines)
5. **`src/features/cards/__tests__/NoteBody.test.tsx`** (~60 lines)

### CardBody Registry

```typescript
interface CardBodyProps {
  type: CardType;
  content: CardContent;
  result: CardResult | null;
  status: CardStatus;
  streamingContent?: string;
  cardId: string;
}
```

The registry maps `CardType` to a body component:
- `sql` -> `SqlBody` (task 07, renders placeholder until implemented)
- `python` -> `PythonBody` (task 08, placeholder)
- `literature` -> `LiteratureBody` (task 09, placeholder)
- `hypothesis` -> `HypothesisBody` (task 10, placeholder)
- `note` -> `NoteBody` (this task)
- `data_ingest` -> `DataIngestBody` (task 11, placeholder)

For types not yet implemented, render a placeholder: card type name + "body coming soon" text.

### NoteBody Component

```typescript
interface NoteBodyProps {
  content: NoteContent;
  cardId: string;
}
```

| Element | Detail |
|---------|--------|
| Text area | Editable plain text area. Displays `content.text`. |
| No result section | Notes have no execution; `result` is always `null`. |
| Font | DM Sans, body size (15px), regular weight |
| Min height | 80px |
| Auto-grow | Textarea grows with content (no fixed height) |
| Save | On blur, dispatch `updateCard` to store with updated text |

### Styles

- NoteBody container: `padding: 0 16px 16px`
- Textarea: borderless, `backgroundColor: transparent`, full width, resize: vertical
- Placeholder text: `color: vars.color.textLight`, "Write a note..."

## Demo Reference

**Vignette 1**: A Note card shows an editable text area with the user's note content. No execution result section appears below.

**Vignette 2**: User clicks into the note text area, types additional content, clicks away. The note saves.

## Integration Proofs

1. **Registry dispatch test**: Render `CardBody` with `type: 'note'`. Assert `NoteBody` renders. Render with `type: 'sql'`. Assert placeholder renders.
2. **Note render test**: Render `NoteBody` with `content: { text: 'Hello world' }`. Assert "Hello world" appears in textarea.
3. **Note edit test**: Render `NoteBody`, change textarea value, trigger blur. Assert store update action called with new text.
4. **Note placeholder test**: Render `NoteBody` with `content: { text: '' }`. Assert placeholder "Write a note..." is visible.
5. **Auto-grow test**: Render with multi-line text. Assert textarea height accommodates content.

## Acceptance Criteria

- [ ] `CardBody` dispatches to correct body component based on `type`
- [ ] Unimplemented types show placeholder text (not a crash)
- [ ] `NoteBody` renders editable textarea with `content.text`
- [ ] Textarea auto-grows with content
- [ ] Textarea has placeholder text when empty
- [ ] On blur, updated text dispatched to store
- [ ] No result section rendered for Note type
- [ ] Styles use design tokens (font, colors)
- [ ] All tests pass

## Anti-Patterns

- Do not use a `switch` statement with hardcoded imports in the registry -- use a component map for lazy loading
- Do not render execution results for Note type -- it is always null
- Do not use `contentEditable` -- use a standard `<textarea>` element
- Do not add rich text editing to notes -- plain text only per spec
- Do not put business logic in CardBody -- it is a pure dispatcher
