# Task 10: Hypothesis Body Renderer

## Dependencies

- **01-card-types**: `HypothesisContent`, `HypothesisResult`, `SuggestedQuery`
- **06-body-registry-note**: `CardBody` registry (register HypothesisBody)
- **design-system**: `Chip` component, typography tokens (serif font for claim)

## Context

The Hypothesis body renderer shows a structured display: the claim in a callout block using the Serif font, followed by AI analysis text (which may be streamed), and suggested queries as clickable chips (architecture/card.md > Body Rendering by Type > Hypothesis). The suggested query chips create new cards when clicked.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/bodies/HypothesisBody.tsx`** (~120 lines)
2. **`src/features/cards/bodies/HypothesisBody.css.ts`** (~60 lines)
3. **`src/features/cards/__tests__/HypothesisBody.test.tsx`** (~90 lines)

### Component Props

```typescript
interface HypothesisBodyProps {
  content: HypothesisContent;
  result: HypothesisResult | null;
  status: CardStatus;
  streamingContent?: string;
  onSuggestedQueryClick?: (query: SuggestedQuery) => void;
}
```

### SuggestedQuery Type

```typescript
interface SuggestedQuery {
  type: CardType;      // what kind of card to create
  label: string;       // chip display text
  content: string;     // query or code to populate the new card
}
```

### Rendering Structure

| Section | Detail |
|---------|--------|
| Claim callout | Block-quote style callout with left border accent. Serif font (Source Serif 4). Shows `content.claim`. |
| Evidence | If `content.evidence` is present, shown below claim in a smaller, muted text block |
| Domain tag | If `content.domain` is present, shown as a small tag/chip |
| Analysis text | `result.analysis` rendered as Markdown. During streaming, uses `streamingContent` with blinking cursor. |
| Confidence indicator | If `result.confidence` exists, show a simple label: "Confidence: {value}%" with a color scale (red < 0.4, amber 0.4-0.7, green > 0.7) |
| Suggested queries | `result.suggestedQueries` rendered as clickable `Chip` components. Each chip shows the query `label` and is colored by the suggested `type`. |
| No result | Skeleton placeholder when result is null and status is thinking/running |

### Claim Callout Styles

- Container: `borderLeft: 3px solid vars.color.inputType.hypothesis.fg`, `padding: 16px 20px`, `backgroundColor: vars.color.inputType.hypothesis.bg`
- Text: `fontFamily: vars.font.serif`, `fontSize: 18px`, `lineHeight: 1.5`, `fontStyle: italic`

### Suggested Query Chips

- Use design-system `Chip` component with `inputType` matching the suggested query's `type`
- On click, call `onSuggestedQueryClick(query)` which the parent card uses to create a new card
- Layout: `display: flex`, `flexWrap: wrap`, `gap: 8px`

## Demo Reference

**Vignette 1**: Hypothesis card shows "Soil depth correlates with microbial diversity in metagenome samples" in a serif callout block. Below it, analysis text explains the hypothesis. At the bottom, two chips: "SQL: Query depth vs diversity" (blue) and "Python: Plot correlation" (purple).

**Vignette 2**: User clicks the "SQL: Query depth vs diversity" chip. The `onSuggestedQueryClick` callback fires, and the parent creates a new SQL card pre-populated with the suggested query.

## Integration Proofs

1. **Render test**: Render with claim, analysis, 2 suggested queries. Assert callout visible, analysis text visible, 2 chips visible.
2. **Serif font test**: Assert claim callout element has `fontFamily` including Source Serif 4.
3. **Chip click test**: Click a suggested query chip. Assert `onSuggestedQueryClick` called with correct `SuggestedQuery` payload.
4. **Chip color test**: Render with a suggested query of type `sql`. Assert chip has SQL-type color styling.
5. **Evidence test**: Render with `content.evidence: 'Based on 2023 study'`. Assert evidence text visible.
6. **Confidence test**: Render with `result.confidence: 0.85`. Assert "Confidence: 85%" visible.
7. **No result test**: Render with `result: null`, `status: 'running'`. Assert skeleton shown.
8. **Streaming test**: Render with `streamingContent: 'partial analysis...'` and `status: 'running'`. Assert streaming content visible.

## Acceptance Criteria

- [ ] Claim renders in callout block with Serif font and left accent border
- [ ] Evidence text shown below claim when present
- [ ] Domain tag shown when present
- [ ] Analysis text rendered (supports Markdown)
- [ ] Confidence indicator shown when present with color coding
- [ ] Suggested queries rendered as colored Chip components
- [ ] Chip click fires `onSuggestedQueryClick` callback
- [ ] Skeleton shown when result is null
- [ ] Streaming content displayed during running status
- [ ] All styles use design tokens
- [ ] All tests pass

## Anti-Patterns

- Do not render analysis as plain text -- use a Markdown renderer (same one used by streaming content)
- Do not create new cards directly from this component -- fire the callback and let the parent handle it
- Do not hardcode hypothesis colors -- use `vars.color.inputType.hypothesis.*` tokens
- Do not use `font-style: italic` on the analysis text -- only the claim is italic
- Do not show suggested queries while status is thinking/running -- only after complete
