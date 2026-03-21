# Narrative Domain -- Task Breakdown

The narrative domain enables users to select cards from their workspace, arrange them into a composed sequence with connective text between them, preview the resulting document, and export it. It introduces a "composition mode" that transforms the workspace from a masonry grid into a compressed card list alongside a side panel where ordering, connective text editing, and preview/export controls live. All narrative state is managed in a dedicated Zustand store slice, with dnd-kit handling drag reorder and TipTap powering the connective text editors.

## Implementation Targets

| Target | File(s) | Lines (est.) |
|--------|---------|-------------|
| Narrative store | `src/features/narrative/narrativeStore.ts` | ~120 |
| Composition toolbar controls | `src/features/narrative/CompositionToolbar.tsx`, `.css.ts` | ~150 |
| Card list view (composition mode) | `src/features/narrative/CardListView.tsx`, `.css.ts` | ~180 |
| Composition panel shell | `src/features/narrative/CompositionPanel.tsx`, `.css.ts` | ~200 |
| Card summary + drag reorder | `src/features/narrative/CardSummary.tsx`, `.css.ts` | ~250 |
| Connective text editor | `src/features/narrative/ConnectiveEditor.tsx`, `.css.ts` | ~180 |
| Narrative preview modal | `src/features/narrative/NarrativePreview.tsx`, `.css.ts` | ~250 |
| Export API + MSW mocks | `src/features/narrative/narrativeApi.ts`, `src/mocks/narrativeHandlers.ts` | ~200 |

## Task Table

| ID | Summary | Deps | Status | Preflight |
|----|---------|------|--------|-----------|
| 01 | Narrative Zustand store (state, actions, selectors) | workspace (store shape), card (CardStatus type) | pending | workspace store exists, card types exported |
| 02 | Composition mode toggle (toolbar controls) | 01, design-system (Button, IconButton), app-shell (toolbar slot) | pending | narrative store importable, toolbar renders |
| 03 | CardListView (compressed single-column card list with checkboxes) | 01, 02, workspace (card container), card (Card component) | pending | composition mode toggleable, cards render |
| 04 | CompositionPanel shell (side panel layout, empty state, header) | 01, 02, design-system (layout primitives) | pending | composition mode toggleable |
| 05 | CardSummary + drag reorder (dnd-kit sortable list) | 01, 04, card (CardType, type colors) | pending | panel renders, store has orderedCardIds |
| 06 | ConnectiveEditor (TipTap minimal instances between cards) | 01, 05, input-surface (TipTap base config) | pending | card summaries render in order |
| 07 | NarrativePreview modal (full-screen rendered document) | 01, 05, 06, design-system (Modal, typography) | pending | ordered cards + connective text in store |
| 08 | Export API integration (Orval types, MSW handlers, async flow) | 01, 07 | pending | preview renders, store has composition payload |

## Critical Path

```
01-narrative-store
  |
  +---> 02-composition-toggle
  |       |
  |       +---> 03-card-list-view
  |       |
  |       +---> 04-composition-panel
  |               |
  |               +---> 05-card-summary-reorder
  |                       |
  |                       +---> 06-connective-editor
  |                               |
  |                               +---> 07-narrative-preview
  |                                       |
  |                                       +---> 08-export-api
```

## Parallelism Opportunities

| Wave | Tasks | Notes |
|------|-------|-------|
| Wave 1 | 01 | Foundation -- store must exist before any UI |
| Wave 2 | 02 | Composition toggle depends only on store |
| Wave 3 | 03, 04 | CardListView and CompositionPanel are independent siblings; both need composition mode |
| Wave 4 | 05 | CardSummary + reorder needs the panel shell |
| Wave 5 | 06 | ConnectiveEditor slots between card summaries |
| Wave 6 | 07 | Preview needs ordered cards + connective text |
| Wave 7 | 08 | Export API needs preview to be functional |

Wave 3 is the main parallelism opportunity: the card list (left side) and composition panel (right side) can be built simultaneously since they share only the store from task 01 and the mode toggle from task 02.
