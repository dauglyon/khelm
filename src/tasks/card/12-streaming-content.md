# Task 12: Streaming Content Renderer

## Dependencies

- **01-card-types**: `CardType`
- **02-card-store**: `useCardStreamingContent` selector
- **design-system**: typography tokens, CSS `pulse` keyframe (for cursor blink)

## Context

When a card is in `running` status and the backend streams results, content renders incrementally (architecture/card.md > Streaming Content Rendering). This component handles rendering streamed Markdown content with a blinking cursor, code block syntax highlighting hints, and auto-scroll behavior. It is used by card body renderers that support streaming (SQL, Python, Hypothesis).

The component subscribes to `streamingContent` from the card store and renders it as Markdown. A blinking cursor is appended during streaming. Auto-scroll keeps the latest content visible unless the user scrolls up.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/StreamingContent.tsx`** (~100 lines)
2. **`src/features/cards/StreamingContent.css.ts`** (~40 lines)
3. **`src/features/cards/__tests__/StreamingContent.test.tsx`** (~80 lines)

### Component Props

```typescript
interface StreamingContentProps {
  cardId: string;
  content: string;          // current streaming content (or final content)
  isStreaming: boolean;      // true while tokens are arriving
  cardType: CardType;        // used for code block language hint
  className?: string;
}
```

### Rendering Rules (per architecture spec)

| Rule | Implementation |
|------|---------------|
| Cursor | Blinking cursor (CSS `@keyframes`, 530ms interval) appended to last text node during streaming. Cursor is a `<span>` with `display: inline-block`, width 2px, height 1em, background current text color. |
| Markdown | Render streamed content as Markdown. Use a lightweight Markdown renderer that tolerates incomplete Markdown (unclosed bold, partial code blocks). Consider `react-markdown` or a similar library. |
| Code blocks | When Markdown contains fenced code blocks, apply language hint from `cardType` (e.g., `sql`, `python`) for basic formatting. Syntax highlighting is not required in this task. |
| Tables | Buffer table rows internally. Render table only after header row + at least one data row received (detect `|` pipe-table pattern). |
| Scroll | Auto-scroll the parent container to bottom during streaming. Pause auto-scroll if user scrolls up. Resume auto-scroll on new user interaction (click in card or new message). |

### Auto-Scroll Logic

```
1. Ref to scrollable container
2. On content change:
   a. If user has NOT scrolled up (scrollTop + clientHeight >= scrollHeight - threshold):
      scroll to bottom
   b. If user HAS scrolled up:
      do not scroll (user is reading earlier content)
3. Track user scroll: onScroll handler sets `userScrolledUp = true` when scroll position
   is more than 50px from bottom
4. Reset `userScrolledUp` on explicit user action (e.g., clicking in the card)
```

### Blinking Cursor Styles

- Cursor element: `display: inline-block`, `width: 2px`, `height: 1em`, `backgroundColor: currentColor`, `verticalAlign: text-bottom`
- Animation: CSS `@keyframes blink` with `0%, 100% { opacity: 1 }`, `50% { opacity: 0 }`, duration 530ms, infinite
- Cursor removed when `isStreaming` is false

## Demo Reference

**Vignette 1**: A Hypothesis card is in `running` status. Analysis text streams in word by word. A blinking cursor follows the last word. The card body auto-scrolls to keep the latest text visible.

**Vignette 2**: User scrolls up to re-read earlier content while streaming continues. Auto-scroll pauses. New text continues to append at the bottom but the viewport stays at the user's scroll position.

## Integration Proofs

1. **Basic render test**: Render `StreamingContent` with `content: '# Hello\n\nWorld'`, `isStreaming: false`. Assert Markdown renders as heading + paragraph.
2. **Cursor test**: Render with `isStreaming: true`. Assert blinking cursor element is present in DOM. Re-render with `isStreaming: false`. Assert cursor is gone.
3. **Incomplete Markdown test**: Render with `content: '**bold but not closed'`, `isStreaming: true`. Assert content renders without crashing (graceful degradation).
4. **Code block test**: Render with content containing a fenced code block. Assert `<pre><code>` elements render.
5. **Auto-scroll test**: Render in a fixed-height container. Append content that exceeds container height. Assert container scrollTop is at bottom.
6. **Scroll pause test**: Render, manually set scrollTop to top, append content. Assert scrollTop does NOT jump to bottom.

## Acceptance Criteria

- [ ] Markdown content renders correctly (headings, paragraphs, code blocks, lists)
- [ ] Incomplete Markdown does not crash the renderer
- [ ] Blinking cursor appended during streaming, removed when done
- [ ] Cursor blinks at 530ms interval via CSS keyframes
- [ ] Auto-scroll keeps latest content visible during streaming
- [ ] Auto-scroll pauses when user scrolls up
- [ ] Auto-scroll resumes on user interaction
- [ ] Table content buffered until header + 1 data row available
- [ ] All styles use design tokens
- [ ] All tests pass

## Anti-Patterns

- Do not use `setInterval` in React state for cursor blink -- use CSS `@keyframes`
- Do not re-parse the entire Markdown on every token -- the Markdown renderer handles incremental content
- Do not use `scrollIntoView` -- use `scrollTop` assignment for more control
- Do not put streaming buffer logic here -- this component receives content as a prop; buffering is in task 13
- Do not use `innerHTML` for Markdown rendering -- use a React Markdown component
