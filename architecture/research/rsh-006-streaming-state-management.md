# RSH-006: What State Management Approach Best Handles Concurrent LLM Streaming in a React SPA?

**Date:** 2026-03-21 | **Status:** Completed

## Question

Given 20+ cards on screen with 3+ streaming simultaneously (LLM responses arriving token-by-token via SSE), cards updating in place mid-stream, cross-card references reacting when upstream cards change, a mix of server-fetched state and local ephemeral state (streaming buffers), plus collaboration state from WebSocket -- what is the simplest state management approach that works?

## Context

The Helm is a React SPA where each "card" represents an LLM-powered unit of work. The key technical challenges are:

1. **Re-render isolation**: When Card A is streaming tokens at 30/sec, Cards B through T must not re-render.
2. **External event integration**: SSE streams and WebSocket collaboration events originate outside React's lifecycle and must write into the store without requiring a mounted component.
3. **Cross-card reactivity**: When Card A finishes streaming, Card D (which references Card A's output) must react and potentially trigger its own LLM call.
4. **Ephemeral vs. persistent state**: Streaming buffers are throwaway; final card content is persistent; collaboration cursors are ephemeral but shared.
5. **Simplicity**: The winning solution must be the easiest to understand, debug, and maintain -- not the most architecturally elegant.

### Streaming Data Flow

```
SSE EventSource ──> buffer (outside React) ──> batched flush ──> store ──> card component
WebSocket ──> collaboration store ──> presence/cursor overlays
Cross-card deps ──> derived/computed state ──> dependent card components
```

## Findings

### Critical Architectural Insight: Buffer Outside React

Regardless of which state library is chosen, the streaming architecture requires a **buffer layer between the network and React state**. Direct setState calls from SSE `onmessage` at 30+ tokens/sec will cause render thrashing. The proven pattern is:

1. Accumulate tokens in a mutable ref or plain JS variable (zero renders).
2. Flush to React state on a `requestAnimationFrame` or `setInterval(fn, 50)` cadence (~20 updates/sec).
3. Use `React.memo` with custom comparators on card components to prevent cascade re-renders.

This pattern is library-agnostic and is documented as the recommended approach for high-frequency streaming in React 18+. [Source: [Why React Apps Lag With Streaming Text](https://akashbuilds.com/blog/chatgpt-stream-text-react)]

### Library Comparison

#### Bundle Size

| Library | Gzipped Size | Notes |
|---------|-------------|-------|
| **Nanostores** | 0.3-0.8 KB | Smallest by far. Core atom is 265 bytes brotlied. Zero dependencies. [Source: [GitHub](https://github.com/nanostores/nanostores)] |
| **Zustand** | ~1.1 KB | Core only. ~3 KB with devtools + persist middleware. [Source: [React Libraries Performance Guide](https://www.reactlibraries.com/blog/zustand-vs-jotai-vs-valtio-performance-guide-2025)] |
| **Jotai** | ~2.9 KB | Core only. Minimal core API ~2 KB. [Source: [React Libraries Performance Guide](https://www.reactlibraries.com/blog/zustand-vs-jotai-vs-valtio-performance-guide-2025)] |
| **Valtio** | ~3.5 KB | Proxy-based. [Source: [React Libraries Performance Guide](https://www.reactlibraries.com/blog/zustand-vs-jotai-vs-valtio-performance-guide-2025)] |
| **Redux Toolkit** | ~14 KB | RTK alone. ~19 KB with react-redux. ~30 KB with RTK Query. [Source: [Bundlephobia](https://bundlephobia.com/package/@reduxjs/toolkit)] |
| **TanStack Query** | ~13 KB | Not a state manager; data-fetching layer. [Source: [TanStack Query Docs](https://tanstack.com/query/v5/docs/reference/streamedQuery)] |
| **React Context** | 0 KB | Built-in. No additional bundle cost. |

#### Re-render Isolation (Can one card stream without re-rendering others?)

| Library | Isolation Method | Automatic? | Verdict |
|---------|-----------------|------------|---------|
| **Zustand** | Selectors: `useStore(s => s.cards[id])`. Components only re-render when their selected slice changes. Uses `useSyncExternalStore` internally for concurrent-mode safety. | Manual (must write selectors) | Good -- but requires discipline. Returning new objects from selectors causes unnecessary renders. [Source: [DeepWiki Selectors](https://deepwiki.com/pmndrs/zustand/2.3-selectors-and-re-rendering)] |
| **Jotai** | Atom-per-card via `atomFamily(cardId)`. Components subscribe only to their atom. Derived atoms auto-track dependencies. | Automatic | Excellent -- "only two components re-render when a node is marked completed: the node that was clicked, and the count display." [Source: [Harbor Blog](https://runharbor.com/blog/2025-10-26-improving-deeply-nested-react-render-performance-with-jotai-atomic-state)] |
| **Valtio** | Proxy-based micro-subscriptions. Components only re-render when properties they actually accessed change. | Automatic | Excellent -- "more granular than Redux selectors and requires no manual optimization." [Source: [Dev.to Valtio](https://dev.to/genildocs/valtio-the-proxy-based-state-that-makes-react-state-management-feel-like-magic-5c0l)] |
| **Nanostores** | Atom-per-card. Each store is independent. Components subscribe via `useStore()`. | Automatic | Good -- same atomic model as Jotai but simpler API. [Source: [GitHub](https://github.com/nanostores/nanostores)] |
| **Redux Toolkit** | `useSelector` with shallow equality. Normalized entity state with `createEntityAdapter`. | Manual (selectors required) | Adequate -- works but verbose. [Source: [RTK Query Streaming](https://redux-toolkit.js.org/rtk-query/usage/streaming-updates)] |
| **TanStack Query** | Per-query cache keys. Each card has its own query. | Automatic | Good for server state; not designed for ephemeral streaming buffers. |
| **Context + useReducer** | All consumers of a context re-render on any change. Splitting into many contexts is the workaround. | None | Poor -- "any component that consumes a context will be forced to re-render, even if it only cares about part of the context value." [Source: [Niels Krijger](https://www.nielskrijger.com/posts/2021-02-16/use-reducer-and-use-context/), [Markos Kon](https://markoskon.com/usereducer-and-usecontext-a-performance-problem/)] |

#### External Event Integration (SSE/WebSocket writing to store outside React)

| Library | External Access | Quality |
|---------|----------------|---------|
| **Zustand** | First-class. `createStore` from `zustand/vanilla` returns plain JS store with `getState()`, `setState()`, `subscribe()`. No React required. Vanilla store can be used in SSE handlers, WebSocket listeners, service workers. | Excellent [Source: [Zustand GitHub](https://github.com/pmndrs/zustand), [Discussion #2333](https://github.com/pmndrs/zustand/discussions/2333)] |
| **Jotai** | Supported via `getDefaultStore().set(atom, value)` or `createStore()`. Works but is less idiomatic -- Jotai's mental model is React-first. "As long as you use only one (default) store, you can use it interchangeably with hooks." | Adequate [Source: [Jotai Store Docs](https://jotai.org/docs/core/store), [Discussion #1478](https://github.com/pmndrs/jotai/discussions/1478)] |
| **Valtio** | First-class. `proxy()` and `subscribe()` from `valtio/vanilla` work in any JS context. Just mutate the proxy object from anywhere. | Excellent [Source: [Valtio Docs](https://valtio.dev/docs/introduction/getting-started)] |
| **Nanostores** | First-class. `store.set(value)` and `store.subscribe(cb)` work in vanilla JS. `onMount` for lifecycle. | Excellent [Source: [GitHub](https://github.com/nanostores/nanostores)] |
| **Redux Toolkit** | Supported via `store.dispatch()` and `store.getState()`. RTK Query's `onCacheEntryAdded` lifecycle is purpose-built for SSE/WebSocket streaming with `updateCachedData` using Immer drafts. | Good (verbose but battle-tested) [Source: [RTK Query Streaming Updates](https://redux-toolkit.js.org/rtk-query/usage/streaming-updates)] |
| **TanStack Query** | `queryClient.setQueryData()` from anywhere. Experimental `streamedQuery` for AsyncIterables. | Adequate [Source: [TanStack streamedQuery](https://tanstack.com/query/v5/docs/reference/streamedQuery)] |
| **Context + useReducer** | No external access. `dispatch` is only available inside the React tree. Must use refs or module-level variables as workarounds. | Poor |

#### Cross-Card Reactivity (Derived/computed state from upstream cards)

| Library | Mechanism | Quality |
|---------|-----------|---------|
| **Jotai** | Derived atoms: `atom((get) => get(cardAtom(a)) + get(cardAtom(b)))`. Automatic dependency tracking. Atom graph handles cascading updates. | Excellent -- purpose-built for this. "Atoms can derive another atom and form a graph." [Source: [Jotai Comparison](https://jotai.org/docs/basics/comparison)] |
| **Zustand** | `subscribe` with selectors, or computed values in the store. No built-in dependency graph; must manually wire derived state. | Adequate -- works but manual. |
| **Valtio** | `derive` utility or `proxyWithComputed`. Proxy tracks property access automatically. | Good [Source: [Valtio Docs](https://valtio.dev/)] |
| **Nanostores** | `computed(store, fn)` creates derived stores. Callback runs on every dependency change. | Good [Source: [GitHub](https://github.com/nanostores/nanostores)] |
| **Redux Toolkit** | `createSelector` (reselect). Manual but well-understood memoized selectors. | Adequate |
| **TanStack Query** | Query dependencies via `enabled` flag. Not designed for fine-grained reactivity. | Poor for this use case |
| **Context + useReducer** | Manual. Must thread derived values through context or compute in components. | Poor |

#### DevTools & Debugging

| Library | DevTools Support | Quality |
|---------|-----------------|---------|
| **Zustand** | Redux DevTools via `devtools` middleware. Time-travel debugging, action logging, state inspection. Multiple stores get separate connections. Also: Zukeeper (community devtools). | Excellent [Source: [DeepWiki devtools](https://deepwiki.com/pmndrs/zustand/3.2-devtools-middleware)] |
| **Jotai** | `jotai-devtools` package: UI-based inspector, time-travel, async atom support. Also integrates with Redux DevTools via `useAtomsDevtools`. | Good [Source: [jotai-devtools GitHub](https://github.com/jotaijs/jotai-devtools)] |
| **Valtio** | Redux DevTools via `devtools()` from `valtio/utils`. State inspection and dispatch. | Good [Source: [Valtio devtools docs](https://valtio.dev/docs/api/utils/devtools)] |
| **Nanostores** | Vue Devtools plugin exists. React devtools support is limited. Feature request for dumping all store state exists but is not fully resolved. | Poor for React [Source: [GitHub Issue #171](https://github.com/nanostores/nanostores/issues/171)] |
| **Redux Toolkit** | Best-in-class. Redux DevTools is the gold standard: time-travel, action replay, state diff, export/import. | Excellent |
| **TanStack Query** | Dedicated TanStack Query DevTools panel. Excellent for cache inspection. | Excellent (for its domain) |
| **Context + useReducer** | React DevTools only. Limited visibility into state shape and update flow. | Poor |

#### Collaboration / WebSocket Integration

| Library | Pattern | Quality |
|---------|---------|---------|
| **Zustand** | `@liveblocks/zustand` for full multiplayer. `zustand-multiplayer` for WebSocket sync. Vanilla store can hold WebSocket reference. | Excellent ecosystem [Source: [Liveblocks Zustand](https://liveblocks.io/docs/api-reference/liveblocks-zustand)] |
| **Jotai** | `atomWithObservable` for rxjs-based streams. No dedicated multiplayer library. | Adequate |
| **Valtio** | `@liveblocks/react` works alongside Valtio. No dedicated middleware. | Adequate |
| **Redux Toolkit** | RTK Query `onCacheEntryAdded` handles WebSocket natively. Mature middleware ecosystem. | Good |
| **Others** | Nanostores, TanStack Query, Context: no dedicated collaboration tooling. | Limited |

### Streaming-Specific Patterns by Library

#### Zustand: Vanilla Store + RAF Buffer

```
// Conceptual pattern (not runnable code)
// 1. Create vanilla store for each card's streaming buffer
// 2. SSE onmessage writes to vanilla store (no React render)
// 3. RAF loop reads vanilla store, flushes to React-bound store
// 4. Card component uses selector: useStore(s => s.cards[cardId])
```

Zustand's vanilla store API (`zustand/vanilla`) is explicitly designed for this. The store exists outside React, SSE handlers call `setState` on it, and React components subscribe via selectors. This is the most straightforward pattern for the buffer-then-flush architecture. [Source: [Zustand GitHub](https://github.com/pmndrs/zustand)]

#### Jotai: atomFamily + Store API

```
// Conceptual pattern
// 1. atomFamily(cardId) creates per-card atoms
// 2. SSE handler uses getDefaultStore().set(cardAtom(id), newTokens)
// 3. Only the card component reading that atom re-renders
// 4. Derived atoms auto-update when dependencies change
```

Jotai's atom graph is powerful for cross-card dependencies, but the external store API (`getDefaultStore`) is less ergonomic than Zustand's vanilla API. The atomFamily pattern naturally provides per-card isolation. [Source: [Jotai Store Docs](https://jotai.org/docs/core/store)]

#### Valtio: Direct Proxy Mutation

```
// Conceptual pattern
// 1. const state = proxy({ cards: { [id]: { tokens: [], status: 'idle' } } })
// 2. SSE handler: state.cards[id].tokens.push(newToken)  -- just mutate
// 3. Component uses useSnapshot(state).cards[id] -- only re-renders on accessed props
```

Valtio's mutable API is the simplest to write. SSE handlers just mutate the proxy. However, proxy-based reactivity can be harder to debug and reason about at scale. [Source: [Valtio Getting Started](https://valtio.dev/docs/introduction/getting-started)]

#### Redux Toolkit: RTK Query onCacheEntryAdded

```
// Conceptual pattern
// 1. Define streaming endpoint with onCacheEntryAdded lifecycle
// 2. Await cacheDataLoaded, then open EventSource
// 3. On each SSE message, call updateCachedData(draft => { draft.tokens.push(token) })
// 4. Await cacheEntryRemoved for cleanup
```

RTK Query has a purpose-built lifecycle for this exact scenario. It handles connection setup, cache updates via Immer drafts, and cleanup. However, the boilerplate is significant compared to Zustand or Valtio. [Source: [RTK Query Streaming Updates](https://redux-toolkit.js.org/rtk-query/usage/streaming-updates)]

### Adoption & Ecosystem (2026)

Zustand is now the most downloaded React state management library with ~25M weekly downloads and ~57K GitHub stars, surpassing Redux. [Source: [PkgPulse Blog](https://www.pkgpulse.com/blog/react-state-management-2026)] This matters for hiring, community support, and finding examples of streaming patterns.

### Summary Matrix

| Criterion | Zustand | Jotai | Valtio | Nanostores | Redux TK | TanStack Q | Context |
|-----------|---------|-------|--------|------------|----------|------------|---------|
| Re-render isolation | Good | Excellent | Excellent | Good | Adequate | Good | Poor |
| External event integration | Excellent | Adequate | Excellent | Excellent | Good | Adequate | Poor |
| Cross-card reactivity | Adequate | Excellent | Good | Good | Adequate | Poor | Poor |
| DevTools | Excellent | Good | Good | Poor | Excellent | Excellent | Poor |
| Bundle size | Excellent | Good | Good | Excellent | Poor | Adequate | Excellent |
| Simplicity / learning curve | Excellent | Good | Good | Good | Poor | Good | Excellent |
| Collaboration ecosystem | Excellent | Adequate | Adequate | Poor | Good | Poor | Poor |
| Streaming-specific patterns | Excellent | Good | Excellent | Adequate | Good | Adequate | Poor |
| Community / adoption | Excellent | Good | Adequate | Adequate | Good | Excellent | Excellent |

## Conclusions

### Recommendation: Zustand

**Zustand is the simplest thing that works for this problem.** Here is why:

1. **Vanilla store API is purpose-built for our SSE/WebSocket integration needs.** `createStore` from `zustand/vanilla` gives a plain JS store that SSE handlers and WebSocket listeners can write to directly -- no React component needed, no workarounds. This is the single most important requirement and Zustand handles it most naturally.

2. **Selectors provide sufficient re-render isolation.** With `useStore(s => s.cards[cardId])`, each card component only re-renders when its specific card data changes. This requires writing selectors (unlike Jotai/Valtio which are automatic), but selectors are simple and explicit -- they are easier to debug than proxy magic or atom graphs.

3. **Smallest learning curve with the largest community.** At ~25M weekly downloads, Zustand has the most examples, blog posts, and Stack Overflow answers. The API surface is tiny: `create`, `useStore`, `getState`, `setState`, `subscribe`.

4. **Redux DevTools integration is one middleware call away.** Time-travel debugging during streaming is invaluable for diagnosing race conditions and state corruption.

5. **Collaboration ecosystem exists.** `@liveblocks/zustand` provides a ready-made path for multiplayer state sync when collaboration features are needed.

6. **Cross-card reactivity is the one gap, and it is manageable.** Zustand lacks Jotai's automatic dependency graph. For cross-card references, use `subscribe` with selectors to trigger derived updates, or compute derived values in the store itself. This is more manual than Jotai but straightforward.

### When to Reconsider

- **If cross-card dependency graphs become deeply nested (5+ levels of derivation):** Consider Jotai's atom graph, which handles cascading derived state automatically.
- **If the card count grows to 100+ with complex interdependencies:** Jotai's `atomFamily` with automatic subscription management would reduce boilerplate vs. manually wired Zustand selectors.
- **If bundle size is a hard constraint (e.g., embedded widget):** Nanostores at 0.3 KB is dramatically smaller, though its React devtools story is weak.

### Recommended Architecture Pattern

```
Layer 1: Network (outside React)
  - SSE EventSource per active stream
  - WebSocket for collaboration
  - Token buffers in plain JS variables or Zustand vanilla stores

Layer 2: State (Zustand)
  - Main store: card entities (Map<cardId, CardState>)
  - Collaboration store: presence, cursors (separate Zustand store)
  - RAF/interval flush from Layer 1 buffers into Layer 2

Layer 3: React Components
  - Each card uses: useStore(s => s.cards[cardId])
  - Cross-card derived state via subscribe + selectors
  - React.memo on card components with custom comparators
```

### Hybrid Option Worth Noting

Zustand for the card entity store + TanStack Query for server-fetched data (saved cards, user settings, API calls that are not streaming) is a well-documented combination. TanStack Query handles caching, refetching, and stale-while-revalidate for traditional request/response data, while Zustand handles the streaming and ephemeral state that TanStack Query was not designed for.

## Sources

- [Zustand GitHub Repository](https://github.com/pmndrs/zustand)
- [Zustand Selectors & Re-rendering - DeepWiki](https://deepwiki.com/pmndrs/zustand/2.3-selectors-and-re-rendering)
- [Zustand devtools Middleware - DeepWiki](https://deepwiki.com/pmndrs/zustand/3.2-devtools-middleware)
- [Zustand WebSocket Discussion #1651](https://github.com/pmndrs/zustand/discussions/1651)
- [Zustand External Usage Discussion #2333](https://github.com/pmndrs/zustand/discussions/2333)
- [Jotai Official Documentation](https://jotai.org/)
- [Jotai Comparison Page](https://jotai.org/docs/basics/comparison)
- [Jotai Store API](https://jotai.org/docs/core/store)
- [Jotai atomFamily](https://jotai.org/docs/utilities/family)
- [Jotai DevTools GitHub](https://github.com/jotaijs/jotai-devtools)
- [Jotai Atom Access Outside React - Discussion #1478](https://github.com/pmndrs/jotai/discussions/1478)
- [Improving Deeply Nested React Render Performance with Jotai - Harbor](https://runharbor.com/blog/2025-10-26-improving-deeply-nested-react-render-performance-with-jotai-atomic-state)
- [Valtio Official Documentation](https://valtio.dev/)
- [Valtio GitHub Repository](https://github.com/pmndrs/valtio)
- [Valtio devtools](https://valtio.dev/docs/api/utils/devtools)
- [Nanostores GitHub Repository](https://github.com/nanostores/nanostores)
- [Nanostores React Integration](https://github.com/nanostores/react)
- [Redux Toolkit RTK Query Streaming Updates](https://redux-toolkit.js.org/rtk-query/usage/streaming-updates)
- [Redux Toolkit Bundle Size - Bundlephobia](https://bundlephobia.com/package/@reduxjs/toolkit)
- [TanStack Query streamedQuery Reference](https://tanstack.com/query/v5/docs/reference/streamedQuery)
- [TanStack Query SSE Discussion #418](https://github.com/TanStack/query/discussions/418)
- [Zustand vs Jotai vs Valtio Performance Guide 2025](https://www.reactlibraries.com/blog/zustand-vs-jotai-vs-valtio-performance-guide-2025)
- [Why React Apps Lag With Streaming Text - Akash Builds](https://akashbuilds.com/blog/chatgpt-stream-text-react)
- [React Context + useReducer Re-render Problem](https://www.nielskrijger.com/posts/2021-02-16/use-reducer-and-use-context/)
- [Context + useReducer Performance Problem - Markos Kon](https://markoskon.com/usereducer-and-usecontext-a-performance-problem/)
- [useSyncExternalStore in React - Dev.to](https://dev.to/saiful7778/usesyncexternalstore-in-react-the-right-way-to-subscribe-to-external-data-p6)
- [Zustand useSyncExternalStore Tearing Prevention - Egghead](https://egghead.io/lessons/react-prevent-screen-tearing-for-react-18-in-a-zustand-like-app-with-usesyncexternalstore)
- [Vercel AI SDK useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [Vercel AI SDK 5 Announcement](https://vercel.com/blog/ai-sdk-5)
- [Streaming Multiple AI Models in Parallel - Robin Wieruch](https://www.robinwieruch.de/react-ai-sdk-multiple-streams/)
- [Liveblocks Zustand Integration](https://liveblocks.io/docs/api-reference/liveblocks-zustand)
- [State Management Trends React 2025 - Makers Den](https://makersden.io/blog/react-state-management-in-2025)
- [Zustand Popularity 2026 - PkgPulse](https://www.pkgpulse.com/blog/react-state-management-2026)
- [React State Management 2025 - Developerway](https://www.developerway.com/posts/react-state-management-2025)
- [Zustand vs Redux Toolkit Comparison - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/zustand-vs-redux-toolkit-vs-jotai/)
- [SSE Streaming for LLMs - Hivenet](https://compute.hivenet.com/post/llm-streaming-sse-websockets)
- [RTK Query SSE Discussion #3701](https://github.com/reduxjs/redux-toolkit/issues/3701)
- [Real-Time React with SSE and RTK Query - Medium](https://medium.com/@Delorean/real-time-react-with-sse-and-redux-toolkit-query-topic-filtering-auto-cleanup-8707df8c6d93)
