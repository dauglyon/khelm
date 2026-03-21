# Task 05: Card Shell Component

## Dependencies

- **01-card-types**: `Card`, `CardType`, `CardStatus`
- **02-card-store**: `useCardData` selector
- **03-card-header**: `CardHeader` component
- **04-status-indicator**: `StatusIndicator` component
- **design-system**: `Card` primitive (presentational container with accent bar)

## Context

The card shell is the top-level `Card` component that composes the header, body, and optional chat panel into a single unit. It reads card data from the Zustand store, passes props to the header and body, and manages the chat panel open/close state. The design-system `Card` primitive provides the visual container (surface background, border, border-radius, top accent bar colored by type). This component adds the domain logic on top.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/Card.tsx`** (~100 lines)
2. **`src/features/cards/Card.css.ts`** (~40 lines)
3. **`src/features/cards/__tests__/Card.test.tsx`** (~90 lines)

### Component Props

```typescript
interface CardProps {
  cardId: string;
}
```

### Rendering Structure

```
<DesignSystemCard inputType={card.type}>
  <CardHeader
    cardId={card.id}
    shortname={card.shortname}
    type={card.type}
    status={card.status}
    onShortnameChange={handleShortnameChange}
    onOpenChat={toggleChat}
    onCopy={handleCopy}
    onPin={handlePin}
    onDelete={handleDelete}
  />
  <CardBody type={card.type} content={card.content} result={card.result} status={card.status} />
  {isChatOpen && <ChatPanel cardId={card.id} onClose={closeChat} />}
</DesignSystemCard>
```

### Behavior

| Concern | Detail |
|---------|--------|
| Data source | `useCardData(cardId)` from card store |
| Shortname edit | Calls `updateCard(id, { shortname })` on store |
| Chat toggle | Local `useState` for `isChatOpen` |
| Copy | Calls store action to duplicate card (new ID, append " (copy)" to shortname) |
| Pin | Calls store action to toggle pinned state |
| Delete | Calls `removeCard(id)` on store after header confirms |
| Error boundary | Wrap body in React error boundary; show fallback if body renderer crashes |
| Shimmer overlay | When `status === 'thinking'`, render a CSS shimmer overlay on the body area |

### Styles (vanilla-extract)

- Card body area: `position: relative` (for shimmer overlay positioning)
- Shimmer overlay: `position: absolute`, full coverage, CSS `shimmer` keyframe from design-system
- Chat panel container: `display: flex` alongside body when open (body + chat side by side)

## Demo Reference

**Vignette 1**: A complete SQL card renders: accent bar (blue), header with "Query metagenomes" shortname + "SQL" badge + green checkmark, body with code block and result table.

**Vignette 2**: A thinking card shows the header normally but the body area has a shimmer overlay. The status dot pulses amber.

## Integration Proofs

1. **Render test**: Set up store with a SQL card. Render `<Card cardId="test-1" />`. Assert header shows shortname, type badge, status. Assert body placeholder renders.
2. **Chat toggle test**: Render card, click chat action button in header. Assert chat panel appears. Click close on chat panel. Assert it disappears.
3. **Shortname edit test**: Edit shortname via header. Assert store's card shortname is updated.
4. **Delete test**: Click delete, confirm. Assert `removeCard` was called on store.
5. **Shimmer test**: Set card status to `thinking`. Assert shimmer overlay element is present in DOM.
6. **Error boundary test**: Force body renderer to throw. Assert fallback error UI renders instead of crashing.

## Acceptance Criteria

- [ ] Card reads data from Zustand store via `useCardData(cardId)`
- [ ] CardHeader, CardBody (placeholder), and ChatPanel compose correctly
- [ ] Design-system Card primitive wraps content with accent bar colored by type
- [ ] Chat panel toggles open/closed via header action button
- [ ] Shortname edits propagate to store
- [ ] Delete removes card from store
- [ ] Shimmer overlay renders when status is `thinking`
- [ ] Error boundary catches body renderer crashes
- [ ] All tests pass via `npx vitest run src/features/cards/__tests__/Card.test.tsx`

## Anti-Patterns

- Do not duplicate CardHeader logic -- delegate entirely to the CardHeader component
- Do not render type-specific body content here -- delegate to CardBody (task 06)
- Do not manage chat messages here -- delegate to ChatPanel (task 14)
- Do not use context providers for card data -- use Zustand selectors directly
- Do not inline styles -- use vanilla-extract CSS
