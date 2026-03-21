# 04 -- Suggestion Dropdown

## Dependencies

| Dependency | Type | What it provides |
|------------|------|------------------|
| 03 (mention pill) | intra-domain | Mention extension with suggestion stub to replace |
| design-system | cross-domain | Surface, border, shadow tokens; type color indicators |

## Context

The suggestion dropdown appears when the user types `@` in the editor. It lists workspace cards filtered by the query text, supporting keyboard navigation and selection. This task replaces the suggestion stub from task 03 with a fully functional dropdown.

Reference: `architecture/input-surface.md` sections 2 (Suggestion Dropdown) and 6 (Keyboard Shortcuts).

## Implementation Requirements

### Files to create

1. `src/features/input-surface/suggestion/SuggestionDropdown.tsx` -- React component for the dropdown
2. `src/features/input-surface/suggestion/suggestionDropdown.css.ts` -- vanilla-extract styles
3. `src/features/input-surface/suggestion/SuggestionDropdown.test.tsx` -- Unit tests

### Suggestion configuration

Wire into the Mention extension's `suggestion` option:

```ts
suggestion: {
  items: ({ query }) => filterCards(query),
  render: () => createSuggestionRenderer(),
  char: '@',
}
```

### Card filtering

| Aspect | Specification |
|--------|---------------|
| Source | Function prop or hook that returns workspace cards in current session |
| Filter | Case-insensitive substring match on card `shortname` and `title` |
| Max visible | 8 items; scrollable if more results |
| Empty state | "No matching cards" message |
| Loading state | Spinner while fetching (if async source) |

### Dropdown behavior

| Aspect | Specification |
|--------|---------------|
| Positioning | Anchored below the `@` trigger character via TipTap Suggestion API |
| Keyboard: Arrow Up/Down | Navigate highlighted item |
| Keyboard: Enter | Insert selected card as mention pill |
| Keyboard: Escape | Dismiss dropdown without inserting |
| Click item | Insert card as mention pill |
| Item display | Card shortname, title, and type color indicator dot |

### Suggestion renderer

Use TipTap's suggestion `render()` API to mount/update/destroy the React dropdown:

```ts
{
  onStart: (props) => { /* mount dropdown */ },
  onUpdate: (props) => { /* update filter/position */ },
  onKeyDown: (props) => { /* handle arrow/enter/escape */ },
  onExit: () => { /* unmount dropdown */ },
}
```

Use a React portal to render the dropdown outside the editor DOM for z-index control.

### Data interface

Define a `SuggestionCard` interface for the items:

```ts
interface SuggestionCard {
  id: string;
  shortname: string;
  title: string;
  type: InputType;
}
```

The actual data source is provided by the consuming component (task 08). For testing, use a static array.

## Demo Reference (Vignette 1 -- The Core Loop)

After the user creates several cards, typing `@` shows those cards in the dropdown. Selecting `@query-1` inserts a pill referencing the SQL card. This cross-referencing is visible in the submitted card's mentions array.

## Integration Proofs

```bash
# Dropdown renders, filters, and handles keyboard
vitest run src/features/input-surface/suggestion --reporter=verbose

# Verify: typing @ opens dropdown with card items
# Verify: typing after @ filters items by substring match
# Verify: Arrow Down highlights next item
# Verify: Enter on highlighted item inserts mention pill
# Verify: Escape dismisses without inserting
# Verify: empty query shows all cards (up to max)
# Verify: no matches shows "No matching cards"
```

## Acceptance Criteria

- [ ] Dropdown appears when `@` is typed in the editor
- [ ] Items are filtered by case-insensitive substring match on shortname and title
- [ ] Arrow Up/Down navigates highlighted item
- [ ] Enter inserts selected card as mention pill and closes dropdown
- [ ] Escape dismisses dropdown without side effects
- [ ] Click on item inserts mention pill
- [ ] Maximum 8 items visible with scroll for overflow
- [ ] Empty state shows "No matching cards"
- [ ] Each item shows shortname, title, and type color indicator
- [ ] Dropdown is positioned via Suggestion API below the trigger
- [ ] Rendered via React portal for z-index isolation
- [ ] Styles use vanilla-extract with design-system tokens

## Anti-Patterns

- Do not fetch cards from an API directly in this component. Accept a data source function/prop.
- Do not use a third-party dropdown library. Use TipTap's Suggestion render API with a custom React component.
- Do not handle mention pill rendering here. That is task 03.
