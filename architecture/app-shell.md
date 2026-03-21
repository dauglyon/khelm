# Domain Spec: App Shell

**Status:** planned
**Depends on:** design-system
**Unlocks:** input-surface, workspace

## Scope

This domain covers the top-level application skeleton: Vite 8 project initialization, React Router routing, layout regions (header, toolbar, sidebar, main workspace), session management (create/join/list), Orval + MSW integration for API stubs, and environment configuration.

---

## 1. Vite 8 Project Setup

| Item | Detail |
|------|--------|
| Scaffolding | `npm create vite@latest -- --template react-ts` |
| Bundler | Rolldown (Vite 8 default) |
| Entry point | `index.html` references `src/main.tsx` |
| TypeScript | Strict mode, `tsconfig.json` with `"moduleResolution": "bundler"` |
| Path aliases | `@/` maps to `src/` via `vite.config.ts` `resolve.alias` |
| Plugins | `@vanilla-extract/vite-plugin`, `vite-plugin-svgr` |
| Dev server port | 5173 (default) |
| Proxy | `/api/*` forwarded to backend URL via `server.proxy` in `vite.config.ts` |
| Env files | `.env`, `.env.development`, `.env.production` |

### Directory Structure

```
src/
  main.tsx              # Entry point, MSW bootstrap, router mount
  app/
    App.tsx             # Root component, providers, layout shell
    routes.tsx          # Route definitions
    providers.tsx       # Composed context providers (query client, theme, etc.)
  features/
    sessions/           # Session management UI + store
    ...                 # Other feature directories (future domains)
  common/
    api/                # Orval-generated clients, base query config
    components/         # Shared UI components (from design-system)
    hooks/              # Shared hooks
    stores/             # Zustand stores (global)
    utils/              # Utilities
  mocks/
    browser.ts          # MSW browser worker setup
    handlers.ts         # Aggregated MSW handlers (generated + custom)
  generated/            # Orval output (types, hooks, mocks) -- gitignored
  test/
    setup.ts            # Vitest global setup
```

---

## 2. Routing

React Router v7 in library mode (not framework mode). All routes are client-side.

### Route Table

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | `HomePage` | No | Landing / session list |
| `/session/new` | `NewSessionPage` | Yes | Create a new session |
| `/session/:id` | `WorkspacePage` | Yes | Main workspace for a session |
| `/session/:id/join` | `JoinSessionPage` | No | Join link for collaboration |
| `/login` | `LoginPage` | No | Authentication |
| `/callback` | `AuthCallbackPage` | No | OAuth callback handler |
| `*` | `NotFoundPage` | No | 404 fallback |

### Route Guards

| Guard | Behavior |
|-------|----------|
| `RequireAuth` | Redirects to `/login` if no valid token; stores intended destination |
| `RequireSession` | Validates `:id` param, shows error if session not found or access denied |

---

## 3. Layout Skeleton

The workspace layout (`/session/:id`) uses a fixed shell with flexible interior regions.

### Layout Regions

| Region | Position | Behavior |
|--------|----------|----------|
| **Header** | Top, full width, fixed | App logo, session title (editable), user avatar menu, session members (presence dots) |
| **Toolbar** | Below header, full width, fixed | Input surface (from input-surface domain), input type indicator, submit button |
| **Main workspace** | Center, fills remaining height | Masonry card grid (from workspace domain), scrollable |
| **Sidebar** | Right, collapsible panel | Session info, card list/outline, notes, narrative panel; toggle via toolbar icon |

### Layout Constraints

| Constraint | Value |
|-----------|-------|
| Header height | 56px |
| Toolbar height | 64px |
| Sidebar width | 320px (open), 0px (collapsed) |
| Sidebar animation | Motion `animate` with 200ms ease-out |
| Main workspace | `calc(100vh - 120px)` height, horizontal padding 24px |
| Responsive breakpoint | Sidebar auto-collapses below 1024px viewport width |

---

## 4. Session Management

Sessions are the top-level organizational unit. A session contains cards, collaborators, and workspace state.

### Session Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string (uuid)` | Unique session identifier |
| `title` | `string` | User-editable session name |
| `createdAt` | `string (ISO 8601)` | Creation timestamp |
| `updatedAt` | `string (ISO 8601)` | Last modification timestamp |
| `ownerId` | `string` | User who created the session |
| `memberIds` | `string[]` | Users with access |
| `status` | `"active" \| "archived"` | Session lifecycle state |

### Session API Endpoints

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `GET` | `/api/sessions` | List sessions for current user | `Session[]` |
| `POST` | `/api/sessions` | Create a new session | `Session` |
| `GET` | `/api/sessions/:id` | Get session by ID | `Session` |
| `PATCH` | `/api/sessions/:id` | Update session (title, status) | `Session` |
| `DELETE` | `/api/sessions/:id` | Delete session | `204` |
| `POST` | `/api/sessions/:id/join` | Join a session via invite | `Session` |
| `GET` | `/api/sessions/:id/members` | List session members | `User[]` |

### Session Store (Zustand)

| Slice | State | Description |
|-------|-------|-------------|
| `sessions` | `Map<string, Session>` | Cached session list |
| `activeSessionId` | `string \| null` | Currently open session |
| `sessionsLoading` | `boolean` | Loading state for session list |

TanStack Query handles server state (fetch, cache, invalidation). Zustand holds derived/UI state only (active session, sidebar open, etc.).

### Session UI Components

| Component | Location | Behavior |
|-----------|----------|----------|
| `SessionList` | `/` (home) | Grid of session cards; sorted by `updatedAt` desc; create button |
| `SessionCard` | Within `SessionList` | Title, last updated, member count, click to open |
| `NewSessionDialog` | `/session/new` or modal | Title input, create button, navigates to `/session/:id` on success |
| `SessionHeader` | Header region | Editable title (inline), member avatars, archive/delete menu |

---

## 5. Orval + MSW Integration

### OpenAPI Spec

| Item | Detail |
|------|--------|
| Location | `src/api/openapi.yaml` |
| Version | OpenAPI 3.1 |
| Linting | Spectral with default + custom rules |
| CI check | Lint spec before generation |

### Orval Configuration

| Setting | Value |
|---------|-------|
| Config file | `orval.config.ts` |
| Input | `src/api/openapi.yaml` |
| Output target | `src/generated/api/` |
| Client | `fetch` |
| Query hooks | TanStack Query v5 |
| Mock generation | `mock: true` (Faker.js) |
| Zod schemas | Enabled |
| Override base URL | `import.meta.env.VITE_API_BASE_URL` |

### MSW Setup

| Item | Detail |
|------|--------|
| Browser worker | `src/mocks/browser.ts` -- `setupWorker(...handlers)` |
| Node handler | `src/mocks/server.ts` -- `setupServer(...handlers)` for Vitest |
| Handler source | Orval-generated handlers in `src/generated/api/*.msw.ts` |
| Custom overrides | `src/mocks/handlers.ts` -- manual handlers that override generated ones |
| Bootstrap | Conditional in `src/main.tsx`: start worker only when `VITE_ENABLE_MOCKS` is truthy |
| Service worker file | `public/mockServiceWorker.js` (generated by `npx msw init public/`) |

### Dev Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `generate:api` | `orval` | Regenerate types, hooks, mocks from spec |
| `lint:api` | `spectral lint src/api/openapi.yaml` | Lint OpenAPI spec |
| `dev` | `vite` | Start dev server (MSW active by default) |
| `dev:real` | `VITE_ENABLE_MOCKS=false vite` | Dev server against real backend |

---

## 6. Environment Configuration

### Environment Variables

| Variable | Default (dev) | Production | Description |
|----------|--------------|------------|-------------|
| `VITE_API_BASE_URL` | `/api` | `https://api.thehelm.app` | Backend API base URL |
| `VITE_ENABLE_MOCKS` | `true` | `false` | Enable MSW mock interception |
| `VITE_WS_URL` | `ws://localhost:3001` | `wss://ws.thehelm.app` | Socket.IO server URL |
| `VITE_AUTH_PROVIDER` | `dev` | `kbase` | Auth provider selector |
| `VITE_OLLAMA_URL` | `http://localhost:11434` | (empty -- API fallback) | Local Ollama for classification |

### Provider Composition

`src/app/providers.tsx` wraps the app with the following providers (outermost first):

| Order | Provider | Purpose |
|-------|----------|---------|
| 1 | `ThemeProvider` | vanilla-extract theme class on `<body>` |
| 2 | `QueryClientProvider` | TanStack Query client |
| 3 | `RouterProvider` | React Router |

---

## 7. Acceptance Criteria

| # | Criterion |
|---|-----------|
| 1 | `npm run dev` starts Vite dev server, loads app shell with header, toolbar, and empty workspace |
| 2 | Navigating to `/` shows session list (mocked data from MSW) |
| 3 | Creating a session navigates to `/session/:id` with the layout skeleton visible |
| 4 | Unauthenticated access to `/session/:id` redirects to `/login` |
| 5 | Sidebar toggles open/closed with animation |
| 6 | `npm run generate:api` produces types, hooks, and MSW handlers from `openapi.yaml` |
| 7 | `VITE_ENABLE_MOCKS=false npm run dev` connects to real backend (no MSW interception) |
| 8 | All session CRUD operations work against MSW stubs with realistic Faker.js data |
| 9 | Vitest tests use the same MSW handlers via `setupServer` |
| 10 | Spectral lints the OpenAPI spec with zero errors in CI |

---

## 8. Out of Scope

| Item | Covered in |
|------|-----------|
| Input surface (TipTap editor, classification) | input-surface domain |
| Card grid, masonry layout, virtualization | workspace domain |
| Card model, rendering, streaming content | card domain |
| Socket.IO setup, presence, locking | collaboration domain |
| File drop, upload, parsing | data-ingest domain |
| Design tokens, theme, shared primitives | design-system domain |
| Narrative composition | narrative domain |
