# WS-02: Store Selectors and React Hooks

## Dependencies

- **WS-01** (Session Store): The Zustand store must exist with its full shape and actions.

## Context

Zustand achieves re-render isolation through selectors: each card component subscribes to only its own slice of the store. The selectors defined here are the public API that all workspace React components use to read store state. Selectors must be carefully written to avoid returning new object references on every call (which would defeat memoization and cause unnecessary re-renders).

The selectors are prescribed in `architecture/workspace.md` -- Section "Selectors".

## Implementation Requirements

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/features/workspace/store/selectors.ts` | Selector hooks for React components | ~80 |
| `src/features/workspace/store/selectors.test.ts` | Tests verifying selector isolation and correct return values | ~120 |
| `src/features/workspace/store/index.ts` | Barrel export for store, selectors, types | ~10 |

### Selectors to Implement

| Hook | Returns | Re-renders When |
|------|---------|----------------|
| `useCard(id)` | `CardState` for one card | That card's state changes |
| `useCardOrder()` | `string[]` | Order array reference changes |
| `useActiveCardId()` | `string \| null` | Active card changes |
| `useDetailCardId()` | `string \| null` | Detail card changes |
| `useCardShortname(id)` | `string` | That card's shortname changes |
| `useIsFirstRender(id)` | `boolean` | Card is added to `renderedCardIds` |

### Implementation Notes

- Use Zustand's `useStore(selector)` pattern with stable selector functions.
- For `useCard(id)`, the selector must return the same object reference if the card has not changed. Use `cards.get(id)` directly -- Map lookups return the same reference if the value has not been replaced.
- For `useCardShortname(id)`, select only the shortname string to avoid re-rendering when other card fields change.
- For `useIsFirstRender(id)`, select `!renderedCardIds.has(id)` -- returns `true` if the card has never been rendered.
- Export action hooks that return stable action references (Zustand actions are stable by default since they are defined in the store creator).

### Barrel Export

`src/features/workspace/store/index.ts` should re-export:
- The store itself (for direct access in tests)
- All selector hooks
- All types (`CardState`, `CardType`, `CardStatus`, store shape)
- Action accessors (either via hook or direct import)

## Demo Reference

**Vignette 1:** When card A is streaming and card B is idle, only the component using `useCard('a')` re-renders at the 50ms flush interval. The component using `useCard('b')` does not re-render.

**Vignette 5:** The `useCardShortname(id)` hook is used by reference pills in other cards. When a card's shortname changes, only the pills referencing that card update -- not the entire referenced card component.

## Integration Proofs

1. **useCard returns correct card state:**
   ```
   Test: Render a component using useCard('test-id'). Add a card with
   id 'test-id' to the store. Verify component receives the card.
   ```

2. **useCard does not re-render for other cards:**
   ```
   Test: Render two components, one using useCard('a'), one using useCard('b').
   Update card 'a'. Verify only the first component's render count incremented.
   Use React Testing Library + a render counter ref.
   ```

3. **useCardShortname returns only the shortname:**
   ```
   Test: Add a card. Use useCardShortname(id). Update the card's content
   (not shortname). Verify the hook's consumer did not re-render.
   Update the shortname. Verify it did re-render with the new value.
   ```

4. **useIsFirstRender transitions from true to false:**
   ```
   Test: Add a card. useIsFirstRender(id) returns true. Call markRendered(id).
   useIsFirstRender(id) returns false.
   ```

5. **useCardOrder returns stable reference when unchanged:**
   ```
   Test: Call useCardOrder twice without modifying order. Verify referential
   equality (Object.is).
   ```

## Acceptance Criteria

- [ ] All 6 selector hooks are implemented and exported
- [ ] `useCard(id)` returns undefined (not throws) for nonexistent IDs
- [ ] Re-render isolation verified: updating card A does not re-render a component subscribed to card B
- [ ] `useCardShortname` re-renders only on shortname changes, not other card field changes
- [ ] `useIsFirstRender` returns true before `markRendered`, false after
- [ ] Barrel export at `src/features/workspace/store/index.ts` exports all public API
- [ ] All tests pass: `npx vitest run src/features/workspace/store/selectors.test.ts`

## Anti-Patterns

- **Do not** create a new object/array in the selector function body (e.g., `(s) => ({ ...s.cards.get(id) })`). This defeats referential equality and causes every render.
- **Do not** use `useStore()` without a selector (subscribes to the entire store -- every state change triggers re-render).
- **Do not** put derived/computed values in the store that can be computed in selectors. Keep the store shape flat.
- **Do not** use `React.useContext` for store access. Use the Zustand hook.
