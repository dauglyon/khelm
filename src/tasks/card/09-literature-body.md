# Task 09: Literature Body Renderer

## Dependencies

- **01-card-types**: `LiteratureContent`, `LiteratureResult`, `Publication`
- **06-body-registry-note**: `CardBody` registry (register LiteratureBody)
- **design-system**: typography tokens, design tokens

## Context

The Literature body renderer shows a list of publication cards: title, authors (truncated), year, source (architecture/card.md > Body Rendering by Type > Literature). Each item is clickable to expand its abstract. The total count is displayed versus the number of items shown.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/bodies/LiteratureBody.tsx`** (~130 lines)
2. **`src/features/cards/bodies/LiteratureBody.css.ts`** (~70 lines)
3. **`src/features/cards/__tests__/LiteratureBody.test.tsx`** (~90 lines)

### Component Props

```typescript
interface LiteratureBodyProps {
  content: LiteratureContent;
  result: LiteratureResult | null;
  status: CardStatus;
}
```

### Publication Type

```typescript
interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: string;        // journal or database name
  abstract?: string;
  doi?: string;
  url?: string;
}
```

### Rendering Structure

| Section | Detail |
|---------|--------|
| Search terms display | Shows `content.searchTerms` as small chips/tags at top |
| Publication list | Scrollable list of publication items |
| Publication item | Title (bold, clickable), authors (truncated to 3, then "et al."), year, source |
| Expandable abstract | Clicking a publication item toggles its abstract (Motion `AnimatePresence` for smooth expand/collapse) |
| Count display | "Showing {hits.length} of {totalCount} results" |
| No result | Skeleton placeholder when `result === null` and status is thinking/running |

### Publication Item Layout

```
┌──────────────────────────────────────────┐
│ Title of the Publication (bold, link)    │
│ Smith J, Doe A, Lee B et al. · 2024     │
│ Nature Biotechnology                     │
│                                          │
│ [expanded abstract text if clicked]      │
└──────────────────────────────────────────┘
```

### Styles

- Publication list: `display: flex`, `flexDirection: column`, `gap: 4px`
- Publication item: `padding: 12px`, `borderRadius: 4px`, `cursor: pointer`, hover background
- Title: `fontWeight: 600`, `fontSize: body`, `color: vars.color.text`
- Authors/year: `fontSize: bodySm`, `color: vars.color.textMid`
- Source: `fontSize: bodySm`, `color: vars.color.textLight`, `fontStyle: italic`
- Abstract: `fontSize: bodySm`, `color: vars.color.text`, `marginTop: 8px`, `lineHeight: 1.6`
- Expand/collapse: Motion `AnimatePresence` with height animation (200ms, out easing)
- Count: `fontSize: caption`, `color: vars.color.textLight`, `padding: 8px 0`

## Demo Reference

**Vignette 1**: Literature card shows search terms "metagenome", "soil microbiome" as chips, then 10 publication items with titles, authors, and years. Footer: "Showing 10 of 247 results".

**Vignette 2**: User clicks a publication title. The abstract smoothly expands below it. Clicking again collapses it.

## Integration Proofs

1. **Render test**: Render with 3 publications. Assert 3 items visible with titles, authors, years.
2. **Author truncation test**: Render a publication with 6 authors. Assert first 3 shown + "et al.".
3. **Expand abstract test**: Click a publication item. Assert abstract text becomes visible.
4. **Collapse test**: Click the same item again. Assert abstract is hidden.
5. **Count test**: Render with `hits.length: 10`, `totalCount: 247`. Assert "Showing 10 of 247 results".
6. **Search terms test**: Render with `content.searchTerms: ['metagenome', 'soil']`. Assert chips/tags visible.
7. **No result test**: Render with `result: null`, `status: 'thinking'`. Assert skeleton shown.

## Acceptance Criteria

- [ ] Search terms displayed as chips/tags
- [ ] Publication list renders with title, truncated authors, year, source
- [ ] Authors truncated to 3 with "et al." when more exist
- [ ] Clicking a publication expands its abstract with animation
- [ ] Clicking again collapses the abstract
- [ ] Result count ("Showing X of Y results") displayed
- [ ] Skeleton placeholder shown when result is null
- [ ] All styles use design tokens
- [ ] All tests pass

## Anti-Patterns

- Do not use an accordion library -- simple local state + AnimatePresence is sufficient
- Do not open multiple abstracts simultaneously (one at a time, or allow multiple -- spec is ambiguous, default to allowing multiple)
- Do not fetch full publication data -- this is a renderer for data already in the result
- Do not use external link navigation for DOI/URL yet -- just display them as text
- Do not hardcode publication count -- derive from `result.hits.length` and `result.totalCount`
