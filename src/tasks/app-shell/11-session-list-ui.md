# Task 11: SessionList + SessionCard UI

**ID:** app-shell/11
**Status:** pending
**Deps:** app-shell/10, app-shell/05

## Context

This task builds the home page session list UI. The `SessionList` component displays a grid of `SessionCard` components sorted by `updatedAt` descending, with a create button. Each `SessionCard` shows the session title, last updated time, member count, and navigates to `/session/:id` on click. The list uses the `useSessions` hook (task 10) to fetch data from MSW-backed mocks.

## Implementation Requirements

### Files to Create/Modify

1. **`src/features/sessions/components/SessionList.tsx`** (~50 lines)
   - Uses `useSessions()` hook to fetch session data
   - Renders a grid of `SessionCard` components
   - Sorts sessions by `updatedAt` descending
   - Shows loading state (Skeleton components from design-system)
   - Shows empty state with prompt to create first session
   - "Create Session" button (navigates to `/session/new` or opens dialog)
   - Uses CSS grid layout for responsive card arrangement

2. **`src/features/sessions/components/SessionList.css.ts`** (~20 lines)
   - CSS grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
   - Gap using spacing tokens
   - Padding using spacing tokens

3. **`src/features/sessions/components/SessionCard.tsx`** (~40 lines)
   - Renders within a Card primitive (from design-system)
   - Displays: title (heading style), last updated (relative time, caption style), member count (badge/text)
   - Click handler navigates to `/session/${session.id}`
   - Hover effect (subtle elevation change)
   - `role="link"` or `<a>` for accessibility

4. **`src/features/sessions/components/SessionCard.css.ts`** (~20 lines)
   - Hover styles, cursor pointer
   - Typography using theme tokens

5. **`src/features/sessions/pages/HomePage.tsx`** (modify)
   - Replace placeholder with `<SessionList />`
   - Add page title/heading

6. **`src/common/utils/formatDate.ts`** (~15 lines)
   - Utility: `formatRelativeTime(dateString: string): string`
   - Returns "2 hours ago", "3 days ago", etc.
   - Uses `Intl.RelativeTimeFormat` (no external dependency)

### Tests

7. **`src/features/sessions/components/SessionList.test.tsx`** (~60 lines)
   - Test: renders session cards from mocked data
   - Test: sessions are sorted by updatedAt descending
   - Test: loading state shows skeletons
   - Test: empty state shows create prompt
   - Test: clicking a card navigates to the session

## Demo Reference

Acceptance criterion 2: "Navigating to `/` shows session list (mocked data from MSW)"
Acceptance criterion 8: "All session CRUD operations work against MSW stubs with realistic Faker.js data"

## Integration Proofs

```bash
# 1. SessionList tests pass
npx vitest run src/features/sessions/components/SessionList.test.tsx --reporter=verbose

# 2. Home page renders with mocked sessions
npx vitest run src/features/sessions/pages/HomePage.test.tsx --reporter=verbose

# 3. TypeScript compiles
npx tsc --noEmit

# 4. Build succeeds
npm run build
```

## Acceptance Criteria

- [ ] `SessionList` fetches and displays sessions from the API
- [ ] Sessions are sorted by `updatedAt` descending
- [ ] `SessionCard` displays title, last updated, and member count
- [ ] Clicking a `SessionCard` navigates to `/session/:id`
- [ ] Loading state shows skeleton placeholders
- [ ] Empty state shows a prompt to create the first session
- [ ] "Create Session" button is visible and functional
- [ ] CSS grid layout is responsive (auto-fill columns)
- [ ] `formatRelativeTime` utility formats dates correctly
- [ ] Tests verify rendering, sorting, loading, empty, and navigation
- [ ] `npx tsc --noEmit` passes

## Anti-Patterns

- Do NOT fetch sessions directly with fetch -- use the `useSessions` hook
- Do NOT hardcode session data -- all data comes from MSW mocks
- Do NOT use a table layout -- use a card grid
- Do NOT use moment.js or date-fns for relative time -- `Intl.RelativeTimeFormat` is sufficient
- Do NOT skip the empty state -- it is the first thing a new user sees
