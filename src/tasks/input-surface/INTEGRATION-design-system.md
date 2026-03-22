# Integration: design-system -> input-surface

## Imports Required

### Theme and Tokens
- `vars` (theme contract) -- specifically `color.inputType.*` tokens for all seven input types
- `InputType` enum -- used to key Chip color and classification preview styling
- `sprinkles` for utility styling on the input bar and dropdown elements

### Components
- **Chip** (`inputType`, `label`, `size: 'sm'`) -- classification type indicator pill, type selector dropdown items, mention pills in the input bar
- **Button** (`variant: 'solid'`, `size: 'md'`) -- submit button at trailing edge of input bar
- **IconButton** -- submit button (alternative icon-only variant)
- **Spinner** (`size: 16`) -- loading state in suggestion dropdown while fetching card list
- **Stack** -- layout for the input bar (row: type indicator + editor + submit), suggestion dropdown items, type selector dropdown
- **Icon** -- type selector chevron, mention suggestion item type indicator

### Animation Utilities
- **easing.inOut** -- fade transition on type indicator when classification result changes (150ms)
- **fadeIn** variant -- type selector dropdown appearance
- CSS **pulse** keyframe -- subtle pulse on type indicator while classification is in-flight

### Typography
- Typography recipes for input text styling (body, 15px, Sans)
- `vars.font.mono` for SQL/Python content rendering in suggestion previews

## Acceptance Criteria

1. Classification type indicator uses `Chip` with the `inputType` prop set to the classified type -- colors derive automatically from `color.inputType.[type].*` tokens
2. High-confidence (>=0.80) type indicator renders `Chip` with solid background; mid-confidence (0.50-0.79) renders with dashed border style
3. Type selector dropdown renders all seven input types as `Chip` components, each with its correct `inputType` enum value
4. Mention pills in the TipTap editor use `Chip` styled with the referenced card's `inputType` colors (background and border from the card's type)
5. Submit button uses design-system `Button` component (solid, primary variant)
6. Suggestion dropdown loading state uses `Spinner` (size 16)
7. Type indicator fade transition uses `easing.inOut` (150ms duration)
8. Type indicator pulse animation during classification uses the CSS `pulse` keyframe from the design system
9. All type-related colors come from `vars.color.inputType.*` -- no hardcoded hex values for input type colors
10. Input bar text uses the `body` typography recipe from the design system
