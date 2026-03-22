# Preflight Decisions — app-shell

## Resolved

### R1. All code already exists — treat as review/fix, not greenfield
All 13 tasks have existing implementations from a batch write pass. The adversarial review cycle will review existing code against specs and fix gaps. Specs say "create" but should be read as "review/modify."

### R2. Hook naming: spec says `useCreateSession`, code says `useCreateSessionMutation`
Downstream consumers (tasks 11-13) already use the `Mutation` suffix. Decision: keep code names (`useCreateSessionMutation`, `useUpdateSessionMutation`, `useDeleteSessionMutation`). Update spec references during review — reviewers should accept the `Mutation` suffix.

### R3. `LazyMotionProvider` missing from `providers.tsx`
INTEGRATION-design-system.md requires it. Must be added to the provider composition in providers.tsx. Without it, Motion components will fail at runtime.

### R4. `RouterProvider` placement
Architecture says inside `AppProviders`. Code places it in `App.tsx` separately. React Router v7's `RouterProvider` renders its own subtree — placing it inside `AppProviders` is technically fine. Decision: keep current placement (in `App.tsx`), it works correctly. Update spec to match.

### R5. OpenAPI spec doubled path prefix
Server URL is `/api`, paths use `/api/sessions` → effective URL `/api/api/sessions`. Fix: change paths to `/sessions`, `/sessions/{id}`, etc. (server provides the `/api` prefix).

### R6. `nullable: true` → OAS 3.1 syntax
Change `nullable: true` to `type: ['string', 'null']` for `avatarUrl` in the OpenAPI spec.

### R7. Orval config mismatches
- `client: 'react-query'` is functionally correct (generates TanStack Query hooks with custom fetch mutator). Spec says `client: 'fetch'` but the `react-query` mode with `customFetch` mutator achieves the same goal. Keep current config.
- Zod schemas: not currently generated. Add if needed by downstream tasks, defer for now.
- Generated output paths use nested directories (`sessions/sessions.ts`), not flat files. This is correct Orval behavior with `mode: 'tags-split'`. Update spec path references.

### R8. `onUnhandledRequest: 'bypass'` vs `'error'`
Spec says `'error'` for tests. Code uses `'bypass'`. Decision: change to `'error'` in test setup — it catches missing mock handlers. Fix during task 09 review.

### R9. Design-system component usage
Integration doc requires: SessionCard uses Card primitive, toolbar uses IconButton, header uses TextInput for inline edit. Current code uses raw divs/inputs. Fix during reviews of tasks 11, 13.

### R10. Raw px/rgba values
Integration doc says use tokens. Many components use raw values for spacing/shadows. Decision: document component-internal layout values with pragmatic exception comments (same pattern as design-system). Colors that duplicate token values should use `vars`.

### R11. `index.html` vs `app.html`
Spec says `index.html`, project uses `app.html` (demo at root `index.html`). Decision: keep `app.html`. Update spec. Build produces `dist/app.html`, not `dist/index.html`.

### R12. Proxy config deferred
Spec says configure `server.proxy` in vite.config.ts, but anti-pattern says don't hardcode URLs. Decision: defer proxy config until env files exist (task 02). No proxy in task 01.

### R13. Task boundary blurring
Later tasks' code exists in earlier tasks' files (e.g., RequireSession has full API integration from task 10, not the stub from task 04). Decision: review each task's code holistically — if the implementation satisfies the task's acceptance criteria (even if it goes beyond), accept it. The adversarial review will still catch quality issues.

### R14. Missing tests
Several spec-required tests don't exist (HomePage.test.tsx, MemberAvatars.test.tsx, sorting/navigation/empty-state tests in SessionList, error-on-failure test in NewSessionDialog). These must be added during the review cycle.

### R15. `vars.spacing` tokens don't exist
Integration doc references spacing tokens but the theme contract has no spacing sub-contract. Decision: raw px values for spacing are acceptable with comments. The design-system contract defines colors/fonts/easing, not spacing scales. Sprinkles handles spacing via utility classes, not via `vars`.

## NEEDS USER REVIEW

None — all items resolved with obvious paths.
