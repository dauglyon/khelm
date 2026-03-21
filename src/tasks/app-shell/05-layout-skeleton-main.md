# Task 05: Layout Skeleton -- Header, Toolbar, Main Regions

**ID:** app-shell/05
**Status:** pending
**Deps:** app-shell/03

## Context

This task builds the three non-collapsible layout regions for the workspace view (`/session/:id`): the header (56px, fixed, full-width), the toolbar (64px, below header, full-width), and the main workspace area (fills remaining height, scrollable). The sidebar is handled separately in task 06. These regions use vanilla-extract styles with design tokens from the design-system domain. Content within each region is placeholder; feature domains will fill them in.

## Implementation Requirements

### Files to Create/Modify

1. **`src/features/sessions/components/WorkspaceLayout.tsx`** (~50 lines)
   - Flex column container taking full viewport height
   - Renders `<Header />`, `<Toolbar />`, and `<MainWorkspace />` in order
   - Accepts `children` for the main workspace content area
   - Accepts `sidebar` render prop or slot for sidebar (rendered in task 06)

2. **`src/features/sessions/components/WorkspaceLayout.css.ts`** (~40 lines)
   - vanilla-extract styles:
     - `.shell` -- `display: flex; flex-direction: column; height: 100vh;`
     - `.header` -- `height: 56px; flex-shrink: 0; position: sticky; top: 0;`
     - `.toolbar` -- `height: 64px; flex-shrink: 0;`
     - `.content` -- `display: flex; flex: 1; overflow: hidden;`
     - `.main` -- `flex: 1; overflow-y: auto; padding: 0 24px;`
   - Use theme tokens for colors (`color.bg`, `color.surface`, `color.border`)

3. **`src/features/sessions/components/Header.tsx`** (~35 lines)
   - Fixed height 56px region
   - Placeholder content: app logo text ("The Helm"), session title text, user avatar placeholder
   - Uses `color.surface` background, `color.border` bottom border
   - Flex row layout with space-between

4. **`src/features/sessions/components/Header.css.ts`** (~25 lines)
   - Styles using theme tokens

5. **`src/features/sessions/components/Toolbar.tsx`** (~25 lines)
   - Fixed height 64px region
   - Placeholder: "Input surface placeholder" text, sidebar toggle button
   - Uses `color.bg` background, `color.border` bottom border

6. **`src/features/sessions/components/Toolbar.css.ts`** (~20 lines)
   - Styles using theme tokens

7. **`src/features/sessions/components/MainWorkspace.tsx`** (~20 lines)
   - Fills remaining viewport height: `calc(100vh - 120px)`
   - Scrollable container with 24px horizontal padding
   - Renders children (card grid placeholder)

8. **`src/features/sessions/pages/WorkspacePage.tsx`** (modify)
   - Wrap page content in `<WorkspaceLayout>`

## Demo Reference

Acceptance criterion 1 from app-shell.md: "loads app shell with header, toolbar, and empty workspace"
Acceptance criterion 3: "Creating a session navigates to `/session/:id` with the layout skeleton visible"

## Integration Proofs

```bash
# 1. Layout component renders all three regions
npx vitest run src/features/sessions/components/WorkspaceLayout.test.tsx --reporter=verbose

# 2. Test verifies region dimensions via style assertions
# WorkspaceLayout.test.tsx should:
#   - Assert header renders with data-testid="header"
#   - Assert toolbar renders with data-testid="toolbar"
#   - Assert main workspace renders with data-testid="main-workspace"
#   - Assert children are rendered inside main workspace

# 3. TypeScript compiles
npx tsc --noEmit

# 4. vanilla-extract styles compile without errors
npm run build
```

## Acceptance Criteria

- [ ] `WorkspaceLayout` renders header (56px), toolbar (64px), and main workspace
- [ ] Header contains placeholder logo, title, and avatar areas
- [ ] Toolbar contains placeholder input area and sidebar toggle button
- [ ] Main workspace fills remaining viewport height and is scrollable
- [ ] Main workspace has 24px horizontal padding
- [ ] All styles use design-system theme tokens (no raw hex or px values for colors)
- [ ] `WorkspacePage` renders within the layout skeleton
- [ ] A test verifies all three regions render
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds (vanilla-extract compiles)

## Anti-Patterns

- Do NOT use inline styles for layout dimensions -- use vanilla-extract `.css.ts` files
- Do NOT use raw color hex values -- import from theme contract (`vars`)
- Do NOT implement the sidebar here -- that is task 06
- Do NOT add real content to header/toolbar -- those come from other tasks and domains
- Do NOT use Material-UI layout components -- use vanilla-extract + native flex/grid
- Do NOT make the layout responsive yet beyond basic flex behavior -- sidebar responsive collapse is task 06
