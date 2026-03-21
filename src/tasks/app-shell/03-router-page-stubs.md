# Task 03: React Router v7 Route Definitions + Page Stubs

**ID:** app-shell/03
**Status:** pending
**Deps:** app-shell/02

## Context

This task creates the client-side route table using React Router v7 in library mode (not framework mode). All 7 routes from app-shell.md section 2 are defined, each pointing to a stub page component that renders its name and any route params. Route guards (RequireAuth, RequireSession) are stubbed as pass-through wrappers here and implemented fully in task 04.

## Implementation Requirements

### Files to Create/Modify

1. **`src/app/routes.tsx`** (~60 lines)
   - Define route table using `createBrowserRouter` or `createRoutesFromElements`
   - Routes from the spec:
     - `/` -> `HomePage`
     - `/session/new` -> `NewSessionPage` (wrapped in `RequireAuth` stub)
     - `/session/:id` -> `WorkspacePage` (wrapped in `RequireAuth` + `RequireSession` stubs)
     - `/session/:id/join` -> `JoinSessionPage`
     - `/login` -> `LoginPage`
     - `/callback` -> `AuthCallbackPage`
     - `*` -> `NotFoundPage`
   - Export the router object

2. **`src/features/sessions/pages/HomePage.tsx`** (~15 lines)
   - Stub: renders "Home -- Session List" heading
   - Placeholder for SessionList (task 11)

3. **`src/features/sessions/pages/NewSessionPage.tsx`** (~15 lines)
   - Stub: renders "New Session" heading

4. **`src/features/sessions/pages/WorkspacePage.tsx`** (~20 lines)
   - Stub: reads `:id` from `useParams`, renders "Workspace: {id}"
   - This page will host the layout skeleton (task 05)

5. **`src/features/sessions/pages/JoinSessionPage.tsx`** (~15 lines)
   - Stub: reads `:id` from `useParams`, renders "Join Session: {id}"

6. **`src/features/auth/pages/LoginPage.tsx`** (~10 lines)
   - Stub: renders "Login" heading

7. **`src/features/auth/pages/AuthCallbackPage.tsx`** (~10 lines)
   - Stub: renders "Processing authentication..."

8. **`src/app/NotFoundPage.tsx`** (~10 lines)
   - Renders "404 -- Page Not Found"

9. **`src/app/guards/RequireAuth.tsx`** (~10 lines)
   - Stub: renders `<Outlet />` (pass-through, no auth check yet)

10. **`src/app/guards/RequireSession.tsx`** (~10 lines)
    - Stub: renders `<Outlet />` (pass-through, no session check yet)

11. **`src/app/providers.tsx`** (modify)
    - Wire the router into `RouterProvider`

## Demo Reference

No specific demo vignette. Route structure supports all navigation flows.

## Integration Proofs

```bash
# 1. All routes resolve without errors
npx vitest run src/app/routes.test.tsx --reporter=verbose

# 2. Test file verifies each route renders its stub
# routes.test.tsx should:
#   - Render MemoryRouter at "/" and assert "Session List" text
#   - Render at "/session/abc" and assert "Workspace: abc"
#   - Render at "/login" and assert "Login"
#   - Render at "/nonexistent" and assert "404"

# 3. TypeScript compiles
npx tsc --noEmit
```

## Acceptance Criteria

- [ ] `src/app/routes.tsx` defines all 7 routes from the spec
- [ ] Each route renders a stub page component
- [ ] `/session/:id` correctly reads the `id` param
- [ ] `RequireAuth` and `RequireSession` stubs exist as pass-through `<Outlet />` wrappers
- [ ] Navigating to an unknown path renders NotFoundPage
- [ ] A test file verifies at least 4 routes render their stub content
- [ ] `npx tsc --noEmit` passes
- [ ] React Router is v7 in library mode (no file-based routing)

## Anti-Patterns

- Do NOT use React Router framework mode (file-based routing) -- use library mode with explicit route config
- Do NOT implement real auth logic in guards -- that is task 04
- Do NOT add layout regions to pages -- that is task 05
- Do NOT use `react-router-dom` v6 patterns -- use v7 unified `react-router` imports
- Do NOT create a catch-all redirect -- use the `*` path for 404
