# Task 10: Session Zustand Store + TanStack Query Hooks

**ID:** app-shell/10
**Status:** pending
**Deps:** app-shell/08, app-shell/02

## Context

This task creates the client-side session state management layer. TanStack Query handles server state (fetching, caching, invalidation of session data from the API). Zustand holds derived/UI-only state (which session is currently active, optimistic updates in flight). The generated Orval hooks are wrapped in application-level hooks that combine server state with local state, providing a clean API for the session UI components in tasks 11-13.

## Implementation Requirements

### Files to Create/Modify

1. **`src/features/sessions/stores/sessionStore.ts`** (~35 lines)
   - Zustand store with (from app-shell.md section 4):
     - `activeSessionId: string | null`
     - `setActiveSession(id: string | null): void`
   - This store holds UI-only state; session data lives in TanStack Query cache

2. **`src/features/sessions/hooks/useSessions.ts`** (~30 lines)
   - Wraps the generated `useListSessions` query hook
   - Returns `{ sessions, isLoading, error }`
   - Handles empty state gracefully

3. **`src/features/sessions/hooks/useSession.ts`** (~25 lines)
   - Wraps the generated `useGetSession` query hook
   - Accepts `sessionId: string`
   - Returns `{ session, isLoading, error }`
   - Sets `activeSessionId` in the Zustand store when data loads

4. **`src/features/sessions/hooks/useCreateSession.ts`** (~30 lines)
   - Wraps the generated `useCreateSession` mutation hook
   - On success: invalidates the sessions list query, returns new session
   - Returns `{ createSession, isCreating, error }`

5. **`src/features/sessions/hooks/useUpdateSession.ts`** (~30 lines)
   - Wraps the generated `useUpdateSession` mutation hook
   - On success: invalidates both the session detail and list queries
   - Returns `{ updateSession, isUpdating, error }`

6. **`src/features/sessions/hooks/useDeleteSession.ts`** (~25 lines)
   - Wraps the generated `useDeleteSession` mutation hook
   - On success: invalidates sessions list, clears activeSessionId if deleted
   - Returns `{ deleteSession, isDeleting }`

7. **`src/app/guards/RequireSession.tsx`** (modify)
   - Wire up to `useSession` hook to validate session existence
   - Show loading state while fetching
   - Show error if session not found (404) or access denied (403)

### Tests

8. **`src/features/sessions/hooks/useSessions.test.ts`** (~50 lines)
   - Test: returns session list from MSW mock
   - Test: loading state is true initially, then false
   - Test: error state when request fails

9. **`src/features/sessions/hooks/useCreateSession.test.ts`** (~40 lines)
   - Test: creates session and invalidates list
   - Test: returns the created session

10. **`src/features/sessions/stores/sessionStore.test.ts`** (~25 lines)
    - Test: setActiveSession updates state
    - Test: initial state is null

## Demo Reference

Acceptance criterion 8: "All session CRUD operations work against MSW stubs with realistic Faker.js data"

## Integration Proofs

```bash
# 1. Store tests pass
npx vitest run src/features/sessions/stores/ --reporter=verbose

# 2. Hook tests pass (MSW intercepts, TanStack Query caches)
npx vitest run src/features/sessions/hooks/ --reporter=verbose

# 3. TypeScript compiles
npx tsc --noEmit

# 4. Full CRUD cycle test
# A test that creates a session, reads it, updates it, deletes it
# using the hooks with MSW backing
npx vitest run src/features/sessions/hooks/useSessions.test.ts --reporter=verbose
```

## Acceptance Criteria

- [ ] Session Zustand store manages `activeSessionId` state
- [ ] `useSessions` hook returns session list with loading/error states
- [ ] `useSession` hook returns a single session by ID
- [ ] `useCreateSession` hook creates a session and invalidates the list cache
- [ ] `useUpdateSession` hook updates a session and invalidates relevant caches
- [ ] `useDeleteSession` hook deletes a session and clears active session if needed
- [ ] `RequireSession` guard uses `useSession` to validate session existence
- [ ] All hooks work against MSW-backed Orval mocks
- [ ] Tests verify loading, success, and error states
- [ ] `npx tsc --noEmit` passes

## Anti-Patterns

- Do NOT duplicate TanStack Query cache in Zustand -- Zustand only holds UI-derived state
- Do NOT call fetch directly -- use the generated Orval hooks
- Do NOT skip cache invalidation on mutations -- stale list data is a common bug
- Do NOT store the full session object in Zustand -- that is TanStack Query's job
- Do NOT import generated code directly in components -- components use these wrapper hooks
