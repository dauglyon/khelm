# Integration: design-system -> app-shell

## Imports Required

### Theme and Tokens
- `vars` (theme contract) for all color, spacing, easing, and font references
- `themeClass` for applying the theme to the root `<body>` element via `ThemeProvider`
- `sprinkles` for utility-class styling on layout regions

### Components
- **Button** (`variant: 'solid' | 'outline'`, `size: 'md'`) -- session create button, sidebar toggle, session header actions (archive/delete)
- **IconButton** -- toolbar icons (sidebar toggle, settings), session header menu trigger
- **TextInput** (`size: 'md'`) -- inline editable session title in header, new session dialog title input
- **Card** -- `SessionCard` in the session list on the home page
- **Stack** -- layout composition for header, toolbar, sidebar, and session list grid
- **Icon** -- logo, user avatar placeholder, sidebar toggle icon, toolbar icons
- **Spinner** -- loading state for session list fetch
- **Skeleton** (`variant: 'text' | 'rect'`) -- placeholder content while sessions load

### Animation Utilities
- **LazyMotionProvider** -- wraps the app root (composed in `providers.tsx`)
- **panelSlide** variant -- sidebar open/close animation (200ms ease-out)
- **easing.out** -- sidebar collapse animation easing
- **fadeIn** variant -- route transition fade

## Acceptance Criteria

1. `ThemeProvider` applies `themeClass` to `<body>`, making all `vars.*` tokens available app-wide
2. `LazyMotionProvider` wraps the application root so all downstream Motion usage works
3. All layout regions (header, toolbar, sidebar, main workspace) use `vars` spacing tokens -- no raw px values outside of the documented layout constraints (56px header, 64px toolbar, 320px sidebar)
4. Sidebar open/close uses `panelSlide` Motion variant with `easing.out`
5. `SessionCard` on the home page uses the design-system `Card` component (no `inputType` needed -- session cards are neutral)
6. Session list loading state uses `Skeleton` components (not a plain spinner)
7. New session dialog uses `TextInput` for title and `Button` (solid, primary) for create action
8. All `IconButton` instances include `aria-label`
9. Inline session title editing in the header uses `TextInput`
10. No raw color hex values, font stacks, or easing curves appear in app-shell code -- all sourced from `vars`
