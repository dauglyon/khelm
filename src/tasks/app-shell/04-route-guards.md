# Task 04: RequireAuth + RequireSession Route Guards

**ID:** app-shell/04
**Status:** pending
**Deps:** app-shell/03

## Context

This task implements the two route guards from app-shell.md section 2. `RequireAuth` checks for a valid auth token and redirects to `/login` if absent, storing the intended destination for post-login redirect. `RequireSession` validates the `:id` route param against available sessions and shows an error state if the session is not found or access is denied. For now, auth state is a simple Zustand store with a token field; real auth provider integration is out of scope.

## Implementation Requirements

### Files to Create/Modify

1. **`src/common/stores/authStore.ts`** (~30 lines)
   - Zustand store with:
     - `token: string | null`
     - `setToken(token: string): void`
     - `clearToken(): void`
     - `isAuthenticated` derived getter (computed from `token !== null`)
   - For dev purposes, initialize with a fake token if `VITE_AUTH_PROVIDER === 'dev'`

2. **`src/app/guards/RequireAuth.tsx`** (modify, ~30 lines)
   - Read `isAuthenticated` from auth store
   - If not authenticated: redirect to `/login` with `state.from` set to current location
   - If authenticated: render `<Outlet />`

3. **`src/app/guards/RequireSession.tsx`** (modify, ~35 lines)
   - Read `:id` from `useParams`
   - Attempt to validate session exists (for now, a simple check; will integrate with TanStack Query in task 10)
   - If session not found: render an error component with "Session not found" message
   - If valid: render `<Outlet />`
   - Accept a `fallback` prop for loading state

4. **`src/features/auth/pages/LoginPage.tsx`** (modify, ~25 lines)
   - Add a "Dev Login" button that sets a fake token and redirects to stored destination
   - Read `state.from` from location to redirect after login

### Tests

5. **`src/app/guards/RequireAuth.test.tsx`** (~50 lines)
   - Test: unauthenticated user is redirected to `/login`
   - Test: authenticated user sees the child route
   - Test: redirect preserves the intended destination

6. **`src/app/guards/RequireSession.test.tsx`** (~40 lines)
   - Test: invalid session ID shows error
   - Test: valid session renders child route

## Demo Reference

Acceptance criterion 4 from app-shell.md: "Unauthenticated access to `/session/:id` redirects to `/login`"

## Integration Proofs

```bash
# 1. Guard tests pass
npx vitest run src/app/guards/ --reporter=verbose

# 2. Auth store tests pass
npx vitest run src/common/stores/authStore.test.ts --reporter=verbose

# 3. TypeScript compiles
npx tsc --noEmit

# 4. Dev login flow works in browser
# Navigate to /session/test -> redirected to /login
# Click "Dev Login" -> redirected back to /session/test
```

## Acceptance Criteria

- [ ] `RequireAuth` redirects unauthenticated users to `/login`
- [ ] `RequireAuth` stores intended destination in location state
- [ ] `RequireAuth` renders child routes for authenticated users
- [ ] `RequireSession` shows error for invalid session IDs
- [ ] `RequireSession` renders child routes for valid sessions
- [ ] Auth store provides `token`, `setToken`, `clearToken`, `isAuthenticated`
- [ ] Dev login sets a fake token when `VITE_AUTH_PROVIDER === 'dev'`
- [ ] Post-login redirect goes to stored destination
- [ ] All guard tests pass
- [ ] `npx tsc --noEmit` passes

## Anti-Patterns

- Do NOT implement real OAuth/OIDC flows -- use a simple token store for now
- Do NOT store tokens in localStorage without considering security -- for dev mode a Zustand store is fine
- Do NOT make RequireSession depend on the session API yet -- task 10 will wire that up
- Do NOT block the entire app on auth loading -- guards should handle the loading state gracefully
- Do NOT hardcode session IDs for validation -- use a pluggable check that task 10 replaces
