# Task 02: Environment Config + Provider Composition

**ID:** app-shell/02
**Status:** pending
**Deps:** app-shell/01

## Context

This task sets up the environment variable system and the React provider tree. The Helm uses Vite's `import.meta.env` for environment-specific configuration and wraps the app in three providers (Theme, QueryClient, Router) in the exact order specified in app-shell.md section 6. This enables all downstream tasks to access theme tokens, make API calls, and use routing.

## Implementation Requirements

### Files to Create/Modify

1. **`.env`** (~10 lines)
   - Define defaults for all 5 env vars from app-shell.md section 6
   - `VITE_API_BASE_URL=/api`
   - `VITE_ENABLE_MOCKS=true`
   - `VITE_WS_URL=ws://localhost:3001`
   - `VITE_AUTH_PROVIDER=dev`
   - `VITE_OLLAMA_URL=http://localhost:11434`

2. **`.env.development`** (~5 lines)
   - Dev-specific overrides (same as defaults, explicit for clarity)

3. **`.env.production`** (~5 lines)
   - `VITE_API_BASE_URL=https://api.thehelm.app`
   - `VITE_ENABLE_MOCKS=false`
   - `VITE_WS_URL=wss://ws.thehelm.app`
   - `VITE_AUTH_PROVIDER=kbase`
   - `VITE_OLLAMA_URL=` (empty, API fallback)

4. **`src/common/utils/env.ts`** (~30 lines)
   - Typed accessor for each env var
   - `getApiBaseUrl()`, `isMocksEnabled()`, `getWsUrl()`, `getAuthProvider()`, `getOllamaUrl()`
   - Type-safe wrappers around `import.meta.env.VITE_*`

5. **`src/app/providers.tsx`** (~40 lines)
   - `AppProviders` component wrapping children with (outermost first):
     1. `ThemeProvider` -- applies vanilla-extract theme class to `<body>`
     2. `QueryClientProvider` -- TanStack Query client instance
     3. `RouterProvider` -- React Router (placeholder router for now, real routes in task 03)
   - Export `queryClient` instance for use in tests

6. **`src/app/App.tsx`** (~15 lines)
   - Root component that renders `<AppProviders>` wrapping a `<RouterProvider>`
   - Minimal shell: renders an `<Outlet />` or placeholder

7. **`src/main.tsx`** (modify, ~20 lines)
   - Update to render `<App />` within `StrictMode`
   - Import and apply theme class

### Package Dependencies

- `@tanstack/react-query`
- `react-router` (v7, library mode -- `react-router` package, not `react-router-dom`)

## Demo Reference

No specific demo vignette. Infrastructure for downstream features.

## Integration Proofs

```bash
# 1. Dev server starts with providers mounted
npm run dev &
# Page loads without React errors in console

# 2. Environment variables are accessible
npx vitest run src/common/utils/env.test.ts --reporter=verbose

# 3. QueryClient is available in component tree
# (verified by rendering a test component that calls useQueryClient)

# 4. TypeScript compiles
npx tsc --noEmit
```

## Acceptance Criteria

- [ ] `.env`, `.env.development`, `.env.production` files exist with all 5 env vars
- [ ] `src/common/utils/env.ts` exports typed accessors for each env var
- [ ] `src/app/providers.tsx` composes ThemeProvider, QueryClientProvider, RouterProvider in correct order
- [ ] `src/app/App.tsx` renders the provider tree
- [ ] `src/main.tsx` mounts App into `#root`
- [ ] `npm run dev` starts without errors and the page renders
- [ ] `npx tsc --noEmit` passes

## Anti-Patterns

- Do NOT create the router with routes here -- routes are defined in task 03
- Do NOT import from `react-router-dom` -- use `react-router` v7 unified package
- Do NOT put QueryClient configuration inline -- extract to providers.tsx
- Do NOT add MSW bootstrap here -- that is task 09
- Do NOT use `process.env` -- Vite uses `import.meta.env`
