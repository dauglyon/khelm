# RSH-011: Testing Strategy for an Animation-Heavy React SPA with Streaming LLM Responses

**Date:** 2026-03-21 | **Status:** Completed

## Question

What is the optimal testing strategy for "The Helm" -- a Vite + React 18+ + TypeScript SPA featuring heavy animations (Motion/Framer Motion), streaming LLM responses via SSE, a stub REST API, and potential real-time collaboration via WebSocket? Covers unit/component runner selection, E2E framework, API mocking, animation testing, streaming test patterns, and CI configuration.

## Context

The Helm is a Vite-based React SPA with several testing-challenging characteristics:

- **Animation-heavy UI** using Motion (formerly Framer Motion) for transitions, layouts, and micro-interactions
- **Streaming LLM responses** via Server-Sent Events (SSE) delivering token-by-token output
- **Stub REST API** for backend interactions during development
- **Potential WebSocket** layer for real-time collaboration features
- **Drag-and-drop** interactions for workspace/canvas management

Each of these characteristics introduces specific testing concerns that must be addressed holistically.

## Findings

### 1. Unit/Component Test Runner: Vitest vs Jest

#### Performance Benchmarks (real-world production data, 2025-2026)

| Metric | Jest | Vitest | Improvement |
|---|---|---|---|
| Cold start (50k-test monorepo) | 214 s | 38 s | 5.6x faster |
| Watch mode re-run | 8.4 s | 0.3 s | 28x faster |
| Single-file change re-run | 3.4 s | 380 ms | 9x faster |
| CI pipeline (50k tests) | 14 min | < 5 min | 64% reduction |
| Cold start (smaller SPA) | 12 s | 2 s | 6x faster |
| Hot reload (smaller SPA) | 4 s | 80 ms | 50x faster |

Sources: [byteiota benchmarks](https://byteiota.com/vitest-vs-jest-2026-28x-faster-tests-real-migration-data/), [SitePoint migration guide](https://www.sitepoint.com/vitest-vs-jest-2026-migration-benchmark/), [PkgPulse benchmarks](https://www.pkgpulse.com/blog/bun-test-vs-vitest-vs-jest-test-runner-benchmark-2026)

#### Architecture Advantages for Vite Projects

Vitest uses Vite's transform pipeline natively, meaning there is zero configuration overhead for a Vite project -- shared `vite.config.ts`, same plugin ecosystem, same module resolution. Jest requires separate Babel/SWC configuration, `ts-jest` or `@swc/jest` transforms, and manual module mapping that duplicates what Vite already handles.

Vitest's watch mode leverages Vite's HMR dependency graph, tracking actual import relationships. When a utility changes, only tests that transitively import it re-run. Jest relies on git-diff heuristics, which are less precise.

#### Ecosystem Maturity (2026)

- Vitest 4.0 (October 2025) graduated Browser Mode to stable
- Nuxt, SvelteKit, Astro, and Angular tooling all ship with or recommend Vitest
- Vitest surpassed Jest in weekly NPM download growth trajectory
- Full Jest API compatibility (describe, it, expect, vi.fn/vi.mock)

Sources: [Vitest official comparisons](https://vitest.dev/guide/comparisons.html), [DevTools Research](https://devtoolswatch.com/en/vitest-vs-jest-2026), [InfoQ on Browser Mode](https://www.infoq.com/news/2025/06/vitest-browser-mode-jsdom/)

#### Happy DOM vs jsdom

| Criterion | Happy DOM | jsdom |
|---|---|---|
| Speed | 3-10x faster than jsdom | Baseline |
| API completeness | Covers common use cases; some gaps | Most complete browser simulation |
| Memory footprint | Lower | Higher (detailed W3C implementation) |
| Best for | Fast unit tests, simple DOM queries | Tests requiring accurate browser behavior |
| Known edge cases | Some users report regressions with complex selectors (now improved with caching) | Slower but more predictable |

**Recommendation:** Start with Happy DOM for speed. Use per-file `@vitest-environment jsdom` annotations for tests that need fuller browser simulation. Vitest 4.0's stable Browser Mode (running in real Chromium/Firefox/WebKit via Playwright) is the escape hatch when neither simulated environment suffices.

Sources: [Vitest discussion #1607](https://github.com/vitest-dev/vitest/discussions/1607), [Sean Coughlin comparison](https://blog.seancoughlin.me/jsdom-vs-happy-dom-navigating-the-nuances-of-javascript-testing), [Vitest environment docs](https://vitest.dev/guide/environment)

---

### 2. E2E Framework: Playwright vs Cypress

#### Comparison Table

| Criterion | Playwright | Cypress |
|---|---|---|
| Architecture | Out-of-process (CDP/WebDriver) | In-browser (same-origin proxy) |
| Browser support | Chromium, Firefox, WebKit (Safari), Edge, mobile emulation | Chrome, Firefox, Edge; no Safari, no mobile |
| Parallel execution | Built-in, free (sharding + workers) | Requires Cypress Cloud ($30k+/yr at enterprise scale) |
| Package size | ~10 MB | ~500 MB |
| Headless speed | ~2x faster than Cypress in benchmarks | Slower due to in-browser architecture |
| Multi-tab/window | Full support | Not supported |
| Network interception | `page.route()` with fine-grained control | `cy.intercept()` with similar capability |
| Auto-wait for animations | Waits for actionability (visible, enabled, stable, not animating) | Waits for element existence only |
| SSE/EventSource mocking | Limited -- `page.route()` does not intercept EventSource connections; workaround via `addInitScript` to replace global EventSource | Limited -- `cy.intercept()` has known issues with streaming responses |
| DnD testing | Native `dragTo()` method; complex React DnD may need HTML5 event dispatch fallback | Plugin-based; similar React DnD challenges |
| Adoption (2026) | 78,600+ GitHub stars, 45.1% QA adoption, 20-30M weekly NPM downloads | Declining share, ~25% QA adoption |
| Debugging | Trace Viewer, video, screenshots, codegen | Time-travel UI, real-time browser view |

Sources: [BugBug comparison](https://bugbug.io/blog/test-automation-tools/cypress-vs-playwright/), [Katalon comparison](https://katalon.com/resources-center/blog/playwright-vs-cypress), [QA Wolf analysis](https://www.qawolf.com/blog/why-qa-wolf-chose-playwright-over-cypress), [Playwright DnD issue](https://github.com/microsoft/playwright/issues/13855), [Playwright SSE issue #15353](https://github.com/microsoft/playwright/issues/15353)

#### SSE Testing in E2E (Critical for The Helm)

Neither Playwright nor Cypress has first-class SSE mocking. For Playwright, `page.route()` does not intercept `EventSource` connections (content-type comes through as null). The recommended workaround is:

1. Use `context.addInitScript()` to replace the global `EventSource` with a mock class
2. Use `context.exposeFunction()` for test-to-page communication to trigger events programmatically
3. Alternatively, run the actual stub API server during E2E tests and test the full SSE flow end-to-end

For Cypress, `cy.intercept()` has similar documented issues with SSE connections not terminating properly and accumulating on the server.

Sources: [Playwright issue #15353](https://github.com/microsoft/playwright/issues/15353), [Cypress SSE PR #2054](https://github.com/cypress-io/cypress/pull/2054)

#### Animation Testing in E2E

Playwright provides a built-in `animations: "disabled"` option for screenshots/assertions that fast-forwards finite CSS animations to completion and cancels infinite animations. This is critical for visual regression testing of animation-heavy UIs.

Sources: [Playwright animation guide](https://www.thegreenreport.blog/articles/automating-animation-testing-with-playwright-a-practical-guide/automating-animation-testing-with-playwright-a-practical-guide.html), [Playwright snapshot docs](https://playwright.dev/docs/test-snapshots)

---

### 3. API Mocking: MSW 2.x Patterns

#### REST API Mocking with Vitest

MSW 2.x integrates with Vitest via `setupServer` from `msw/node`:

```typescript
// src/test/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Handlers use the `http` namespace:

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/conversations', () => {
    return HttpResponse.json([{ id: '1', title: 'Test' }])
  }),
]
```

Source: [MSW quick start](https://mswjs.io/docs/quick-start/), [MSW Node integration](https://mswjs.io/docs/integrations/node/)

#### SSE Mocking with MSW 2.x (v2.12.0+)

MSW added first-class SSE support via the `sse` namespace:

```typescript
import { sse } from 'msw'

export const handlers = [
  sse<{ message: string }>('/api/chat/stream', ({ client }) => {
    // Simulate token-by-token LLM streaming
    const tokens = ['Hello', ' ', 'world', '!']
    let i = 0

    const interval = setInterval(() => {
      if (i < tokens.length) {
        client.send({ data: tokens[i] })
        i++
      } else {
        clearInterval(interval)
        client.close()
      }
    }, 50)
  }),
]
```

Key features:
- Automatic event-stream encoding (no manual `TextEncoder` / `ReadableStream`)
- Type-safe `client.send()` with generic typing
- `client.close()` for connection termination
- Works in both browser and Node.js environments

Sources: [MSW SSE docs](https://mswjs.io/docs/sse/), [MSW SSE blog post](https://mswjs.io/blog/server-sent-events-are-here/), [MSW SSE API reference](https://mswjs.io/docs/api/sse/)

#### WebSocket Mocking with MSW 2.x

MSW is the first API mocking library to support REST, GraphQL, and WebSocket in a single tool:

```typescript
import { ws } from 'msw'

const chat = ws.link('wss://collab.example.com')

export const handlers = [
  chat.addEventListener('connection', ({ client, server }) => {
    // Mock server connection for collaboration
    client.addEventListener('message', (event) => {
      // Echo or transform messages for testing
      client.send(JSON.stringify({ type: 'cursor', user: 'test', ...JSON.parse(event.data) }))
    })
  }),
]
```

Key design decisions:
- Connections are closed by default (mock-first development)
- `server.connect()` enables real upstream connection when needed
- Client-to-server forwarding disabled by default; server-to-client forwarding enabled after connect
- WHATWG WebSocket Standard compliant (clients are `EventTarget` objects)

Sources: [MSW WebSocket docs](https://mswjs.io/docs/websocket/), [MSW WebSocket blog](https://mswjs.io/blog/enter-websockets/), [MSW ws API](https://mswjs.io/docs/api/ws/), [Epic Web Dev talk](https://www.epicweb.dev/talks/mocking-websockets-with-msw)

#### Alternative SSE Mocking (pre-MSW 2.12 or manual approach)

For lower-level control, SSE can be mocked via MSW's `http` namespace with a `ReadableStream`:

```typescript
import { http, HttpResponse } from 'msw'

const encoder = new TextEncoder()

http.get('/api/chat/stream', () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('event:token\ndata:Hello\n\n'))
      controller.enqueue(encoder.encode('event:token\ndata: world\n\n'))
      controller.close()
    },
  })
  return new HttpResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
})
```

Source: [Alex O'Callaghan SSE with MSW](https://alexocallaghan.com/mock-sse-with-msw)

---

### 4. Animation Testing

#### Unit/Component Level: Disabling Motion Animations

Motion (Framer Motion) provides a global configuration to skip animations in test environments:

```typescript
// src/test/setup.ts
import { MotionGlobalConfig } from 'framer-motion'
MotionGlobalConfig.skipAnimations = true
```

This was added in response to community feedback. Before this, tests with Framer Motion in jsdom were significantly slower (one user reported 60s dropping to 16s after mocking). The `skipAnimations` flag:

- Fast-forwards all animations to their end state
- Preserves lifecycle callbacks (onAnimationComplete, etc.)
- Does not require manual mocking of individual motion components
- Works with both Vitest and Jest

Alternative: `<MotionConfig reducedMotion="always">` wrapper disables transform and layout animations while preserving opacity/color animations.

Sources: [Motion issue #1690](https://github.com/framer/motion/issues/1690), [Motion issue #1160](https://github.com/framer/motion/issues/1160), [MotionConfig docs](https://motion.dev/docs/react-motion-config)

#### E2E Level: Playwright Animation Controls

Playwright provides `animations: "disabled"` for screenshots:

```typescript
await expect(page).toHaveScreenshot('sidebar-open.png', {
  animations: 'disabled',  // Fast-forwards CSS animations, cancels infinite ones
  mask: [page.locator('.dynamic-content')],  // Mask non-deterministic areas
})
```

For JS-driven animations (like Motion), use `page.clock` to fast-forward timers rather than real-time waits.

Source: [Playwright snapshot docs](https://playwright.dev/docs/test-snapshots), [Playwright animation guide](https://www.thegreenreport.blog/articles/automating-animation-testing-with-playwright-a-practical-guide/automating-animation-testing-with-playwright-a-practical-guide.html)

#### Visual Regression: Chromatic vs Percy vs Playwright Screenshots

| Criterion | Chromatic | Percy | Playwright (built-in) |
|---|---|---|---|
| Integration | Built by Storybook team; seamless Storybook integration | Works with Playwright, Cypress, Selenium, Storybook | Native `toHaveScreenshot()` |
| Scope | Component-level (Storybook stories) | Full pages, user flows, application states | Full pages, elements |
| Cross-browser | Cloud rendering across browsers | Chrome, Firefox, Safari screenshots | Local browser binaries only |
| AI diffing | Smart baseline management | Visual Review Agent (late 2025): 3x faster review, filters 40% noise | Pixel-diff only |
| Animation handling | Pauses CSS/JS animations before capture | Pauses animations | `animations: "disabled"` option |
| CI baseline issue | Cloud-rendered (no OS mismatch) | Cloud-rendered (no OS mismatch) | OS-dependent: Mac-captured baselines fail on Linux CI |
| Free tier | Free for open source; paid tiers start low | 5,000 screenshots/month free | Unlimited (self-hosted) |
| Best for | Teams using Storybook heavily | Full-flow visual testing across frameworks | Budget-conscious, simple needs |

Sources: [Chromatic Percy comparison](https://www.chromatic.com/compare/percy), [Percy screenshot tools](https://percy.io/blog/screenshot-testing-tools), [Bug0 tools guide](https://bug0.com/knowledge-base/visual-regression-testing-tools), [Visual regression comparison](https://teachmeidea.com/visual-regression-testing-percy-chromatic/)

---

### 5. Streaming Test Patterns

#### Component Tests: Testing SSE-Consuming Components

**Pattern 1: MSW SSE Handler (recommended)**

Use MSW's `sse()` handler to mock the streaming endpoint. The component under test uses the real `EventSource` or `fetch-event-source` client:

```typescript
import { sse } from 'msw'
import { server } from '../test/setup'
import { render, screen, waitFor } from '@testing-library/react'

test('renders streaming tokens as they arrive', async () => {
  server.use(
    sse('/api/chat/stream', ({ client }) => {
      client.send({ data: JSON.stringify({ token: 'Hello' }) })
      setTimeout(() => {
        client.send({ data: JSON.stringify({ token: ' world' }) })
        client.close()
      }, 10)
    })
  )

  render(<ChatStream conversationId="test" />)

  await waitFor(() => {
    expect(screen.getByText(/Hello world/)).toBeInTheDocument()
  })
})
```

**Pattern 2: Mock EventSource directly**

For environments where MSW's SSE support is unavailable:

```typescript
import { vi } from 'vitest'

class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  close = vi.fn()

  simulateMessage(data: string) {
    this.onmessage?.(new MessageEvent('message', { data }))
  }

  simulateError() {
    this.onerror?.(new Event('error'))
  }
}

vi.stubGlobal('EventSource', vi.fn(() => new MockEventSource()))
```

Libraries like `eventsourcemock` and `mocksse` provide pre-built versions of this pattern with configurable intervals for simulating token-by-token delivery.

Sources: [MSW SSE docs](https://mswjs.io/docs/sse/), [eventsourcemock](https://github.com/gcedo/eventsourcemock), [mocksse npm](https://www.npmjs.com/package/mocksse)

#### E2E Tests: Streaming in Playwright

Since `page.route()` cannot intercept EventSource connections, the recommended approaches are:

**Approach A: Run the stub API server**

Run the actual stub/dev API server during E2E tests. This tests the full SSE flow realistically. Use `webServer` in `playwright.config.ts`:

```typescript
export default defineConfig({
  webServer: [
    { command: 'npm run dev', port: 5173 },
    { command: 'npm run stub-api', port: 3001 },
  ],
})
```

**Approach B: Inject a mock EventSource via `addInitScript`**

```typescript
await context.addInitScript(() => {
  window.__mockSSE = new Map()
  const OriginalEventSource = window.EventSource
  window.EventSource = class extends OriginalEventSource {
    constructor(url: string) {
      super(url)
      window.__mockSSE.set(url, this)
    }
  }
})
```

Then use `context.exposeFunction()` to trigger events from test code.

**Approach C: Assert on streamed output appearance**

Rather than mocking SSE, assert on the progressive rendering behavior:

```typescript
// Wait for streaming indicator to appear
await expect(page.locator('.streaming-indicator')).toBeVisible()
// Wait for content to progressively appear
await expect(page.locator('.message-content')).toContainText('expected output', { timeout: 10000 })
// Wait for streaming to complete
await expect(page.locator('.streaming-indicator')).not.toBeVisible()
```

Sources: [Playwright issue #15353](https://github.com/microsoft/playwright/issues/15353), [Playwright mock docs](https://playwright.dev/docs/mock)

---

### 6. CI: GitHub Actions for Vitest + Playwright

#### Vitest Sharding in GitHub Actions

Vitest supports `--shard` for splitting tests across parallel CI jobs:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run --reporter=blob --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: .vitest-reports
```

Notes:
- Vitest splits by **test files**, not individual test cases
- `--reporter=blob` generates mergeable reports
- The shard count should roughly match CI runner CPU cores for optimal throughput

Sources: [Vitest improving performance](https://vitest.dev/guide/improving-performance), [Vitest sharding discussion #4752](https://github.com/vitest-dev/vitest/discussions/4752)

#### Playwright Sharding in GitHub Actions

```yaml
  e2e-tests:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-blob-report-${{ matrix.shardIndex }}
          path: blob-report

  merge-e2e-reports:
    needs: [e2e-tests]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          pattern: playwright-blob-report-*
          path: all-blob-reports
          merge-multiple: true
      - run: npx playwright merge-reports --reporter html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with:
          name: playwright-html-report
          path: playwright-report
```

Key configuration in `playwright.config.ts`:

```typescript
export default defineConfig({
  reporter: process.env.CI ? 'blob' : 'html',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,  // 1 worker per shard in CI
})
```

Sources: [Playwright sharding docs](https://playwright.dev/docs/test-sharding), [Playwright CI intro](https://playwright.dev/docs/ci-intro), [Playwright CI docs](https://playwright.dev/docs/ci)

#### Combined Workflow Considerations

- **Caching:** Cache `node_modules` and Playwright browser binaries (`~/.cache/ms-playwright`) across runs
- **Fail-fast: false** is important for both -- you want all shards to complete to get the full test report
- **Playwright browser install** can be cached with `actions/cache` keyed on `playwright` version in `package-lock.json`
- **Visual regression baselines** should be committed to the repo and generated on Linux to match CI environment, or use a cloud service (Chromatic/Percy) to avoid OS mismatch issues

Sources: [Playwright CI docs](https://playwright.dev/docs/ci), [GitHub Actions parallel testing](https://oneuptime.com/blog/post/2025-12-20-github-actions-parallel-tests/view), [Markaicode parallelization](https://markaicode.com/github-actions-playwright-parallelization/)

## Conclusions

### Recommended Stack

| Layer | Tool | Rationale |
|---|---|---|
| Unit/Component runner | **Vitest** | Native Vite integration, 5-28x faster than Jest, zero config for Vite projects |
| DOM environment | **Happy DOM** (default) + jsdom per-file | Speed with accuracy escape hatch |
| Component rendering | **React Testing Library** via `@testing-library/react` | Standard, works with Vitest out of the box |
| API mocking | **MSW 2.x** | Unified REST + SSE + WebSocket mocking; works in both unit and browser tests |
| E2E framework | **Playwright** | Free parallelization, cross-browser, superior auto-wait, animation controls |
| Visual regression | **Playwright screenshots** (start), upgrade to **Percy** or **Chromatic** if needed | Start free, scale to cloud when false-positive rate requires AI diffing |
| CI | **GitHub Actions** with matrix sharding | 4-shard parallelization for both Vitest and Playwright |

### Key Architectural Decisions

1. **SSE mocking strategy:** Use MSW `sse()` for component tests (first-class, type-safe). For E2E, run the stub API server for realistic testing rather than fighting EventSource interception limitations.

2. **Animation testing:** Use `MotionGlobalConfig.skipAnimations = true` in all component tests to avoid jsdom/happy-dom slowdowns. In Playwright, use `animations: "disabled"` for screenshot stability. Optionally add a small suite of animation-enabled tests for critical transitions.

3. **Visual regression approach:** Start with Playwright's built-in `toHaveScreenshot()` using Linux-generated baselines. If false positive rates become unmanageable or cross-browser screenshots are needed, introduce Percy (5,000 free screenshots/month) or Chromatic (if using Storybook).

4. **Browser Mode as future path:** Vitest 4.0's stable Browser Mode can replace happy-dom/jsdom for tests that need real browser behavior (CSS animations, IntersectionObserver, etc.), running tests in actual Chromium via Playwright without the overhead of full E2E setup.

5. **DnD testing:** Unit-test drag logic with React DnD's test backend. E2E-test with Playwright's `dragTo()`, falling back to HTML5 event dispatch (`dragstart`/`dragenter`/`dragover`/`drop`/`dragend`) for React DnD components that don't respond to synthetic mouse events.

## Sources

### Unit/Component Testing
- [Vitest vs Jest 2026 benchmarks (byteiota)](https://byteiota.com/vitest-vs-jest-2026-28x-faster-tests-real-migration-data/)
- [Vitest vs Jest migration guide (SitePoint)](https://www.sitepoint.com/vitest-vs-jest-2026-migration-benchmark/)
- [Bun vs Vitest vs Jest benchmarks (PkgPulse)](https://www.pkgpulse.com/blog/bun-test-vs-vitest-vs-jest-test-runner-benchmark-2026)
- [Vitest vs Jest (DevTools Research)](https://devtoolswatch.com/en/vitest-vs-jest-2026)
- [Vitest official comparisons](https://vitest.dev/guide/comparisons.html)
- [Vitest Browser Mode (InfoQ)](https://www.infoq.com/news/2025/06/vitest-browser-mode-jsdom/)
- [Vitest Browser Mode docs](https://vitest.dev/guide/browser/)
- [jsdom vs happy-dom discussion](https://github.com/vitest-dev/vitest/discussions/1607)
- [jsdom vs happy-dom comparison (Sean Coughlin)](https://blog.seancoughlin.me/jsdom-vs-happy-dom-navigating-the-nuances-of-javascript-testing)
- [happy-dom performance discussion](https://github.com/capricorn86/happy-dom/discussions/1438)
- [Vitest environment docs](https://vitest.dev/guide/environment)

### E2E Testing
- [Cypress vs Playwright 2026 (BugBug)](https://bugbug.io/blog/test-automation-tools/cypress-vs-playwright/)
- [Playwright vs Cypress (Katalon)](https://katalon.com/resources-center/blog/playwright-vs-cypress)
- [Playwright vs Cypress enterprise guide (Medium)](https://devin-rosario.medium.com/playwright-vs-cypress-the-2026-enterprise-testing-guide-ade8b56d3478)
- [Why QA Wolf chose Playwright](https://www.qawolf.com/blog/why-qa-wolf-chose-playwright-over-cypress)
- [Playwright vs Cypress (BrowserStack)](https://www.browserstack.com/guide/playwright-vs-cypress)
- [Playwright SSE issue #15353](https://github.com/microsoft/playwright/issues/15353)
- [Cypress SSE PR #2054](https://github.com/cypress-io/cypress/pull/2054)
- [Playwright DnD issue #13855](https://github.com/microsoft/playwright/issues/13855)
- [Playwright DnD with React (wanago.io)](https://wanago.io/2024/05/06/react-drag-drop-e2e-playwright/)
- [React DnD testing docs](https://react-dnd.github.io/react-dnd/docs/testing)

### API Mocking
- [MSW SSE documentation](https://mswjs.io/docs/sse/)
- [MSW SSE blog announcement](https://mswjs.io/blog/server-sent-events-are-here/)
- [MSW SSE API reference](https://mswjs.io/docs/api/sse/)
- [MSW WebSocket documentation](https://mswjs.io/docs/websocket/)
- [MSW WebSocket blog](https://mswjs.io/blog/enter-websockets/)
- [MSW ws API reference](https://mswjs.io/docs/api/ws/)
- [Mock SSE with MSW (Alex O'Callaghan)](https://alexocallaghan.com/mock-sse-with-msw)
- [MSW quick start](https://mswjs.io/docs/quick-start/)
- [MSW Node integration](https://mswjs.io/docs/integrations/node/)
- [eventsourcemock](https://github.com/gcedo/eventsourcemock)
- [mocksse (npm)](https://www.npmjs.com/package/mocksse)

### Animation Testing
- [Motion issue #1690 -- testing mocks](https://github.com/framer/motion/issues/1690)
- [Motion issue #1160 -- instant finish flag](https://github.com/framer/motion/issues/1160)
- [MotionConfig docs](https://motion.dev/docs/react-motion-config)
- [Mocking Framer Motion v9 (DEV)](https://dev.to/pgarciacamou/mocking-framer-motion-v9-7jh)
- [Playwright animation guide](https://www.thegreenreport.blog/articles/automating-animation-testing-with-playwright-a-practical-guide/automating-animation-testing-with-playwright-a-practical-guide.html)
- [Playwright snapshot docs](https://playwright.dev/docs/test-snapshots)
- [Chromatic animation handling](https://www.chromatic.com/docs/animations/)

### Visual Regression
- [Chromatic vs Percy](https://www.chromatic.com/compare/percy)
- [Percy screenshot testing tools](https://percy.io/blog/screenshot-testing-tools)
- [Visual regression tools 2026 (Bug0)](https://bug0.com/knowledge-base/visual-regression-testing-tools)
- [Percy vs Chromatic comparison](https://teachmeidea.com/visual-regression-testing-percy-chromatic/)
- [Percy Visual Review Agent (Bug0)](https://bug0.com/knowledge-base/percy-visual-regression-testing)
- [Playwright visual regression guide (Bug0)](https://bug0.com/knowledge-base/playwright-visual-regression-testing)

### CI/CD
- [Playwright sharding docs](https://playwright.dev/docs/test-sharding)
- [Playwright CI setup](https://playwright.dev/docs/ci-intro)
- [Playwright CI docs](https://playwright.dev/docs/ci)
- [Vitest improving performance](https://vitest.dev/guide/improving-performance)
- [Vitest sharding discussion #4752](https://github.com/vitest-dev/vitest/discussions/4752)
- [GitHub Actions parallel tests (OneUptime)](https://oneuptime.com/blog/post/2025-12-20-github-actions-parallel-tests/view)
- [Playwright parallelization (Markaicode)](https://markaicode.com/github-actions-playwright-parallelization/)
- [Currents orchestration docs](https://docs.currents.dev/getting-started/ci-setup/github-actions/playwright-github-actions)
