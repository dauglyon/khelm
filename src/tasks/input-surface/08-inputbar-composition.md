# 08 -- InputBar Composition

## Dependencies

| Dependency | Type | What it provides |
|------------|------|------------------|
| 02 (editor) | intra-domain | `SingleLineEditor` component |
| 04 (dropdown) | intra-domain | Suggestion dropdown wired into Mention extension |
| 06 (preview) | intra-domain | `ClassificationPreview` component |
| 07 (submit) | intra-domain | `useSubmitFlow` hook |
| 05 (classifier) | intra-domain | `createClassifier` for debounced classification |
| 01 (store) | intra-domain | `useInputSurfaceStore` for reading `isSubmitting` |
| app-shell | cross-domain | Layout slot for input bar; session context for `sessionId` |
| design-system | cross-domain | Surface, border, shadow tokens; button primitives |

## Context

InputBar is the final composition component that assembles all input surface sub-components into a single cohesive unit. It is the component that app-shell renders in the input bar layout slot. It wires the editor's `onUpdate` to the classifier, the classifier's results to the preview, and the editor's `onSubmit` to the submit flow.

Reference: `architecture/input-surface.md` (all sections, composed here).

## Implementation Requirements

### Files to create

1. `src/features/input-surface/InputBar.tsx` -- Composition component
2. `src/features/input-surface/inputBar.css.ts` -- vanilla-extract styles

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ [TypePill]  [  Editor text input area ...           ] [>]│
└──────────────────────────────────────────────────────────┘
```

| Element | Position | Component |
|---------|----------|-----------|
| Type indicator | Leading edge (left) | `ClassificationPreview` |
| Editor | Center, flex-grow | `SingleLineEditor` |
| Submit button | Trailing edge (right) | Button with send icon |

### Wiring

| Connection | Detail |
|------------|--------|
| Editor `onUpdate` | Feeds text to `classifier.classify(text)` |
| Editor `onSubmit` | Calls `submitFlow.submit()` |
| Classifier | Created via `createClassifier(store)` on mount; `destroy()` on unmount |
| Preview | Reads from store autonomously (no props needed) |
| Submit button | Calls `submitFlow.submit()`; disabled when `isSubmitting` or editor is empty |
| Health check | `classifier.checkHealth()` called once on mount |

### Suggestion card source

Provide the card list to the suggestion dropdown. For now, accept a `cards` prop:

```tsx
interface InputBarProps {
  sessionId: string;
  cards?: SuggestionCard[];
  onCardCreated?: (payload: CardCreationPayload) => void;
  onError?: (error: Error) => void;
}
```

### Submit button

| Aspect | Specification |
|--------|---------------|
| Icon | Right-arrow or send icon |
| Disabled | When editor is empty or `isSubmitting` is true |
| Loading | Spinner replaces icon when `isSubmitting` |
| Accessible | `aria-label="Submit"`, `type="button"` |

### Styling

- Full-width bar at bottom of workspace viewport
- Surface background with subtle border and shadow
- Rounded corners
- Responsive: min-width accommodates type pill + submit button; editor fills remaining space

### Lifecycle

| Event | Action |
|-------|--------|
| Mount | Create classifier, run health check, auto-focus editor |
| Unmount | Destroy classifier (cancel pending debounce, abort in-flight) |
| `sessionId` change | Reset store, clear editor |

## Demo Reference (Vignette 1 -- The Core Loop)

The InputBar is the physical manifestation of the core loop. The user sees a single input bar at the bottom of the screen. They type, the type pill appears on the left, and pressing Enter (or clicking the send button) submits the card. The bar clears and is ready for the next input.

## Integration Proofs

```bash
# InputBar composes all sub-components and wires them
vitest run src/features/input-surface/InputBar --reporter=verbose

# Verify: InputBar renders editor, classification preview, and submit button
# Verify: typing in editor triggers classifier (mock classifier, check call)
# Verify: pressing Enter triggers submit flow
# Verify: clicking submit button triggers submit flow
# Verify: submit button is disabled when editor is empty
# Verify: submit button shows spinner when isSubmitting
# Verify: classifier health check runs on mount
# Verify: classifier is destroyed on unmount
```

### Render test

```tsx
render(
  <InputBar
    sessionId="test-session"
    cards={[{ id: '1', shortname: 'query-1', title: 'Soil query', type: 'sql' }]}
    onCardCreated={vi.fn()}
  />
);

// Editor is present and focusable
expect(screen.getByRole('textbox')).toBeInTheDocument();

// Submit button is present but disabled (empty editor)
expect(screen.getByLabelText('Submit')).toBeDisabled();
```

## Acceptance Criteria

- [ ] `InputBar` renders `ClassificationPreview`, `SingleLineEditor`, and submit button
- [ ] Layout: type indicator left, editor center, submit button right
- [ ] Editor `onUpdate` feeds the classifier
- [ ] Editor `onSubmit` triggers the submit flow
- [ ] Submit button calls `submit()` and is disabled when appropriate
- [ ] Submit button shows loading state during submission
- [ ] Classifier is created on mount with health check
- [ ] Classifier is destroyed on unmount (no leaked debounce/fetch)
- [ ] `cards` prop is passed to suggestion dropdown
- [ ] `sessionId` is passed to submit flow
- [ ] Session change resets state and editor
- [ ] Component is styled as a full-width bar with design-system tokens
- [ ] Accessible: submit button has aria-label

## Anti-Patterns

- Do not re-implement any sub-component logic here. InputBar is purely composition and wiring.
- Do not create a new Zustand store. Use the existing `useInputSurfaceStore`.
- Do not add layout logic beyond the input bar itself. The workspace layout is app-shell's responsibility.
- Do not handle WebSocket events here. Card creation events are handled by the workspace domain.
