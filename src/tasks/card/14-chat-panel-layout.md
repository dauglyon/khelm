# Task 14: Chat Panel Layout and Messages

## Dependencies

- **01-card-types**: `Message`, `MessageRole`, `MessageStatus`
- **design-system**: `TextInput`, `IconButton`, `Button`, Motion (`AnimatePresence`, `panelSlide` variant)

## Context

Each card has an inline chat panel for error recovery, context injection, and discussion (architecture/card.md > Inline Chat Panel). This task builds the panel layout: the slide-in container, the message list, the input field, and the action bar. Transport (SSE) and store integration are separate tasks (15-17).

The panel slides in from the right edge of the card. Width is 320px or 40% of card width, whichever is larger. Messages are rendered by role: user messages right-aligned, AI messages left-aligned, system messages hidden.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/ChatPanel.tsx`** (~140 lines)
2. **`src/features/cards/ChatMessage.tsx`** (~60 lines)
3. **`src/features/cards/ChatPanel.css.ts`** (~70 lines)
4. **`src/features/cards/__tests__/ChatPanel.test.tsx`** (~100 lines)

### ChatPanel Props

```typescript
interface ChatPanelProps {
  cardId: string;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  onSendMessage: (text: string) => void;
  onAbort: () => void;
  onRetry: () => void;
  onClose: () => void;
}
```

### Panel Layout

| Element | Detail |
|---------|--------|
| Container | Anchored to right side of card. Width: `max(320px, 40%)`. Motion `AnimatePresence` for enter/exit. Slide from right with `panelSlide` variant. |
| Close button | IconButton (X) at top-right corner. Calls `onClose`. |
| Message list | Scrollable list of messages. Auto-scroll to bottom on new messages. Pause if user scrolls up. |
| Input field | Single-line `TextInput` at bottom with send IconButton. Disabled while `isStreaming`. |
| Action bar | Below input: Abort button (visible during streaming), Retry button (visible after error or completion). |

### ChatMessage Component

```typescript
interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}
```

| Role | Alignment | Style |
|------|-----------|-------|
| `user` | Right-aligned | Surface background, rounded corners (left rounded, right square at edge) |
| `assistant` | Left-aligned | Slightly different background, rounded corners (right rounded, left square at edge) |
| `system` | Not rendered | System messages are hidden from the user |

| Message Status | Visual |
|----------------|--------|
| `pending` | Subtle opacity (0.7) until confirmed |
| `streaming` | Blinking cursor appended to content |
| `complete` | Normal rendering |
| `error` | Red-tinted background, error icon |
| `aborted` | Normal text + "(stopped)" suffix in muted text |

### Enter/Exit Animation

- Panel uses Motion `AnimatePresence` with `panelSlide` variant from design-system
- Enter: slide from right (`x: '100%'` to `x: '0'`), 200ms, out easing
- Exit: slide to right (`x: '0'` to `x: '100%'`), 150ms

### Auto-Scroll (Message List)

Same pattern as StreamingContent (task 12):
- Scroll to bottom on new messages
- Pause if user scrolls up more than 50px from bottom
- Resume on new user message send

### Focus Management (Accessibility)

- Opening panel moves focus to the input field
- Closing panel returns focus to the chat action button in the card header
- Escape key closes the panel

## Demo Reference

**Vignette 1**: User clicks the chat icon on a card. The panel slides in from the right. The message list is empty. The input field is focused. User types "Why did this query fail?" and clicks send. The message appears right-aligned.

**Vignette 2**: AI is streaming a response. The assistant message shows text appearing with a blinking cursor. The input field is disabled. The Abort button is visible. User clicks Abort. The partial response stays with "(stopped)" text. Input re-enables.

## Integration Proofs

1. **Render test**: Render `ChatPanel` with 3 messages (user, assistant, user). Assert all 3 visible, correct alignment.
2. **System message hidden test**: Include a system message. Assert it is not visible in DOM.
3. **Send test**: Type in input, click send button. Assert `onSendMessage` called with input text. Assert input cleared.
4. **Enter key test**: Type in input, press Enter. Assert `onSendMessage` called.
5. **Disabled during streaming test**: Render with `isStreaming: true`. Assert input is disabled. Assert Abort button visible.
6. **Abort test**: Click Abort button. Assert `onAbort` called.
7. **Retry test**: Render with `isStreaming: false` and an error message. Assert Retry button visible. Click it. Assert `onRetry` called.
8. **Close test**: Click close button. Assert `onClose` called.
9. **Escape key test**: Press Escape while panel is open. Assert `onClose` called.
10. **Focus test**: Render panel. Assert input field has focus.

## Acceptance Criteria

- [ ] Panel slides in from right with Motion animation
- [ ] Panel width is `max(320px, 40%)` of card width
- [ ] Messages render with correct alignment by role
- [ ] System messages are hidden
- [ ] Message statuses render with correct visual treatment
- [ ] Input field at bottom with send button
- [ ] Input disabled during streaming
- [ ] Abort button visible during streaming
- [ ] Retry button visible after error/completion
- [ ] Auto-scroll to bottom on new messages
- [ ] Auto-scroll pauses when user scrolls up
- [ ] Focus moves to input on open, back to trigger on close
- [ ] Escape key closes panel
- [ ] All tests pass

## Anti-Patterns

- Do not manage message state here -- receive via props (store integration is task 17)
- Do not implement SSE transport here -- that is task 15
- Do not use a chat library (e.g., stream-chat) -- custom implementation per spec
- Do not use position: fixed for the panel -- it is relative to the card
- Do not use portals -- the panel is inline within the card DOM tree
