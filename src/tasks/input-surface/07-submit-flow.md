# 07 -- Submit Flow

## Dependencies

| Dependency | Type | What it provides |
|------------|------|------------------|
| 02 (editor) | intra-domain | `onSubmit` callback with text and JSON; `editorRef` for clearing |
| 05 (classifier) | intra-domain | Classification result in store (resolved type) |
| 06 (preview) | intra-domain | User may have overridden the type via preview |
| 01 (store) | intra-domain | `resolvedType`, `isSubmitting`, `reset()` |
| app-shell | cross-domain | `sessionId` from session context |

## Context

The submit flow is triggered when the user presses Enter or clicks the submit button. It reads the resolved type from the store, extracts structured content from the editor, constructs the card creation payload, dispatches it, and resets the input. This task wires up the submission logic and error handling.

Reference: `architecture/input-surface.md` section 5 (Submit Flow).

## Implementation Requirements

### Files to create

1. `src/features/input-surface/submit/useSubmitFlow.ts` -- Custom hook for submission logic
2. `src/features/input-surface/submit/useSubmitFlow.test.ts` -- Unit tests

### Submit trigger

| Action | Result |
|--------|--------|
| Enter (input focused, no dropdown open) | Submit current input |
| Empty input + Enter | No-op (do not submit) |
| Click submit button | Submit current input (button is in task 08) |

### Submit sequence

| Step | Detail |
|------|--------|
| 1. Guard | If input is empty or `isSubmitting` is true, return early |
| 2. Resolve type | Read `resolvedType` from store (`userOverrideType ?? classifiedType`) |
| 3. Fallback type | If `resolvedType` is null, prompt user to select type (do not submit) |
| 4. Extract content | `editor.getJSON()` for structured content |
| 5. Extract mentions | Parse mention nodes from JSON to build `mentions[]` array |
| 6. Set submitting | `store.setIsSubmitting(true)` |
| 7. Create card | POST to card creation API with payload |
| 8. Optimistic UI | Emit event / call callback for workspace to add placeholder card |
| 9. Clear input | `editor.commands.clearContent()` and `store.reset()` |
| 10. Unset submitting | `store.setIsSubmitting(false)` |

### Card creation payload

```ts
interface CardCreationPayload {
  type: InputType;
  content: JSONContent;  // TipTap JSON document
  mentions: Array<{ cardId: string; label: string }>;
  sessionId: string;
}
```

### Mention extraction

Walk the TipTap JSON tree, collect all nodes of type `mention`, and extract `{ cardId: node.attrs.id, label: node.attrs.label }`.

### Error handling

| Scenario | Behavior |
|----------|----------|
| API unreachable | Show error via callback (toast); keep input content, do not clear |
| No resolved type | Return early; classification preview should prompt user to select |
| Network error | Set `isSubmitting(false)`; do not clear input |

### Hook API

```ts
function useSubmitFlow(options: {
  editorRef: React.MutableRefObject<Editor | null>;
  sessionId: string;
  onCardCreated?: (payload: CardCreationPayload) => void;
  onError?: (error: Error) => void;
}): {
  submit: () => Promise<void>;
  isSubmitting: boolean;
}
```

### API call

For now, the API call is abstracted behind the `onCardCreated` callback. The actual POST to the card creation endpoint will be wired when the API layer is available. In the interim, `onCardCreated` receives the payload and the hook considers submission successful.

## Demo Reference (Vignette 1 -- The Core Loop)

The user types a SQL query, the classifier identifies it as SQL, and pressing Enter triggers the submit flow. The payload is sent, a placeholder card appears in the workspace (optimistic UI via `onCardCreated`), the input clears, and the card enters "thinking" state.

## Integration Proofs

```bash
# Submit flow constructs payload and resets state
vitest run src/features/input-surface/submit --reporter=verbose

# Verify: empty input does not trigger submit
# Verify: submit reads resolvedType from store
# Verify: submit extracts mentions from TipTap JSON
# Verify: submit calls onCardCreated with correct payload
# Verify: editor is cleared after successful submit
# Verify: store is reset after successful submit
# Verify: isSubmitting is true during submission, false after
# Verify: error in submission does not clear input
# Verify: null resolvedType prevents submission
```

### Test setup

```ts
// Create a mock editor with getJSON/clearContent
const mockEditor = {
  getJSON: () => ({
    type: 'doc',
    content: [
      { type: 'text', text: 'SELECT * FROM ' },
      { type: 'mention', attrs: { id: 'card-1', label: 'query-1' } },
    ],
  }),
  commands: { clearContent: vi.fn() },
  isEmpty: false,
};
```

## Acceptance Criteria

- [ ] `useSubmitFlow` hook returns `submit` function and `isSubmitting` state
- [ ] Empty editor does not trigger submission
- [ ] `submit` reads `resolvedType` from the Zustand store
- [ ] If `resolvedType` is null, submission is blocked
- [ ] Mentions are extracted from TipTap JSON tree
- [ ] Payload includes `type`, `content`, `mentions`, `sessionId`
- [ ] `onCardCreated` callback is called with the payload on success
- [ ] Editor is cleared after successful submission
- [ ] Store is reset after successful submission
- [ ] `isSubmitting` is true during flight, false after completion
- [ ] On error: input is NOT cleared, `onError` callback is called
- [ ] Double-submit is prevented via `isSubmitting` guard

## Anti-Patterns

- Do not make the actual API call in this hook. Use the `onCardCreated` callback as an abstraction boundary. The real API integration comes later.
- Do not clear the editor before the submission succeeds. Clear only on success.
- Do not bypass the store for resolved type. Always read `resolvedType` from the store.
- Do not handle WebSocket broadcasting here. That is the collaboration domain's responsibility.
