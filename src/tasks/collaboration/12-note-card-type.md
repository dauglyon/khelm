# 12 -- Note Card Type

## Dependencies

| Dependency | Domain | Status |
|------------|--------|--------|
| Card model (CardType enum) | card | must exist |
| Card body renderer registry | card | must exist |
| Card header | card | must exist |

## Context

Note cards are a collaboration primitive that any participant can create to provide context, ask questions, or leave instructions. This is the simplest card type -- no execution, no result. The note card type value already exists in the CardType enum; this task implements its body renderer and creation flow.

**Architecture reference:** collaboration.md section 9 (Note Cards), card.md (CardType enum, body rendering table).

## Implementation Requirements

### Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/features/cards/renderers/NoteCardBody.tsx` | Body renderer for note cards | ~80 |
| `src/features/cards/renderers/NoteCardBody.css.ts` | vanilla-extract styles | ~30 |
| `src/features/cards/renderers/NoteCardBody.test.tsx` | Tests | ~60 |

### Note card data shapes (from card.md)

- `content`: `{ text: string }`
- `result`: `null` (notes have no execution result)
- `status`: always `complete` (no execution phase)

### `NoteCardBody` component

| Prop | Type | Description |
|------|------|-------------|
| `card` | `CardState` | Card data with `type: 'note'` |
| `isEditable` | `boolean` | Whether the current user can edit (from lock guard) |

| Element | Behavior |
|---------|----------|
| Text area | Renders `content.text` as editable plain text when `isEditable` is true |
| Read-only view | Renders `content.text` as styled paragraph when `isEditable` is false |
| Empty state | Placeholder text: "Write a note..." when text is empty and editable |
| Typography | DM Sans, regular weight, `textMid` color |
| Min height | 60px to prevent collapse on empty notes |
| Max height | No max; note grows with content |
| Save behavior | Debounced save on blur or after 1s of no typing; emits card update |

### Lock behavior

Same as all other card types:
- Lock required to edit (managed by `useCardLockGuard` from task 08).
- Lock-free to view, comment, copy, pin.
- When locked by another user, text area is read-only.

### Registration

Register `NoteCardBody` in the card body renderer registry (pattern depends on card domain implementation -- likely a `Map<CardType, Component>` or switch statement).

### Card colors (from architecture README)

| Token | Value |
|-------|-------|
| Foreground | `#7A6340` |
| Background | `#F5F0E7` |
| Border | `#D6C8AD` |

## Demo Reference

**Vignette 4:** User creates a note card saying "I'm investigating the soil samples from site 3." Other participants see it appear and can read it. Another user locks the note to add more context.

## Integration Proofs

```bash
# Component compiles
npx tsc --noEmit src/features/cards/renderers/NoteCardBody.tsx

# Tests pass
npx vitest run src/features/cards/renderers/NoteCardBody.test.tsx
```

## Acceptance Criteria

- [ ] `NoteCardBody` renders `content.text` as editable text when `isEditable` is true
- [ ] Read-only mode shows text as styled paragraph
- [ ] Empty state shows placeholder text
- [ ] Debounced save on blur or after 1s of inactivity
- [ ] No execution phase or result section (notes skip thinking/running)
- [ ] Note card uses correct type colors (foreground, background, border)
- [ ] Registered in card body renderer registry
- [ ] Lock behavior identical to other card types
- [ ] Tests verify: render, edit, read-only, empty state, save debounce

## Anti-Patterns

- Do NOT add a result section to note cards; they have no execution output.
- Do NOT use a rich text editor for notes; plain text is sufficient (architecture spec).
- Do NOT save on every keystroke; debounce to avoid excessive mutations.
- Do NOT skip lock checks for note editing; notes follow the same lock protocol as all cards.
