# App Shell -- Task Breakdown

The app-shell domain delivers the top-level application skeleton: Vite 8 project initialization with Rolldown, React Router v7 client-side routing with auth guards, a four-region layout (header, toolbar, sidebar, main workspace), session CRUD backed by Zustand + TanStack Query, Orval + MSW v2 integration for type-safe API stubs generated from an OpenAPI spec, and environment configuration. It depends on the design-system domain for theme tokens and shared primitives, and unlocks the input-surface and workspace domains.

## Implementation Targets

| Target | Source | Notes |
|--------|--------|-------|
| Vite 8 project with Rolldown | app-shell.md S1 | `react-ts` template, strict TS, path aliases, VE + SVGR plugins |
| React Router v7 (library mode) | app-shell.md S2 | 7 routes, RequireAuth + RequireSession guards |
| Layout skeleton | app-shell.md S3 | Header (56px), Toolbar (64px), Sidebar (320px collapsible), Main |
| Session management | app-shell.md S4 | CRUD model, Zustand store, TanStack Query hooks, 4 UI components |
| OpenAPI spec + Orval + MSW | app-shell.md S5 | Spec authoring, codegen, browser + node MSW workers |
| Environment configuration | app-shell.md S6 | 5 env vars, provider composition (Theme, Query, Router) |

## Task Table

| ID | Summary | Deps | Status | Preflight |
|----|---------|------|--------|-----------|
| 01 | Vite 8 project scaffold + config | design-system | done | done |
| 02 | Environment config + provider composition | 01 | done | done |
| 03 | React Router v7 route definitions + page stubs | 02 | done | done |
| 04 | RequireAuth + RequireSession route guards | 03 | done | done |
| 05 | Layout skeleton -- header, toolbar, main regions | 03 | done | done |
| 06 | Layout skeleton -- collapsible sidebar | 05 | done | done |
| 07 | OpenAPI spec authoring (sessions API) | (none) | pending | done |
| 08 | Orval config + code generation pipeline | 07, 01 | pending | done |
| 09 | MSW browser + node worker setup | 08 | pending | done |
| 10 | Session Zustand store + TanStack Query hooks | 08, 02 | pending | done |
| 11 | SessionList + SessionCard UI | 10, 05 | pending | done |
| 12 | NewSessionDialog + create flow | 10, 05 | pending | done |
| 13 | SessionHeader -- editable title + member display | 10, 05 | pending | done |

## Critical Path DAG

```
                   design-system
                        |
                       [01] Vite scaffold
                      /    \
                   [02]    [07] OpenAPI spec
                    |        |
                   [03]    [08] Orval codegen <-----+
                  / |  \     |                      |
               [04][05] \  [09] MSW setup           |
                    |    \   |                      |
                   [06]  [10] Session store ---------+
                          |
                   +------+------+
                   |      |      |
                 [11]   [12]   [13]
              SessionList NewSess SessionHeader
```

## Parallelism Opportunities

| Wave | Tasks | Notes |
|------|-------|-------|
| Wave 1 | 01, 07 | Vite scaffold and OpenAPI spec are independent; 07 has no deps |
| Wave 2 | 02, 08 | Env/providers and Orval codegen run in parallel once their deps land |
| Wave 3 | 03, 09 | Router setup and MSW setup in parallel |
| Wave 4 | 04, 05, 10 | Guards, layout regions, and session store in parallel |
| Wave 5 | 06, 11, 12, 13 | Sidebar animation and all session UI components in parallel |
