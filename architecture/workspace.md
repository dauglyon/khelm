# Workspace Domain Spec

The workspace is the primary visual surface of The Helm. It renders session cards in a masonry grid, manages their ordering and selection state, supports cross-card references, and animates card transitions.

## Scope

| In Scope | Out of Scope |
|----------|-------------|
| Masonry card grid layout | Card internals (see card domain) |
| Virtualization and overscan | Input surface / classification |
| Card container (grid cell wrapper) | Collaboration / multi-user sync |
| Session state (Zustand store) | Drag-and-drop reordering (dnd-kit) |
| Cross-card references (shortname pills) | Narrative composition |
| Enter / detail-transition animations | Streaming content rendering |

## Technology

| Concern | Library | Why |
|---------|---------|-----|
| Masonry positioning | `@tanstack/react-virtual` | Lanes API for column assignment; headless; 4.6M weekly downloads |
| Session state | Zustand | External `setState` for SSE/WS; selector isolation per card; 1.2 KB |
| Enter animations | Motion (`motion.div`) | `initial` / `animate` for fade+slide on mount |
| Detail transitions | Motion `layoutId` | Shared-element FLIP between grid card and detail panel |
| Server-fetched card data | TanStack Query | Caching, refetch, stale-while-revalidate for persisted cards |

## Masonry Grid

### Layout Algorithm

The grid uses `@tanstack/react-virtual`'s `lanes` option to distribute cards across columns using a shortest-column-first algorithm.

| Parameter | Value | Notes |
|-----------|-------|-------|
| Column count | Responsive breakpoints | Derived from container width and a minimum column width token |
| Column gap | Design token `space.gridGap` | Consistent with design system |
| Row gap | Design token `space.gridGap` | Same as column gap |
| Item height | Measured per card | `measureElement` callback on each card container |
| Lane assignment | Shortest-column-first | Custom `getItemLane` that picks the lane with the smallest cumulative height |

### Positioning

Cards are absolutely positioned within a scrollable container. Each card's `top` and `left` are computed from its lane index and the cumulative height of prior items in that lane.

| Property | Source |
|----------|--------|
| `left` | `laneIndex * (columnWidth + gap)` |
| `top` | Sum of heights of all prior items in the same lane, plus gap per item |
| `width` | `columnWidth` (uniform across lanes) |
| `height` | Measured via `measureElement` |

### Responsive Breakpoints

| Container Width | Columns |
|----------------|---------|
| < 640px | 1 |
| 640 - 1023px | 2 |
| 1024 - 1439px | 3 |
| >= 1440px | 4 |

Column count is derived from container width, not viewport width. Use `ResizeObserver` on the grid container.

## Virtualization

### Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Overscan (above) | 1.5x viewport height | Generous buffer minimizes pop-in during normal scrolling |
| Overscan (below) | 2x viewport height | Larger below because users scroll down more than up |
| Scroll container | Workspace panel element | Not `window`; the workspace is one panel in the app shell |
| Estimated item size | 280px | Used before measurement; tuned to average card height |

### Virtualization Behavior

| Aspect | Behavior |
|--------|----------|
| DOM node count | Constant (~40-80 nodes) regardless of total card count |
| Off-screen cards | Not in DOM; React does not render them |
| Scroll direction | Vertical only |
| First-render tracking | Each card ID tracks whether it has been rendered before; re-entering viewport does not replay enter animation |

## Card Container

The card container is a `motion.div` wrapper rendered for each virtual item. It is the grid cell; the card component renders inside it.

### Responsibilities

| Responsibility | Detail |
|----------------|--------|
| Positioning | Applies absolute `top`, `left`, `width` from virtualizer |
| Measurement | Attaches `measureElement` ref so virtualizer knows actual height |
| Enter animation | Applies Motion `initial` / `animate` on first render |
| Detail transition | Carries `layoutId={cardId}` for shared-element transition to detail view |
| Accessibility | `role="listitem"`, `aria-setsize`, `aria-posinset` |

### Props

| Prop | Type | Description |
|------|------|-------------|
| `cardId` | `string` | Unique card identifier |
| `style` | `CSSProperties` | Position/size from virtualizer |
| `isFirstRender` | `boolean` | Whether this card has never been rendered in this session |
| `onMeasure` | `(el: HTMLElement) => void` | Ref callback for height measurement |

## Animation

### Rules

| Animation Type | Used? | Detail |
|---------------|-------|--------|
| Enter (fade + slide) | Yes | `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}` on first render only |
| `layoutId` (detail transition) | Yes | Card in grid and detail panel share `layoutId={cardId}`; Motion animates between them |
| `layout` (FLIP on grid items) | **No** | Conflicts with virtualization; no production masonry grid uses FLIP on grid items |
| Exit (`AnimatePresence`) | No | Virtualizer removes items instantly; exit animation adds complexity for minimal benefit |

### Enter Animation Config

| Property | Value |
|----------|-------|
| Duration | 300ms |
| Easing | `outQuart` (`cubic-bezier(0.25, 1, 0.5, 1)`) |
| Stagger | None (cards enter independently as virtualizer renders them) |
| Trigger | First render of card ID in this session |
| Skip condition | Card was previously rendered (re-entering viewport after scroll) |

### Detail Transition

When a card is selected for detail view, the card container and the detail panel share the same `layoutId`. Motion animates position, size, and border-radius between the two.

| Property | Grid State | Detail State |
|----------|-----------|-------------|
| Width | Column width | Detail panel width (e.g., 720px) |
| Height | Measured card height | Content-driven |
| Border radius | `8px` | `12px` |
| Position | In masonry grid | Centered overlay or side panel |

## Session State (Zustand Store)

### Store Shape

| Field | Type | Description |
|-------|------|-------------|
| `cards` | `Map<string, CardState>` | All cards in the session, keyed by ID |
| `order` | `string[]` | Card IDs in display order (masonry reads this) |
| `activeCardId` | `string \| null` | Currently selected/focused card |
| `detailCardId` | `string \| null` | Card shown in detail view (drives `layoutId` transition) |
| `streamBuffers` | `Map<string, string>` | Ephemeral token buffers per streaming card; flushed to `cards` at interval |
| `renderedCardIds` | `Set<string>` | Tracks which cards have been rendered (for enter animation gating) |

### CardState Shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `shortname` | `string` | User-visible short name, used for cross-card references |
| `type` | `CardType` | `'sql' \| 'python' \| 'literature' \| 'hypothesis' \| 'note' \| 'data_ingest'` |
| `status` | `CardStatus` | `'thinking' \| 'running' \| 'complete' \| 'error'` |
| `content` | `string` | Final rendered content |
| `input` | `string` | Original user input |
| `references` | `string[]` | IDs of cards this card references |
| `referencedBy` | `string[]` | IDs of cards that reference this card |
| `createdAt` | `number` | Timestamp |
| `updatedAt` | `number` | Timestamp |

### Selectors

| Selector | Returns | Re-renders When |
|----------|---------|----------------|
| `useCard(id)` | `CardState` for one card | That card's state changes |
| `useCardOrder()` | `string[]` | Order array changes |
| `useActiveCardId()` | `string \| null` | Active card changes |
| `useDetailCardId()` | `string \| null` | Detail card changes |
| `useCardShortname(id)` | `string` | That card's shortname changes |
| `useIsFirstRender(id)` | `boolean` | Card is added to `renderedCardIds` |

### Actions

| Action | Effect |
|--------|--------|
| `addCard(card)` | Adds to `cards` map, appends ID to `order` |
| `removeCard(id)` | Removes from `cards`, `order`, `streamBuffers`, `renderedCardIds`; cleans up references |
| `updateCard(id, patch)` | Shallow merges patch into card state |
| `reorderCards(fromIndex, toIndex)` | Moves ID within `order` array |
| `setActiveCard(id \| null)` | Sets `activeCardId` |
| `openDetail(id)` | Sets `detailCardId`, triggering `layoutId` transition |
| `closeDetail()` | Clears `detailCardId` |
| `flushStreamBuffer(id)` | Appends buffer contents to card's `content`, clears buffer |
| `markRendered(id)` | Adds ID to `renderedCardIds` |

### Streaming Buffer Pattern

| Step | Location | Detail |
|------|----------|--------|
| 1. Token arrives (SSE) | Outside React | SSE handler appends token to plain JS string variable |
| 2. Buffer flush | `setInterval` at 50ms | Calls `setState` to move buffer contents into `streamBuffers` map |
| 3. Card reads buffer | Zustand selector | Card component subscribes to `streamBuffers.get(id)` |
| 4. Stream ends | SSE handler | Final flush; moves accumulated content to `cards[id].content`; clears buffer |

## Cross-Card References

Cards can reference other cards by shortname. References appear as inline pill components in card content and the input surface.

### Reference Model

| Concept | Detail |
|---------|--------|
| Shortname | Auto-generated or user-assigned short identifier (e.g., `q1`, `plot_a`) |
| Uniqueness | Shortnames are unique within a session |
| Syntax | `@shortname` in input text, rendered as pill via TipTap mention extension |
| Resolution | Shortname resolves to card ID via lookup in `cards` map |

### Reference Behavior

| Scenario | Behavior |
|----------|----------|
| Referenced card content changes | Pill displays updated shortname; if the referenced card's output changed, dependents may re-execute |
| Referenced card deleted | Pill shows "deleted" state with strikethrough; reference becomes unresolvable |
| Referenced card renamed | All pills referencing that card update to show new shortname |
| Circular reference | Allowed but execution engine must detect and halt cycles (out of scope for this domain) |

### Reference Data Flow

| Step | Detail |
|------|--------|
| 1. User types `@` | TipTap Suggestion API shows autocomplete dropdown of card shortnames |
| 2. User selects card | Mention node inserted with `cardId` as data attribute |
| 3. Pill renders | Pill component subscribes to `useCardShortname(cardId)` for live label |
| 4. Card submits | Input parser extracts referenced card IDs into `references` array |
| 5. Store updates | Both `references` (on source) and `referencedBy` (on target) are updated |

### Pill Component

| Property | Value |
|----------|-------|
| Background | Type color background of the referenced card (e.g., SQL: `#E3EDF7`) |
| Border | Type color border of the referenced card |
| Text | Shortname prefixed with `@` |
| Click | Scrolls to and highlights the referenced card |
| Hover | Tooltip with card title and status |

## Component Tree

```
WorkspacePanel
  MasonryGrid (useVirtualizer, lanes)
    CardContainer[] (motion.div, virtual items)
      Card (card domain)
  DetailOverlay (AnimatePresence)
    CardDetail (layoutId transition target)
```

## Accessibility

| Concern | Implementation |
|---------|---------------|
| Grid role | `role="list"` on grid container |
| Item role | `role="listitem"` on each card container |
| Set size | `aria-setsize={totalCardCount}` on each item |
| Position | `aria-posinset={orderIndex + 1}` on each item |
| Active card | `aria-current="true"` on active card |
| Keyboard nav | Arrow keys move `activeCardId` through `order` array; Enter opens detail |
| Screen reader | Live region announces card status changes (`aria-live="polite"`) |

## Error States

| Error | Display |
|-------|---------|
| Card fails to load | Card container renders error placeholder with retry button |
| Stream connection lost | Card shows reconnecting indicator; buffer preserved |
| Shortname conflict | Store rejects duplicate; UI shows validation error on rename |
| Virtualizer measurement failure | Falls back to `estimatedItemSize`; logs warning |
