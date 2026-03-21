# Task 01: Narrative Zustand Store

## Dependencies

| Dependency | Domain | What's Needed |
|------------|--------|---------------|
| workspace store | workspace | `CardState` type, `CardStatus` type, `useCard` selector pattern |
| card types | card | `CardType`, `CardStatus` enums for disabled-card logic |

## Context

The narrative domain maintains its own Zustand store slice for composition state. This store is independent from the workspace store but references card IDs that exist in the workspace store. The store tracks the current mode (default vs composition), which cards are selected, their composition order, connective text between them, and whether the preview modal is open.

Cards in `thinking` or `running` status cannot be selected. This requires reading card status from the workspace store when toggling selection.

## Implementation Requirements

### Files to Create

1. **`src/features/narrative/narrativeStore.ts`** (~120 lines)

### Store Shape

```ts
interface NarrativeState {
  mode: 'default' | 'composition';
  selectedCardIds: Set<string>;
  orderedCardIds: string[];
  connectiveTexts: Record<string, string>; // keyed by position index
  previewOpen: boolean;
}
```

### Actions

| Action | Signature | Behavior |
|--------|-----------|----------|
| `enterComposition` | `() => void` | Set mode to `'composition'`, clear selection and order |
| `exitComposition` | `() => void` | Set mode to `'default'`, preserve selection state |
| `toggleCard` | `(id: string) => void` | If selected: remove from `selectedCardIds` and `orderedCardIds`. If not selected: add to both (append to end of order). Must check card is not `thinking` or `running`. |
| `selectAll` | `(eligibleIds: string[]) => void` | Add all eligible IDs to `selectedCardIds`; append newly-added ones to `orderedCardIds` |
| `clearSelection` | `() => void` | Empty both `selectedCardIds` and `orderedCardIds`, clear `connectiveTexts` |
| `reorderCards` | `(fromIndex: number, toIndex: number) => void` | Move card within `orderedCardIds` using array splice |
| `setConnectiveText` | `(index: string, text: string) => void` | Update entry in `connectiveTexts` |
| `openPreview` | `() => void` | Set `previewOpen` to true |
| `closePreview` | `() => void` | Set `previewOpen` to false |

### Selectors (exported hooks)

| Hook | Returns |
|------|---------|
| `useNarrativeMode` | `'default' \| 'composition'` |
| `useSelectedCardIds` | `Set<string>` |
| `useOrderedCardIds` | `string[]` |
| `useConnectiveText(index)` | `string` for that position |
| `useIsPreviewOpen` | `boolean` |
| `useIsCardSelected(id)` | `boolean` |
| `useSelectedCount` | `number` |
| `useCompositionPayload` | `{ orderedCardIds: string[]; connectiveTexts: Record<string, string> }` |

### Key Constraints

- `selectedCardIds` must be a `Set` for O(1) lookups during rendering
- `orderedCardIds` is the authoritative order for the composition panel
- When a card is deselected, its connective text entries should be preserved (user may reselect)
- `enterComposition` clears all prior state; `exitComposition` preserves it

## Demo Reference

Vignette 5 in the animated demo: user enters composition mode, selects cards, reorders them, adds connective text, previews, and exports.

## Integration Proofs

```bash
# Store creates without errors
npx vitest run src/features/narrative/narrativeStore.test.ts

# Verify toggle card respects status constraint
# Test: toggleCard on a 'running' card is a no-op
# Test: toggleCard on a 'complete' card adds to selectedCardIds and orderedCardIds

# Verify reorder produces correct array
# Test: reorderCards(0, 2) on ['a','b','c'] yields ['b','c','a']

# Verify enterComposition clears prior state
# Test: select cards, exit, enter again -> selection is empty

# Verify composition payload derivation
# Test: select and order cards, set connective texts, read payload
```

### Test File

Create **`src/features/narrative/narrativeStore.test.ts`** (~100 lines) with tests for:
- Initial state shape
- `enterComposition` / `exitComposition` mode transitions
- `toggleCard` add/remove behavior
- `toggleCard` no-op for disabled statuses
- `selectAll` with mixed eligible/ineligible cards
- `clearSelection` resets all selection state
- `reorderCards` array mutations
- `setConnectiveText` updates
- `openPreview` / `closePreview`
- `useCompositionPayload` derived state

## Acceptance Criteria

- [ ] `narrativeStore.ts` exports a Zustand store with the specified shape
- [ ] All actions produce correct state transitions
- [ ] `toggleCard` is a no-op for cards with `thinking` or `running` status
- [ ] `reorderCards` correctly moves items within `orderedCardIds`
- [ ] `enterComposition` clears selection; `exitComposition` preserves it
- [ ] All selector hooks are exported and tested
- [ ] `useCompositionPayload` returns the correct derived shape
- [ ] All tests pass: `npx vitest run src/features/narrative/narrativeStore.test.ts`

## Anti-Patterns

- Do NOT store card content/metadata in the narrative store. Card data lives in the workspace store; narrative store only holds IDs and composition state.
- Do NOT use Redux or RTK for this store. Zustand is the chosen state library.
- Do NOT persist narrative state to localStorage or server automatically. Export is explicit.
- Do NOT make `selectedCardIds` an array. Use `Set<string>` for O(1) membership checks during render.
- Do NOT couple the store to React components. The store must be usable from non-React code (e.g., test harnesses).
