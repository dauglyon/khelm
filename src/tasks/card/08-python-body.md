# Task 08: Python Body Renderer

## Dependencies

- **01-card-types**: `PythonContent`, `PythonResult`, `Figure`
- **06-body-registry-note**: `CardBody` registry (register PythonBody)
- **design-system**: typography tokens (`font.mono`)

## Context

The Python body renderer shows a code block with the Python code, followed by stdout/stderr output panels, and inline figure images (architecture/card.md > Body Rendering by Type > Python). Stderr is visually distinct from stdout (error styling). Figures are rendered as inline images below the output.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/bodies/PythonBody.tsx`** (~130 lines)
2. **`src/features/cards/bodies/PythonBody.css.ts`** (~60 lines)
3. **`src/features/cards/__tests__/PythonBody.test.tsx`** (~90 lines)

### Component Props

```typescript
interface PythonBodyProps {
  content: PythonContent;
  result: PythonResult | null;
  status: CardStatus;
  streamingContent?: string;
}
```

### Rendering Structure

| Section | Detail |
|---------|--------|
| Code block | `<pre><code>` with `content.code`. Font: JetBrains Mono. Horizontal scroll. |
| Stdout panel | Monospace output block showing `result.stdout`. Label: "Output". White/surface background. |
| Stderr panel | Monospace output block showing `result.stderr`. Label: "Errors". Light red background (`color.status.error` at 10% opacity). Only shown if stderr is non-empty. |
| Return value | If `result.returnValue` is non-null, show a small "Return:" label with the JSON-stringified value |
| Figures | `result.figures` rendered as `<img>` elements below output. Each figure has `src` (data URL or URL), `alt` text, optional `caption`. Max width: 100% of card body. |
| No result | When `result === null` and status is thinking/running, show skeleton placeholder |

### Figure Type

```typescript
interface Figure {
  src: string;      // data URI or URL
  alt: string;      // alt text
  caption?: string;  // optional caption below image
  width?: number;
  height?: number;
}
```

### Styles

- Code block: same as SQL body (monospace, padded, scrollable)
- Stdout: `padding: 12px`, `fontFamily: vars.font.mono`, `fontSize: 13px`, `whiteSpace: pre-wrap`
- Stderr: same as stdout but `backgroundColor` tinted with error color, `color: vars.color.status.error`
- Figure container: `display: flex`, `flexDirection: column`, `gap: 12px`, `marginTop: 12px`
- Figure img: `maxWidth: 100%`, `borderRadius: 4px`, `border: 1px solid vars.color.border`
- Figure caption: `fontSize: bodySm`, `color: vars.color.textMid`, `textAlign: center`

## Demo Reference

**Vignette 1**: Python card shows code `import pandas as pd; df.describe()`, then an "Output" section with tabular statistics, then a matplotlib figure rendered inline as an image.

**Vignette 2**: Python code raises an exception. The "Output" section is empty. The "Errors" section shows a red-tinted panel with the traceback.

## Integration Proofs

1. **Render test**: Render with code, stdout, empty stderr, one figure. Assert code block, output section, and image all render.
2. **Stderr test**: Render with non-empty stderr. Assert error-styled panel appears with stderr content.
3. **No stderr test**: Render with empty stderr. Assert no error panel in DOM.
4. **Figures test**: Render with 2 figures. Assert 2 `<img>` elements with correct `src` and `alt`.
5. **Return value test**: Render with `returnValue: { count: 42 }`. Assert "Return:" label and JSON string visible.
6. **No result test**: Render with `result: null`, `status: 'running'`. Assert skeleton placeholder shown.

## Acceptance Criteria

- [ ] Python code renders in JetBrains Mono code block
- [ ] Stdout rendered in monospace output panel with "Output" label
- [ ] Stderr rendered in error-styled panel with "Errors" label (only when non-empty)
- [ ] Figures rendered as inline `<img>` elements with alt text and optional captions
- [ ] Return value displayed when non-null
- [ ] Placeholder/skeleton shown when result is null
- [ ] All styles use design tokens
- [ ] All tests pass

## Anti-Patterns

- Do not syntax-highlight Python code yet -- plain monospace (syntax highlighting is a future enhancement)
- Do not execute Python code in the browser -- this is a renderer only
- Do not render raw HTML -- render stdout/stderr as text content in pre elements
- Do not lazy-load figures -- they are small and inline
- Do not show stderr section when stderr is empty string
