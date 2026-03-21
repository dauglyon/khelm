# Workspace Domain Tasks

The workspace domain implements the primary visual surface of The Helm: a virtualized masonry card grid powered by `@tanstack/react-virtual` with Zustand-managed session state. It handles responsive column layout, card container positioning and measurement, enter animations via Motion, shared-element detail transitions via `layoutId`, cross-card reference pills, keyboard navigation, and accessibility. The workspace renders inside the app shell's main region and provides the container into which card-domain components render.

## Implementation Targets

| Target | File(s) | Lines (est.) |
|--------|---------|-------------|
| Session Zustand store | `src/features/workspace/store/sessionStore.ts` | ~200 |
| Store selectors & hooks | `src/features/workspace/store/selectors.ts` | ~80 |
| Masonry grid component | `src/features/workspace/MasonryGrid.tsx`, `MasonryGrid.css.ts` | ~250 |
| Card container wrapper | `src/features/workspace/CardContainer.tsx`, `CardContainer.css.ts` | ~120 |
| Detail overlay | `src/features/workspace/DetailOverlay.tsx`, `DetailOverlay.css.ts` | ~100 |
| Reference pill | `src/features/workspace/ReferencePill.tsx`, `ReferencePill.css.ts` | ~80 |
| Workspace panel (composition root) | `src/features/workspace/WorkspacePanel.tsx` | ~60 |
| Column calculator hook | `src/features/workspace/hooks/useColumnCount.ts` | ~50 |
| Tests | `src/features/workspace/**/*.test.ts(x)` | ~400 |

## Task Table

| ID | Summary | Deps | Status | Preflight |
|----|---------|------|--------|-----------|
| WS-01 | Session store: Zustand store with CardState map, order, actions | design-system (types only) | planned | Types compile, store actions pass unit tests |
| WS-02 | Store selectors and React hooks | WS-01 | planned | Selectors return correct slices, re-render isolation verified |
| WS-03 | Column count hook with ResizeObserver | design-system (tokens) | planned | Hook returns correct column count at each breakpoint |
| WS-04 | Masonry grid layout with @tanstack/react-virtual lanes | WS-02, WS-03 | planned | Grid positions cards in shortest-column-first order |
| WS-05 | Card container with measurement and positioning | WS-04 | planned | Container applies absolute position, measureElement ref works |
| WS-06 | Enter animations on card containers | WS-05, WS-02 | planned | First-render cards animate in; re-entering cards do not |
| WS-07 | Detail overlay with layoutId transition | WS-02, design-system (Card) | planned | Opening detail animates card from grid position to overlay |
| WS-08 | Cross-card reference pills | WS-02, design-system (Chip) | planned | Pill renders with type color, click scrolls to target card |
| WS-09 | Keyboard navigation and accessibility | WS-04, WS-02 | planned | Arrow keys move activeCardId, ARIA attributes present |
| WS-10 | WorkspacePanel composition and integration | WS-04 through WS-09 | planned | Full workspace renders with mock cards, all features work |

## Critical Path

```
design-system (tokens, types)
       |
   WS-01  Session Store
       |
   WS-02  Selectors & Hooks
      / \
 WS-03   |
(col ct)  |
     \   |
   WS-04  Masonry Grid
       |
   WS-05  Card Container
      /|\
     / | \
WS-06 WS-07 WS-09
(anim)(detail)(a11y)
     \  |   /
      \ |  /      WS-08 (pills, parallel with WS-06/07)
       \| /        /
      WS-10  WorkspacePanel
```

## Parallelism Opportunities (Waves)

| Wave | Tasks | Notes |
|------|-------|-------|
| 1 | WS-01, WS-03 | Store and column hook have no mutual dependency |
| 2 | WS-02 | Depends on WS-01 |
| 3 | WS-04 | Depends on WS-02 + WS-03 |
| 4 | WS-05 | Depends on WS-04 |
| 5 | WS-06, WS-07, WS-08, WS-09 | All depend on WS-05 or WS-02 but not on each other |
| 6 | WS-10 | Integration of all prior tasks |
