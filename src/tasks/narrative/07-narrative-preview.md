# Task 07: NarrativePreview Modal

## Dependencies

| Dependency | Domain | What's Needed |
|------------|--------|---------------|
| 01-narrative-store | narrative | `useIsPreviewOpen`, `openPreview`, `closePreview`, `useOrderedCardIds`, `useConnectiveText`, `useCompositionPayload` |
| 05-card-summary-reorder | narrative | Ordered card IDs populated in store |
| 06-connective-editor | narrative | Connective texts populated in store |
| Modal | design-system | Modal/dialog primitive with focus trap (or build minimal one) |
| Typography | design-system | Serif font (Source Serif 4) for document reading style |
| Card types | card | Card content/result shapes for full rendering |
| Workspace store | workspace | `useCard(id)` to read full card data |

## Context

The `NarrativePreview` is a full-screen modal overlay that shows a rendered, read-only view of the composed narrative as it would appear in its final shareable form. Cards are rendered in their composition order with connective text between them. Card content is shown in full (not truncated), styled for document reading with the serif body font (Source Serif 4).

The preview is opened from the "Preview" button in the composition panel header and closed via a "Close" button or pressing Escape.

## Implementation Requirements

### Files to Create

1. **`src/features/narrative/NarrativePreview.tsx`** (~150 lines)
2. **`src/features/narrative/NarrativePreview.css.ts`** (~100 lines)

### Component: `NarrativePreview`

| Section | Content |
|---------|---------|
| Header | "Narrative Preview" title, "Export" button (wired in task 08), "Close" button |
| Body | Scrollable document view: connective text and full card content interleaved |

### Document Rendering

The preview body renders a continuous document:

```
[Connective text 0 -- optional intro]
[Card 1 -- full content, document style]
[Connective text 1 -- transition]
[Card 2 -- full content, document style]
[Connective text 2 -- transition]
...
[Connective text N -- optional closing]
```

### Card Rendering in Preview

| Aspect | Detail |
|--------|--------|
| Content | Full card content (not truncated), rendered from `useCard(id)` |
| Type indicator | Subtle type badge above each card section |
| Typography | Body text in Source Serif 4 (serif), code in JetBrains Mono |
| Code blocks | Syntax-highlighted, full width |
| Tables | Full table rendering for SQL results |
| Figures | Inline images for Python output figures |
| Spacing | Generous vertical spacing between sections |

### Connective Text Rendering

| Aspect | Detail |
|--------|--------|
| Source | HTML from `connectiveTexts[index]` |
| Rendering | Render as sanitized HTML using DOMPurify. Do NOT use raw innerHTML without sanitization. |
| Typography | Source Serif 4, slightly smaller than card content |
| Empty | If connective text at a position is empty, render nothing (no placeholder) |

### Modal Behavior

| Aspect | Detail |
|--------|--------|
| Trigger | `useIsPreviewOpen === true` |
| Overlay | Semi-transparent dark backdrop |
| Size | Full viewport with padding (not literally edge-to-edge) |
| Scroll | Document body scrolls within the modal |
| Close | "Close" button in header, or press Escape |
| Focus trap | Focus stays within the modal while open |
| ARIA | `role="dialog"`, `aria-label="Narrative preview"` |
| Animation | Motion `AnimatePresence`: fade in overlay, scale up content from 0.95 to 1.0 |

### HTML Sanitization

Connective text is stored as HTML (from TipTap). Before rendering it in the preview:
- Use DOMPurify to sanitize the HTML
- Allow only: `<p>`, `<strong>`, `<em>`, `<a>` tags (matching the minimal TipTap config)
- Strip all other tags, attributes, and event handlers

### Accessibility

| Concern | Implementation |
|---------|---------------|
| Focus trap | On open, focus moves to the modal. Tab cycles within modal. |
| Escape | Pressing Escape calls `closePreview()` |
| Return focus | On close, focus returns to the "Preview" button that opened the modal |
| `role="dialog"` | On the modal container |
| `aria-label` | "Narrative preview" |
| `aria-modal` | `true` |

## Demo Reference

Vignette 5: the user clicks "Preview" and sees the composed narrative as a readable document.

## Integration Proofs

```bash
# Component renders and tests pass
npx vitest run src/features/narrative/NarrativePreview.test.tsx

# Tests verify:
# 1. Modal renders when previewOpen is true
# 2. Modal does not render when previewOpen is false
# 3. Cards rendered in orderedCardIds order with full content
# 4. Connective text rendered between cards (sanitized)
# 5. Close button calls closePreview
# 6. Escape key calls closePreview
# 7. Focus trap: Tab stays within modal
# 8. ARIA attributes present (role, aria-label, aria-modal)
# 9. Serif font applied to body text
# 10. HTML sanitization strips disallowed tags
```

### Test File

Create **`src/features/narrative/NarrativePreview.test.tsx`** (~120 lines) with:
- Visibility: modal renders when `previewOpen` is true
- Visibility: modal absent when `previewOpen` is false
- Content: cards appear in correct order
- Content: connective text rendered between cards
- Sanitization: script tags and event handlers stripped from connective text HTML
- Close: button calls `closePreview`
- Close: Escape key calls `closePreview`
- Accessibility: `role="dialog"`, `aria-label`, `aria-modal` present
- Accessibility: focus moves into modal on open

## Acceptance Criteria

- [ ] `NarrativePreview` renders as a full-screen modal overlay when `previewOpen` is true
- [ ] Cards are rendered in `orderedCardIds` order with full (non-truncated) content
- [ ] Connective text HTML is sanitized with DOMPurify before rendering
- [ ] Only `<p>`, `<strong>`, `<em>`, `<a>` tags are allowed in sanitized output
- [ ] Empty connective text positions render nothing (no placeholder)
- [ ] Document body uses Source Serif 4 serif font
- [ ] Code blocks use JetBrains Mono
- [ ] "Close" button calls `closePreview()`
- [ ] Escape key closes the modal
- [ ] Focus trap keeps Tab within the modal
- [ ] Focus returns to Preview button on close
- [ ] Modal has `role="dialog"`, `aria-label="Narrative preview"`, `aria-modal="true"`
- [ ] Motion animation on entry (fade + scale) and exit
- [ ] All tests pass: `npx vitest run src/features/narrative/NarrativePreview.test.tsx`

## Anti-Patterns

- Do NOT make the preview editable. It is strictly read-only. Editing happens in the composition panel.
- Do NOT fetch card data from the server for the preview. Read from the workspace Zustand store.
- Do NOT render TipTap editor instances for connective text in preview. Render the stored HTML directly (sanitized).
- Do NOT implement export logic in this component. The Export button is a callback prop wired in task 08.
- Do NOT render unsanitized HTML. Always sanitize connective text HTML with DOMPurify before insertion.
- Do NOT implement print styles in this task. That can be added later.
