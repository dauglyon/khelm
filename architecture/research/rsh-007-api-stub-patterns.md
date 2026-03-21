# RSH-007: What is the smoothest spec-first workflow for frontend API development without a backend?

**Date:** 2026-03-21 | **Status:** Completed

## Question

What is the best spec-first workflow where the frontend team defines the API contract (OpenAPI) and can develop features, generate types, generate mocks, and build the full UI -- all before a real backend exists? Which combination of tools provides the best DX for a Vite + React 18+ + TypeScript SPA that needs REST with potential SSE/streaming support?

## Context

"The Helm" is a React SPA built on Vite + React 18+ + TypeScript. The backend is stub-first, with REST + OpenAPI as the preferred approach. The frontend team needs to:

1. Write an OpenAPI spec as the single source of truth
2. Generate TypeScript types and API client code from that spec
3. Generate mock servers/handlers so features can be built without a backend
4. Swap in the real backend later with minimal code changes
5. Support SSE/streaming for real-time features

This research evaluates the current ecosystem (as of early 2026) across three categories: **type/client generators**, **mock servers**, and **end-to-end DX workflows**.

## Findings

### 1. OpenAPI Spec-First Type & Client Generation Tools

These tools read an OpenAPI spec and produce TypeScript types, API client functions, and optionally query hooks, validation schemas, and mock handlers.

#### Comparison Table

| Feature | openapi-typescript | Orval | Kubb | Hey API (@hey-api/openapi-ts) |
|---|---|---|---|---|
| **Weekly npm downloads** | ~1,150,000 | ~410,000 | ~49,000 (@kubb/core) | ~833,000 |
| **GitHub stars** | ~8,000 | ~5,570 | ~1,660 | ~4,350 |
| **OpenAPI versions** | 3.0, 3.1 | 2.0, 3.0 | 2.0, 3.0, 3.1 | 2.0, 3.0, 3.1 |
| **TypeScript types** | Yes | Yes | Yes | Yes |
| **API client generation** | Via openapi-fetch | Yes (Axios, Fetch) | Yes (Axios, Fetch) | Yes (Fetch, Axios, Ky, Next.js, Nuxt) |
| **TanStack Query hooks** | Via openapi-react-query (1kb wrapper) | Built-in (React, Vue, Svelte, Solid) | Built-in (React, Vue, Svelte, Solid, SWR) | Built-in plugin |
| **Zod schema generation** | No (separate effort) | Yes | Yes | Yes |
| **MSW mock generation** | No | Yes (with Faker.js) | Yes (with Faker.js) | No (community) |
| **Architecture** | Minimal, composable libraries | Monolithic CLI with config | Plugin-based, modular | Plugin-based SDK generator |
| **Maturity/stability** | Very mature, most adopted | Stable, well-documented | Rapidly evolving, newest | Fast-moving, used by Vercel/PayPal |

Sources:
- [openapi-typescript GitHub](https://github.com/openapi-ts/openapi-typescript)
- [Orval homepage](https://orval.dev/)
- [Kubb introduction](https://kubb.dev/kubb/getting-started/introduction)
- [Hey API homepage](https://heyapi.dev/)
- [npm trends comparison](https://npmtrends.com/openapi-typescript-vs-orval-vs-@hey-api/openapi-ts-vs-@kubb/core)
- [APIs You Won't Hate: Frontend with OpenAPI](https://apisyouwonthate.com/newsletter/openapi-to-frontend/)
- [Evil Martians: OpenAPI-driven React](https://evilmartians.com/chronicles/lifes-too-short-to-hand-write-api-types-openapi-driven-react)

#### Tool Details

**openapi-typescript + openapi-fetch + openapi-react-query**
The most adopted approach. `openapi-typescript` generates types only -- no runtime code. `openapi-fetch` provides a type-safe fetch wrapper (~1kb). `openapi-react-query` wraps TanStack Query with full type inference (~1kb). This is a composable, minimal approach where you pick only the pieces you need. The tradeoff is that you must separately handle mock generation and Zod schemas.
- [openapi-react-query docs](https://openapi-ts.dev/openapi-react-query/)
- [Type-safe TanStack Query with OpenAPI](https://ruanmartinelli.com/blog/tanstack-query-openapi/)

**Orval**
Generates everything in one pass: types, fetch functions, TanStack Query hooks, MSW mock handlers, and Zod validators. Configuration is explicit and readable via `orval.config.js`. Orval can generate MSW handlers with Faker.js-powered mock data from a single `mock: true` flag. Supports splitting output into separate files. One of the most popular choices for teams wanting a batteries-included approach.
- [Orval React Query guide](https://orval.dev/guides/react-query)
- [Orval MSW mock generation](https://www.orval.dev/guides/basics)
- [Prototyp Digital: Orval + TanStack](https://prototyp.digital/blog/generating-api-client-openapi-swagger-definitions)

**Kubb**
The most plugin-rich option. Plugin-based architecture generates TanStack Query hooks, SWR hooks, Axios/Fetch clients, Zod validators, Faker.js data, MSW handlers, and even Cypress tests -- all from one OpenAPI spec. Supports OpenAPI 3.1 features. Actively developed with a "Fabric" system for language-agnostic code generation. Lower adoption but the most comprehensive feature set.
- [Kubb MSW plugin](https://kubb.dev/kubb/plugins/plugin-msw)
- [Kubb plugins directory](https://kubb.dev/kubb/plugins)
- [Kubb GitHub](https://github.com/kubb-labs/kubb)

**Hey API (@hey-api/openapi-ts)**
Modern SDK generator with 20+ plugins. Generates TypeScript SDKs, Zod schemas, and TanStack Query hooks. Pluggable HTTP clients (Fetch, Axios, Ky, etc.). Used in production by Vercel, OpenCode, and PayPal. Fast-moving with frequent releases. The Evil Martians guide specifically recommends this tool for its complete SDK generation with proper request/response handling.
- [Hey API get started](https://heyapi.dev/openapi-ts/get-started)
- [Hey API TanStack Query plugin](https://heyapi.dev/openapi-ts/plugins/tanstack-query)

### 2. Mock Servers & API Mocking

#### Comparison Table

| Feature | MSW v2 | Prism (Stoplight) | json-server | Mirage.js |
|---|---|---|---|---|
| **Approach** | Service Worker intercept (browser) + Node interceptor | Standalone HTTP server from spec | Standalone HTTP server from JSON file | Monkey-patches fetch/XHR in browser |
| **OpenAPI-driven** | Via external tools (Orval, Kubb, msw-auto-mock) | Native -- reads spec directly | No (JSON data file) | No (manual route definition) |
| **SSE support** | Yes -- first-class `sse()` API (v2.12.0+) | No documented SSE support | No | No |
| **WebSocket support** | Yes -- first-class `ws` namespace | No | No | No |
| **HTTP streaming** | Yes -- ReadableStream responses | Limited | No | No |
| **Vite integration** | Excellent -- no server to run, works in browser | Requires separate process | Requires separate process | Good -- runs in browser |
| **Test reuse** | Same handlers for dev + Jest/Vitest + Playwright | Separate server process | Separate server process | Browser-only |
| **DevTools visibility** | Requests visible in Network tab | N/A (separate server) | N/A (separate server) | Not visible (intercepted before network) |
| **Data modeling** | Per-request handler basis | Schema-driven from spec | CRUD from JSON file | Rich relational data model |
| **Active maintenance** | Very active | Active | v1 still in beta, uncertain | Last npm publish ~2 years ago |
| **Node.js support** | Yes | Yes | Yes | No (browser-only) |

Sources:
- [MSW comparison page](https://mswjs.io/docs/comparison/)
- [MSW SSE support announcement](https://mswjs.io/blog/server-sent-events-are-here/)
- [MSW SSE docs](https://mswjs.io/docs/sse/)
- [MSW WebSocket docs](https://mswjs.io/docs/websocket/)
- [MSW streaming docs](https://mswjs.io/docs/http/mocking-responses/streaming/)
- [Prism homepage](https://stoplight.io/open-source/prism)
- [Prism GitHub](https://github.com/stoplightio/prism)
- [MSW + Vite setup guide](https://www.mattstobbs.com/msw-2-in-react-vite/)
- [Mirage.js comparison](https://miragejs.com/docs/comparison-with-other-tools/)
- [BrowserStack API simulation comparison](https://www.browserstack.com/guide/api-simulation-tools-comparison)

#### Tool Details

**MSW v2 (Mock Service Worker)** -- Recommended
The industry standard for frontend API mocking. Intercepts requests at the network level via Service Workers (browser) or Node interceptors (tests). Key advantages for this project:
- **SSE support**: First-class `sse()` API introduced in v2.12.0 with type-safe `client.send()`, connection management, and proxy capabilities.
- **WebSocket support**: First JavaScript mocking library to support REST, GraphQL, and WebSocket simultaneously.
- **Streaming**: Supports ReadableStream/TransformStream as response bodies.
- **Vite compatibility**: No separate server process needed. Initialize in `main.tsx` with conditional `worker.start()` for dev only.
- **Test reuse**: Same handler definitions work across Vitest unit tests, Playwright E2E tests, and Storybook stories.
- **DevTools**: Requests appear in the browser Network tab as real HTTP requests.
- **OpenAPI integration**: Multiple pathways exist to auto-generate MSW handlers from OpenAPI specs (Orval, Kubb, msw-auto-mock, @msw/source).

**Prism (Stoplight)**
Reads an OpenAPI spec directly and serves mock responses without any code. Useful for quick validation ("does my spec make sense?") but requires running a separate server process. No SSE/WebSocket support. Best used as a complementary validation tool alongside MSW, not as the primary mock layer.

**json-server**
Creates a REST API from a JSON file with CRUD operations. Simple but limited: no OpenAPI awareness, no SSE, v1 still in beta with expected breaking changes, and it imposes its own API conventions rather than matching your production API shape.

**Mirage.js**
Rich data modeling with relationships, but browser-only (no Node.js/test support), no SSE/WebSocket, and maintenance appears stalled (last npm publish ~2 years ago). Not recommended for new projects in 2026.

### 3. MSW Handler Generation from OpenAPI

Several tools bridge OpenAPI specs to MSW handlers:

| Tool | Approach | Mock data | Notes |
|---|---|---|---|
| **Orval** (mock: true) | Generates handlers + Faker.js data alongside client code | Faker.js, spec examples | Integrated with client generation; single tool |
| **Kubb** (@kubb/plugin-msw) | Plugin generates handlers + Faker.js data | Faker.js, custom data | Most configurable; part of larger plugin ecosystem |
| **msw-auto-mock** | Standalone CLI reads spec, outputs handlers | Faker.js or AI (OpenAI/Anthropic) | Quick bootstrap; supports AI-generated realistic data |
| **openapi-to-msw** | Standalone CLI, simpler than msw-auto-mock | Basic from spec | Lighter alternative |
| **openapi-backend + MSW** | Runtime routing: openapi-backend handles matching, MSW intercepts | Custom handlers per operation | Most flexible; validates requests against spec at runtime |

Sources:
- [msw-auto-mock npm](https://www.npmjs.com/package/msw-auto-mock)
- [msw-auto-mock GitHub](https://github.com/zoubingwu/msw-auto-mock)
- [openapi-backend + MSW testing](https://openapistack.co/docs/examples/testing-react-with-jest-and-openapi-mocks/)
- [Supercharge FE with MSW + OpenAPI](https://dev.to/michaliskout/supercharge-frontend-development-with-msw-openapi-and-ai-generated-mocks-1bfo)
- [Kubb MSW plugin](https://kubb.dev/kubb/plugins/plugin-msw)

### 4. API Client + TanStack Query Integration

| Approach | Bundle size | Type safety | Hook generation | Notes |
|---|---|---|---|---|
| **openapi-react-query** | ~1kb | Full (inferred from spec) | useQuery, useMutation, useSuspenseQuery, useInfiniteQuery, queryOptions | Wraps openapi-fetch; minimal overhead |
| **Orval react-query output** | Varies (generated code) | Full | One hook per endpoint | Generated hooks with built-in query keys |
| **Kubb TanStack Query plugin** | Varies (generated code) | Full | Query keys, query options, hooks | Also generates SWR hooks |
| **Hey API TanStack Query plugin** | Varies (generated code) | Full | Query/mutation functions + keys | Compatible with full SDK ecosystem |
| **openapi-react-query-codegen** | Varies (generated code) | Full | useQuery, useSuspenseQuery, useMutation, useInfiniteQuery | Community project, standalone codegen |

Sources:
- [openapi-react-query docs](https://openapi-ts.dev/openapi-react-query/)
- [TanStack Query community projects](https://tanstack.com/query/latest/docs/framework/react/community/community-projects)
- [openapi-react-query-codegen GitHub](https://github.com/7nohe/openapi-react-query-codegen)

### 5. OpenAPI Spec Linting & Validation

For a spec-first workflow, validating the spec itself is critical:

| Tool | Purpose | Key features |
|---|---|---|
| **Spectral** (Stoplight) | Lint OpenAPI/AsyncAPI specs | Customizable rulesets (.spectral.yaml), CI/GitHub Actions integration, OWASP security rules |
| **Redocly CLI** | Lint, bundle, preview OpenAPI specs | Linting with configurable rules, multi-file bundling, local preview server for docs |

Both integrate into CI pipelines to catch spec errors before they reach code generation.

Sources:
- [Spectral GitHub](https://github.com/stoplightio/spectral)
- [Redocly CLI docs](https://redocly.com/docs/cli)

### 6. Ideal DX Workflow: Spec-First Development

Based on the research, the recommended end-to-end workflow for "The Helm":

```
Step 1: Write/Edit OpenAPI Spec
   |-- openapi.yaml (single source of truth)
   |-- Lint with Spectral or Redocly CLI
   |-- Preview docs with Redocly preview
   |
Step 2: Generate Code (single command)
   |-- TypeScript types
   |-- API client (fetch-based)
   |-- TanStack Query hooks
   |-- Zod validation schemas
   |-- MSW mock handlers + Faker.js data
   |
Step 3: Develop Features
   |-- MSW intercepts all API calls in dev mode
   |-- Real HTTP requests visible in DevTools Network tab
   |-- Same mock handlers power Vitest tests + Storybook
   |-- SSE mocked via MSW sse() API
   |
Step 4: Swap In Real Backend
   |-- Toggle env var to disable MSW
   |-- Vite proxy forwards /api/* to real backend
   |-- Zero code changes in components/hooks
   |-- Optionally keep MSW for specific unfinished endpoints
```

The Evil Martians guide describes this as: "When the contract changes, regenerate -- TypeScript immediately shows every place that needs updates."

Sources:
- [Evil Martians: OpenAPI-driven React](https://evilmartians.com/chronicles/lifes-too-short-to-hand-write-api-types-openapi-driven-react)
- [API First in Practice](https://dev.to/dmitrii-verbetchii/api-first-in-practice-how-we-made-frontend-types-predictable-and-stable-332c)
- [Contract-First API Development](https://devguide.dev/blog/contract-first-api-development)
- [Best Practices for API-First Development 2025](https://timebusinesses.com/best-practices-for-api-first-development/)

## Conclusions

### Recommended Stack for "The Helm"

**Primary recommendation: Orval + MSW v2**

| Layer | Tool | Rationale |
|---|---|---|
| **Spec authoring** | OpenAPI 3.1 YAML | Widest tooling support, latest standard |
| **Spec linting** | Spectral | Customizable rules, CI integration |
| **Type + client generation** | **Orval** | Single tool generates types, fetch client, TanStack Query hooks, Zod schemas, AND MSW handlers. Stable, well-documented, strong community. |
| **Mock server** | **MSW v2** | First-class SSE + WebSocket + streaming support. No extra server process. Reusable across dev/test/Storybook. Vite-native. |
| **Mock data** | Faker.js (via Orval) | Realistic data auto-generated from spec schemas |
| **API hooks** | TanStack Query (via Orval) | Generated hooks with proper query keys, caching, error handling |
| **Validation** | Zod (via Orval) | Runtime validation schemas matching the spec exactly |

**Why Orval over alternatives:**
- **vs openapi-typescript**: Orval generates everything (hooks, mocks, Zod) in one pass; openapi-typescript requires assembling multiple separate tools.
- **vs Kubb**: Kubb is more powerful/flexible but has 1/8th the adoption and a steeper learning curve. Orval's simpler config is better for getting started.
- **vs Hey API**: Hey API is fast-moving but has been noted for instability during rapid evolution. Orval is more stable for production use.

**Why MSW over alternatives:**
- **vs Prism**: MSW runs in-browser with no separate process and supports SSE/WebSocket. Prism does not support SSE and requires a standalone server.
- **vs Mirage.js**: MSW supports Node.js (tests), has active maintenance, shows requests in DevTools Network tab, and supports SSE/streaming. Mirage.js has none of these.
- **vs json-server**: MSW is OpenAPI-aware (via generators), supports SSE, and doesn't require running a separate server. json-server imposes its own API conventions.

**Alternative recommendation: Kubb + MSW v2**

If the project needs maximum flexibility (e.g., custom code generation patterns, OpenAPI 3.1 edge cases, generating Cypress tests), Kubb's plugin architecture offers more control at the cost of a steeper learning curve. Kubb's MSW plugin is first-class and generates the same quality of mock handlers as Orval.

### Key Workflow Principles

1. **OpenAPI spec is the single source of truth.** Never hand-write API types or mock data that could drift from the contract.
2. **Regenerate on every spec change.** Add `orval` (or `kubb generate`) to your dev scripts. TypeScript compilation catches breakage immediately.
3. **MSW for all mocking contexts.** Use the same handlers in `vite dev`, `vitest`, and Storybook -- no divergence between dev and test mocks.
4. **Environment-based toggling.** `if (import.meta.env.DEV) { await worker.start() }` in `main.tsx`. When the backend is ready, flip the flag or remove the conditional.
5. **Lint the spec in CI.** Use Spectral to enforce naming conventions, security rules, and structural standards before code generation runs.

## Sources

### Type & Client Generation
- [openapi-typescript GitHub](https://github.com/openapi-ts/openapi-typescript)
- [openapi-react-query docs](https://openapi-ts.dev/openapi-react-query/)
- [Orval homepage](https://orval.dev/)
- [Orval React Query guide](https://orval.dev/guides/react-query)
- [Kubb introduction](https://kubb.dev/kubb/getting-started/introduction)
- [Kubb plugins directory](https://kubb.dev/kubb/plugins)
- [Hey API homepage](https://heyapi.dev/)
- [Hey API TanStack Query plugin](https://heyapi.dev/openapi-ts/plugins/tanstack-query)
- [npm trends: openapi-typescript vs orval vs hey-api vs kubb](https://npmtrends.com/openapi-typescript-vs-orval-vs-@hey-api/openapi-ts-vs-@kubb/core)

### Mock Servers
- [MSW homepage](https://mswjs.io/)
- [MSW comparison page](https://mswjs.io/docs/comparison/)
- [MSW SSE docs](https://mswjs.io/docs/sse/)
- [MSW SSE announcement](https://mswjs.io/blog/server-sent-events-are-here/)
- [MSW WebSocket docs](https://mswjs.io/docs/websocket/)
- [MSW streaming docs](https://mswjs.io/docs/http/mocking-responses/streaming/)
- [MSW + Vite setup](https://www.mattstobbs.com/msw-2-in-react-vite/)
- [Prism (Stoplight)](https://stoplight.io/open-source/prism)
- [Mirage.js](https://miragejs.com/)
- [json-server GitHub](https://github.com/typicode/json-server)

### Mock Generation from OpenAPI
- [msw-auto-mock npm](https://www.npmjs.com/package/msw-auto-mock)
- [Kubb MSW plugin](https://kubb.dev/kubb/plugins/plugin-msw)
- [openapi-backend + MSW testing](https://openapistack.co/docs/examples/testing-react-with-jest-and-openapi-mocks/)
- [Supercharge FE with MSW + OpenAPI](https://dev.to/michaliskout/supercharge-frontend-development-with-msw-openapi-and-ai-generated-mocks-1bfo)

### Spec-First Workflow & Best Practices
- [Evil Martians: OpenAPI-driven React](https://evilmartians.com/chronicles/lifes-too-short-to-hand-write-api-types-openapi-driven-react)
- [API First in Practice](https://dev.to/dmitrii-verbetchii/api-first-in-practice-how-we-made-frontend-types-predictable-and-stable-332c)
- [Contract-First API Development](https://devguide.dev/blog/contract-first-api-development)
- [Best Practices for API-First Development 2025](https://timebusinesses.com/best-practices-for-api-first-development/)
- [React & REST APIs: End-to-End TypeScript](https://profy.dev/article/react-openapi-typescript)
- [APIs You Won't Hate: Frontend with OpenAPI](https://apisyouwonthate.com/newsletter/openapi-to-frontend/)

### Spec Linting & Validation
- [Spectral GitHub](https://github.com/stoplightio/spectral)
- [Spectral homepage](https://stoplight.io/open-source/spectral)
- [Redocly CLI docs](https://redocly.com/docs/cli)
- [Redocly CLI GitHub](https://github.com/Redocly/redocly-cli)

### Community & Comparisons
- [TanStack Query community projects](https://tanstack.com/query/latest/docs/framework/react/community/community-projects)
- [BrowserStack API simulation comparison](https://www.browserstack.com/guide/api-simulation-tools-comparison)
- [openapi-react-query-codegen GitHub](https://github.com/7nohe/openapi-react-query-codegen)
