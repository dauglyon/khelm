# Task 03: Card Header Component

## Dependencies

- **01-card-types**: `Card`, `CardType`, `CardStatus`
- **02-card-store**: `useCardData` selector
- **design-system**: `Chip` (type badge), `Badge` (status), `IconButton` (actions), `TextInput` (inline edit), design tokens

## Context

Every card renders a consistent header regardless of type (architecture/card.md > Card Header). The header shows the editable shortname, a type badge pill, a status indicator, and action buttons (chat, copy, pin, delete). Action buttons are visible on hover or focus. The shortname is editable inline -- click to enter edit mode, blur or Enter to save.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/CardHeader.tsx`** (~130 lines)
2. **`src/features/cards/CardHeader.css.ts`** (~60 lines)
3. **`src/features/cards/__tests__/CardHeader.test.tsx`** (~100 lines)

### Component Props

```typescript
interface CardHeaderProps {
  cardId: string;
  shortname: string;
  type: CardType;
  status: CardStatus;
  onShortnameChange: (newName: string) => void;
  onOpenChat: () => void;
  onCopy: () => void;
  onPin: () => void;
  onDelete: () => void;
  isPinned?: boolean;
}
```

### Rendering Rules

| Element | Implementation |
|---------|---------------|
| Shortname | DM Sans, semibold. Click enters inline edit mode (TextInput, max 60 chars). Blur or Enter saves. Escape cancels. |
| Type badge | `Chip` component with `inputType` prop mapped from `CardType`. Shows type name (e.g., "SQL", "Python"). |
| Status indicator | Imported `StatusIndicator` (task 04). Renders beside type badge. |
| Action buttons row | `IconButton` components. Icons: chat (message), copy, pin/unpin, delete. Visible on card hover or any button focus. |
| Delete confirmation | Delete button click shows a confirmation prompt (simple confirm dialog or inline "Are you sure?" with confirm/cancel). |

### Styles (vanilla-extract)

- Header container: `display: flex`, `alignItems: center`, `gap: 8px`, `padding: 12px 16px`
- Shortname text: `flex: 1`, `fontSize: body`, `fontWeight: 600`, `fontFamily: vars.font.sans`
- Shortname input: matches text style, borderless, `backgroundColor: transparent`
- Actions container: `opacity: 0` by default, `opacity: 1` on parent hover or `focus-within`
- Transition: `opacity 150ms ease`

## Demo Reference

**Vignette 1**: Card header shows "Query metagenomes" as shortname, a blue "SQL" pill badge, and a green checkmark dot. Hovering reveals chat, copy, pin, and delete icon buttons.

**Vignette 2**: User clicks the shortname text. It becomes an editable input. User types a new name, presses Enter. The shortname updates. The input reverts to display text.

## Integration Proofs

1. **Render test**: Render `CardHeader` with `type: 'sql'`, `status: 'complete'`, `shortname: 'test query'`. Assert shortname text is visible, type badge shows "SQL", status indicator is present.
2. **Edit test**: Render header, click shortname text, type new name, press Enter. Assert `onShortnameChange` was called with new value.
3. **Edit cancel test**: Click shortname, type partial text, press Escape. Assert `onShortnameChange` was NOT called, original text restored.
4. **Action visibility test**: Assert action buttons have `opacity: 0` (or are visually hidden). Simulate hover on header container. Assert buttons become visible.
5. **Delete confirmation test**: Click delete button. Assert confirmation prompt appears. Click confirm. Assert `onDelete` called.
6. **Max length test**: Enter edit mode, type >60 characters. Assert input value is clamped to 60 chars.

## Acceptance Criteria

- [ ] Shortname renders in DM Sans semibold
- [ ] Shortname is inline-editable with click-to-edit, Enter to save, Escape to cancel
- [ ] Shortname input enforces 60-character max
- [ ] Type badge renders as `Chip` with correct inputType color
- [ ] Status indicator renders beside type badge
- [ ] Action buttons (chat, copy, pin, delete) are present
- [ ] Action buttons are hidden by default, visible on hover/focus
- [ ] Delete requires confirmation before calling `onDelete`
- [ ] All callbacks fire correctly (`onShortnameChange`, `onOpenChat`, `onCopy`, `onPin`, `onDelete`)
- [ ] All tests pass via `npx vitest run src/features/cards/__tests__/CardHeader.test.tsx`

## Anti-Patterns

- Do not fetch card data inside the header -- receive all data via props
- Do not manage edit state in the store -- local `useState` for inline editing
- Do not use browser `prompt()` or `confirm()` for delete -- render inline confirmation
- Do not hardcode colors -- use design tokens via `vars.color.inputType.*`
- Do not render status animations here -- delegate to `StatusIndicator` (task 04)
