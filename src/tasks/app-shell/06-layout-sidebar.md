# Task 06: Layout Skeleton -- Collapsible Sidebar

**ID:** app-shell/06
**Status:** pending
**Deps:** app-shell/05

## Context

This task adds the collapsible sidebar panel to the workspace layout. The sidebar sits on the right side, is 320px wide when open and 0px when collapsed, animates open/close using Motion with a 200ms ease-out transition, and auto-collapses below 1024px viewport width. The sidebar toggle is triggered from a button in the toolbar (created in task 05). Sidebar state is managed in a small Zustand store for UI state.

## Implementation Requirements

### Files to Create/Modify

1. **`src/common/stores/layoutStore.ts`** (~20 lines)
   - Zustand store with:
     - `sidebarOpen: boolean` (default: `true`)
     - `toggleSidebar(): void`
     - `setSidebarOpen(open: boolean): void`

2. **`src/features/sessions/components/Sidebar.tsx`** (~40 lines)
   - Renders a panel on the right side of the workspace
   - Width: 320px when open, 0px (collapsed) when closed
   - Motion `animate` for open/close with 200ms ease-out transition
   - Uses `panelSlide` variant from design-system (or defines locally if not yet available)
   - Placeholder content: "Session Info", "Card List", "Notes" section headings
   - `color.surface` background, `color.border` left border

3. **`src/features/sessions/components/Sidebar.css.ts`** (~25 lines)
   - vanilla-extract styles:
     - `.sidebar` -- `width: 320px; flex-shrink: 0; overflow: hidden;`
     - `.sidebarContent` -- padding, section layout

4. **`src/features/sessions/components/WorkspaceLayout.tsx`** (modify, ~10 lines added)
   - Import and render `<Sidebar />` inside the content row, after `<MainWorkspace />`
   - Read `sidebarOpen` from layout store to control sidebar visibility

5. **`src/features/sessions/components/Toolbar.tsx`** (modify, ~10 lines added)
   - Wire the sidebar toggle button to `toggleSidebar()` from layout store
   - Toggle button icon/label changes based on sidebar state

6. **`src/common/hooks/useMediaQuery.ts`** (~20 lines)
   - Custom hook: `useMediaQuery(query: string): boolean`
   - Used to detect viewport below 1024px

7. **`src/features/sessions/components/WorkspaceLayout.tsx`** (modify)
   - Use `useMediaQuery` to auto-collapse sidebar below 1024px
   - Call `setSidebarOpen(false)` when viewport drops below breakpoint

### Tests

8. **`src/features/sessions/components/Sidebar.test.tsx`** (~40 lines)
   - Test: sidebar renders when open
   - Test: sidebar is hidden when closed
   - Test: toggle changes sidebar state

## Demo Reference

Acceptance criterion 5 from app-shell.md: "Sidebar toggles open/closed with animation"

## Integration Proofs

```bash
# 1. Sidebar tests pass
npx vitest run src/features/sessions/components/Sidebar.test.tsx --reporter=verbose

# 2. Layout store tests pass
npx vitest run src/common/stores/layoutStore.test.ts --reporter=verbose

# 3. TypeScript compiles
npx tsc --noEmit

# 4. Build succeeds (Motion + vanilla-extract together)
npm run build
```

## Acceptance Criteria

- [ ] Sidebar renders at 320px width when open
- [ ] Sidebar collapses to 0px when closed
- [ ] Toggle button in toolbar opens/closes sidebar
- [ ] Open/close transition uses Motion with 200ms ease-out
- [ ] Sidebar auto-collapses below 1024px viewport width
- [ ] Layout store manages `sidebarOpen` state
- [ ] `useMediaQuery` hook detects viewport breakpoint
- [ ] Sidebar contains placeholder section headings
- [ ] Tests verify open, closed, and toggle behavior
- [ ] `npx tsc --noEmit` passes

## Anti-Patterns

- Do NOT use CSS media queries alone for responsive behavior -- the auto-collapse needs to sync with Zustand state
- Do NOT use `display: none` for hiding -- animate width to 0 with overflow hidden for smooth transition
- Do NOT put real sidebar content here -- other tasks/domains will fill it in
- Do NOT use setTimeout for animation -- use Motion's `animate` prop
- Do NOT create a separate sidebar route -- it is a panel within the workspace layout
