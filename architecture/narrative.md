# Narrative Domain

Covers card selection, drag reorder, composition panel, and artifact preview. Backend handles narrative generation and export; this spec covers the frontend interaction surface only.

**Dependencies:** design-system, workspace, card

## Modes

The workspace operates in two mutually exclusive modes:

| Mode | Workspace View | Narrative Panel | Entry | Exit |
|------|---------------|-----------------|-------|------|
| Default | Masonry grid (full width) | Hidden | Exit composition mode | -- |
| Composition | Compressed card list (reduced width) | Visible (side panel) | Toolbar "Compose" button | Toolbar "Exit" or panel close |

Entering composition mode compresses the workspace from masonry grid to a single-column card list. The card list uses the same card components but renders at a fixed narrow width to make room for the composition panel.

## Card Selection

Cards are selectable only in composition mode.

| Aspect | Detail |
|--------|--------|
| Selection control | Checkbox on each card in the compressed list |
| Multi-select | Click checkboxes individually; "Select All" / "Clear" bulk actions in toolbar |
| Visual feedback | Selected cards show a highlight border using the `running` status color (`#2B6CB0`) |
| Persistence | Selection state lives in Zustand narrative store; not persisted to server until explicit save |
| Maximum | No hard limit; UI shows count badge ("4 selected") |
| Disabled cards | Cards in `thinking` or `running` status cannot be selected (content not finalized) |

## Composition Panel

A side panel that appears to the right of the compressed card list when composition mode is active.

| Aspect | Detail |
|--------|--------|
| Layout | Fixed-width right panel (~50% viewport), card list takes remaining space |
| Sections | Ordered list of selected cards with connective text areas between them |
| Connective text | TipTap editor instances (minimal config: bold, italic, links) between each pair of cards |
| Card representation | Read-only card summary: type badge, title, truncated content preview |
| Empty state | Prompt: "Select cards from the workspace to begin composing" |
| Scroll | Panel scrolls independently of card list |

### Panel Structure

```
┌─────────────────────────────────┐
│  Narrative Composition          │
│  [Preview]  [Export]  [Close]   │
├─────────────────────────────────┤
│  ┌─ Connective Text ─────────┐ │
│  │  (optional intro text)     │ │
│  └────────────────────────────┘ │
│  ┌─ Card 1 Summary ──────────┐ │
│  │  ≡  [SQL] User query...   │ │
│  └────────────────────────────┘ │
│  ┌─ Connective Text ─────────┐ │
│  │  (text between cards)      │ │
│  └────────────────────────────┘ │
│  ┌─ Card 2 Summary ──────────┐ │
│  │  ≡  [Python] Analysis...  │ │
│  └────────────────────────────┘ │
│  ┌─ Connective Text ─────────┐ │
│  │  (optional closing text)   │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

## Drag Reorder

Selected cards in the composition panel are reorderable via drag-and-drop.

| Aspect | Detail |
|--------|--------|
| Library | dnd-kit (sortable list) |
| Scope | Composition panel only (vertical list, not the card grid) |
| Handle | Drag handle icon (grip dots) on each card summary row |
| Animation | Motion `layout` prop on card summary items for FLIP reorder animation |
| Keyboard | dnd-kit built-in: Space to grab, arrow keys to move, Space to drop |
| State update | Reorder updates the ordered card ID array in Zustand narrative store |

Note: the composition panel uses a simple vertical sortable list, not a masonry grid. The dnd-kit + Motion transform conflict documented in RSH-010 is specific to 2D grid layouts and does not apply to single-axis vertical lists, where both libraries coexist without issue.

## Artifact Preview

A rendered read-only view of the composed narrative as it would appear in its final shareable form.

| Aspect | Detail |
|--------|--------|
| Trigger | "Preview" button in composition panel header |
| Display | Full-screen modal overlay |
| Content | Cards rendered in order with connective text between them |
| Card rendering | Full card content (not truncated), styled for document reading (serif body font: Source Serif 4) |
| Navigation | Scroll through the full document; "Close" returns to composition mode |
| Export | "Export" button in preview header; calls backend export API |
| Formats | Determined by backend; frontend sends ordered card IDs + connective text payloads |

## State Shape

All narrative state in a single Zustand store slice:

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `'default' \| 'composition'` | Current workspace mode |
| `selectedCardIds` | `Set<string>` | Cards chosen for narrative |
| `orderedCardIds` | `string[]` | Selected cards in composition order |
| `connectiveTexts` | `Record<string, string>` | Keyed by position index (`"0"` = before first card, `"1"` = between card 1 and 2, etc.) |
| `previewOpen` | `boolean` | Whether the preview modal is showing |

### Derived State

| Derivation | Logic |
|------------|-------|
| Unselected cards | All workspace card IDs minus `selectedCardIds` |
| Composition payload | `{ orderedCardIds, connectiveTexts }` -- sent to backend on export |

## Actions

| Action | Effect |
|--------|--------|
| `enterComposition` | Set mode to `composition`, clear prior selection |
| `exitComposition` | Set mode to `default`, preserve selection (user may return) |
| `toggleCard(id)` | Add/remove from `selectedCardIds`; append/remove from `orderedCardIds` |
| `selectAll` | Add all eligible cards to selection; append newly selected to end of order |
| `clearSelection` | Empty `selectedCardIds` and `orderedCardIds` |
| `reorderCards(from, to)` | Move card within `orderedCardIds` array |
| `setConnectiveText(index, text)` | Update `connectiveTexts` at position |
| `openPreview` | Set `previewOpen` to true |
| `closePreview` | Set `previewOpen` to false |
| `exportNarrative` | POST `{ orderedCardIds, connectiveTexts }` to backend export endpoint |

## API Surface

| Endpoint | Method | Payload | Response | Notes |
|----------|--------|---------|----------|-------|
| `/api/narratives/export` | POST | `{ sessionId, orderedCardIds, connectiveTexts, format? }` | `{ narrativeId, downloadUrl }` | Async; may return 202 with poll URL for long exports |
| `/api/narratives/{id}` | GET | -- | Full narrative artifact | Retrieve previously exported narrative |
| `/api/narratives/{id}/status` | GET | -- | `{ status, progress?, downloadUrl? }` | Poll for async export completion |

API types generated via Orval from OpenAPI spec. MSW handlers mock these endpoints during development.

## Accessibility

| Concern | Approach |
|---------|----------|
| Composition mode toggle | Toolbar button with `aria-pressed` reflecting mode |
| Card selection | Native checkbox inputs with labels referencing card title |
| Reorder list | dnd-kit ARIA live region announcements ("Card moved from position 2 to position 3") |
| Drag handle | `role="button"` with `aria-roledescription="sortable"` (dnd-kit default) |
| Preview modal | Focus trap, `role="dialog"`, `aria-label="Narrative preview"`, Escape to close |

## Component Inventory

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `CompositionToolbar` | Toolbar area | Enter/exit composition mode, select all, clear, card count badge |
| `CardListView` | Main workspace area (composition mode) | Single-column card list with selection checkboxes |
| `CompositionPanel` | Right side panel | Ordered card summaries, connective text editors, preview/export buttons |
| `CardSummary` | Inside `CompositionPanel` | Drag handle, type badge, title, truncated preview for one card |
| `ConnectiveEditor` | Between `CardSummary` items | Minimal TipTap instance for bridging text |
| `NarrativePreview` | Modal overlay | Full rendered narrative document |

## Open Questions

| Question | Impact | Notes |
|----------|--------|-------|
| Should connective text support AI generation ("write a transition")? | Medium | Could add a small "suggest" button on each connective editor; requires LLM endpoint |
| Should narrative drafts auto-save? | Low | Could debounce-save to server; current design is explicit-export only |
| Should the preview support inline editing? | Low | Current design is read-only preview; editing happens in composition panel |
