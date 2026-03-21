# RSH-009: Streaming Chat UI for a Secondary Chat Panel

**Date:** 2026-03-21 | **Status:** Completed

## Question

What is the best approach to implement a streaming chat UI for The Helm's secondary
chat panel? The panel opens contextually (card errors, user-provided context, collaborator
discussion) and must support streaming LLM responses, retry/regenerate, context injection
mid-conversation, and bidirectional updates between chat state and card state.

## Context

The chat panel in The Helm is **secondary UI** -- it is not a full chat application. It
opens as a slide-in drawer/panel when:
- A card has an error and the user wants to discuss or resolve it
- A user wants to provide additional context to improve results
- Collaborators discuss findings or parameters

**Vignette 2 (canonical use case):** A query returns empty results. The scientist opens
the chat panel, provides missing context ("the samples are from the NMDC Stegen
collection"). The AI retries the query with corrected parameters. The card updates
in-place with new results -- the chat panel is the mechanism, the card is the outcome.

**Technical context:** The Helm is a React 18 SPA with TypeScript, Redux Toolkit for
state management, RTK Query for API state, and Material-UI components. The backend
endpoint for chat will serve SSE-formatted streaming responses.

## Findings

### 1. Vercel AI SDK (`useChat` / `useCompletion`)

The Vercel AI SDK (`@ai-sdk/react`) provides React hooks purpose-built for streaming
LLM chat interfaces. Despite the "Vercel" branding, the SDK is framework-agnostic and
deployment-agnostic.

#### Does it work outside Vercel?

**Yes.** The SDK is an open-source npm package (`@ai-sdk/react`) with no Vercel
deployment dependency. It works with any React application -- Next.js, Vite, Create
React App, or plain React SPAs. The `useChat` hook accepts a configurable `transport`
parameter that determines how messages are sent and responses are received.
([AI SDK Docs: Introduction](https://ai-sdk.dev/docs/introduction),
[GitHub Discussion: Vercel AI SDK without NextJS](https://github.com/orgs/community/discussions/177224),
[Robin Wieruch: Full-Stack React.js Chat with AI SDK](https://www.robinwieruch.de/react-ai-sdk-chat/))

#### Does it work with any SSE endpoint?

**Yes, via the Data Stream Protocol.** As of AI SDK 3.4+, the SDK defines an open
[Data Stream Protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) that any
backend (Python, Go, Java, Rust) can implement. The protocol uses standard SSE format
with a `x-vercel-ai-ui-message-stream: v1` header. Key message types include:

| Message Type | Purpose |
|---|---|
| `text-start` / `text-delta` / `text-end` | Streaming text content with unique IDs |
| `tool-input-start` / `tool-input-delta` / `tool-input-available` | Streaming tool call parameters |
| `tool-output-available` | Tool execution results |
| `start-step` / `finish-step` | Multi-step agent flow boundaries |
| `error` | Error messages appended to response |
| `abort` | Stream cancellation with reason |

([AI SDK Docs: Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol),
[AI SDK 3.4 announcement](https://vercel.com/blog/ai-sdk-3-4))

#### Transport architecture (AI SDK 5+)

AI SDK 5.0 introduced a transport-based architecture that fully decouples the hook
from any specific backend:

| Transport | Description | Use Case |
|---|---|---|
| `DefaultChatTransport` | HTTP POST to configurable endpoint (default `/api/chat`) | Standard backend integration |
| `DirectChatTransport` | In-process agent invocation, no HTTP | Testing, SSR, single-process apps |
| Custom transport | Implement `ChatTransport` interface | WebSockets, gRPC, custom protocols |

The `DefaultChatTransport` supports custom endpoints, dynamic headers (e.g., Bearer
tokens), credentials, and request transformation via `prepareSendMessagesRequest`.
([AI SDK Docs: Transport](https://ai-sdk.dev/docs/ai-sdk-ui/transport),
[AI SDK 5 announcement](https://vercel.com/blog/ai-sdk-5))

#### Redux integration

AI SDK 5+ fully decouples hook state, allowing integration with external stores like
Redux, Zustand, or MobX. The hook no longer manages input state internally -- you
control it. This is critical for The Helm since chat state must coordinate with Redux-
managed card state.
([AI SDK 5 announcement](https://vercel.com/blog/ai-sdk-5))

#### Key `useChat` capabilities

| Feature | Details |
|---|---|
| `append()` | Programmatically add messages (inject context without form input) |
| `stop()` | Abort current streaming response via AbortController |
| `onFinish` | Callback when response completes; receives all messages + abort/error flags |
| `onError` | Error callback for fetch failures |
| `addToolOutput()` | Provide tool results back to the model |
| `maxToolRoundtrips` | Enable multi-step tool calling (model uses tool results before responding) |

([AI SDK Docs: useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat),
[GitHub Discussion: Programmatically add messages](https://github.com/vercel/ai/discussions/2404),
[GitHub Discussion: Add context to useChat](https://github.com/vercel/ai/discussions/1869))

#### Testing and mocking

The AI SDK provides first-class testing utilities via `ai/test`:

- **`MockLanguageModelV3`**: Mock LLM with custom `doGenerate` / `doStream` methods
- **`simulateReadableStream`**: Simulate streaming with configurable delays (`initialDelayInMs`, `chunkDelayInMs`)
- **`DirectChatTransport`**: Use as a test transport to bypass HTTP entirely

This enables deterministic, repeatable tests without hitting any LLM provider.
([AI SDK Docs: Testing](https://ai-sdk.dev/docs/ai-sdk-core/testing))

#### Assessment

| Criterion | Rating | Notes |
|---|---|---|
| Works outside Vercel | Yes | No deployment dependency |
| Works with custom SSE backend | Yes | Data Stream Protocol; any language |
| Redux integration | Yes | Decoupled state in v5+ |
| Streaming + abort | Yes | Built-in stop(), AbortController |
| Tool calling / context injection | Yes | append(), addToolOutput(), maxToolRoundtrips |
| Testing / mocking | Excellent | MockLanguageModelV3, simulateReadableStream |
| Bundle size overhead | Moderate | @ai-sdk/react is a focused package |
| Community / maintenance | Excellent | 20M+ monthly npm downloads; active development (v6 released late 2025) |
| Risk | Low | MIT license, large community, backed by Vercel |

### 2. Roll Your Own: Fetch + ReadableStream

A custom implementation using the Fetch API with `ReadableStream` for SSE parsing.

#### Core pattern

```
fetch('/api/chat', { method: 'POST', headers, body, signal: abortController.signal })
  .then(res => res.body.getReader())
  .then(reader => { /* read chunks, decode, parse SSE, update state */ })
```

#### EventSource vs. Fetch comparison

| Capability | Native EventSource | Fetch + ReadableStream |
|---|---|---|
| HTTP methods | GET only | Any (POST, PUT, etc.) |
| Custom headers (Auth) | Not supported | Fully supported |
| Request body | Not supported | Fully supported |
| Abort/cancel | Close connection only | AbortController with AbortError |
| Auto-reconnect | Built-in | Manual implementation required |
| Browser support | Universal | Universal (modern browsers) |
| Page visibility handling | None | Manual (or use library) |

**Verdict:** Native `EventSource` is unsuitable for authenticated LLM chat endpoints
that require POST + Authorization headers. Fetch with ReadableStream is the correct
primitive.
([Medium: EventSource vs Fetch API](https://medium.com/@piyalidas.it/javascript-eventsource-vs-fetch-api-d29157e48433),
[LogRocket: Using Fetch Event Source](https://blog.logrocket.com/using-fetch-event-source-server-sent-events-react/),
[Medium: SSE Using POST Without EventSource](https://medium.com/@david.richards.tech/sse-server-sent-events-using-a-post-request-without-eventsource-1c0bd6f14425))

#### SSE parsing helpers

| Library | Status | Notes |
|---|---|---|
| `@microsoft/fetch-event-source` | Unmaintained (last release April 2021, 51 open issues) | Was the standard; now stale. 2.8k stars. |
| `@sentool/fetch-event-source` | Active | Refactored fork of Microsoft's library; works in Node.js + browser |
| `eventsource-parser` | Active | Lightweight parser for SSE streams |
| Native `TextDecoderStream` + manual parse | N/A | Zero dependencies; ~30 lines of code |

([GitHub: Azure/fetch-event-source](https://github.com/Azure/fetch-event-source),
[npm: @sentool/fetch-event-source](https://www.npmjs.com/package/@sentool/fetch-event-source))

#### Performance: controlling re-renders

High-frequency streaming (20+ tokens/second) requires careful React state management:

1. **Buffer outside React state.** Accumulate tokens in a mutable `useRef`, triggering
   zero renders per token arrival.
2. **Flush via `requestAnimationFrame`.** Collapse all buffered tokens into a single
   `setState` call per animation frame (~16ms at 60fps, ~8ms at 120fps).
3. **Memoize child components.** Use `React.memo` with custom comparators to prevent
   unnecessary re-renders of message list items.
4. **Virtualize long conversations.** Use `@tanstack/react-virtual` to keep DOM node
   count constant regardless of message history length.

([SitePoint: Streaming Backends & React](https://www.sitepoint.com/streaming-backends-react-controlling-re-render-chaos/),
[Akash Kumar: Why React Apps Lag With Streaming Text](https://akashbuilds.com/blog/chatgpt-stream-text-react))

#### Assessment

| Criterion | Rating | Notes |
|---|---|---|
| Full control | Excellent | Every byte is yours to handle |
| Bundle size | Minimal | Zero to one small dependency |
| Testing | Manual | Must build own mock SSE server |
| Time to implement | High | 500-1000 lines for production quality |
| Maintenance burden | High | Must handle reconnection, error recovery, parsing, buffering, abort |
| Risk | Medium | Custom code = custom bugs; no community fixes |

### 3. Other Libraries

#### Comparison table

| Library | Stars | Focus | Streaming | Styling | Redux-friendly | Maintenance | Notes |
|---|---|---|---|---|---|---|---|
| **assistant-ui** | ~7.9k | Full AI chat UI primitives | Yes (built-in) | Headless (Radix-style) | Yes | Active | Composable primitives; tight AI SDK integration; production-ready UX (auto-scroll, retries, attachments, a11y). "Safe default" for React teams per 2026 evaluation. |
| **llm-ui** | ~1.7k | Streaming text rendering | Yes (smooth throttling) | Headless | Yes (hook-based) | Moderate (last release June 2024) | Focused on output rendering: removes broken markdown mid-stream, native frame-rate character rendering. Good for display, not chat orchestration. |
| **flowtoken** | ~511 | Streaming text animation | Yes (CSS animations) | Component-based | Compatible | Active (v1.0.35 May 2025) | Fade-in, blur, drop-in, typewriter animations for streamed tokens. Complements useChat rather than replacing it. |
| **chatscope** | ~2k+ | General chat UI kit | No native streaming | CSS-framework agnostic | Manual | Active | Full chat UI components (message list, input, sidebar). No LLM-specific features. Would need streaming bolted on. |
| **nlux** | ~2k+ | Conversational AI UI | Yes | Themed | Compatible | Active | Zero-dependency core; adapters for OpenAI, LangChain, HuggingFace. Full chat component but opinionated layout. |
| **@magicul/react-chat-stream** | Small | Word-by-word streaming hook | Yes | None (hook only) | Yes | Small community | Lightweight hook for text/event-stream backends. Limited features; no tool calls, no abort. |
| **Deep Chat** | ~3.3k | Quick-start chat widget | Yes | Pre-styled | Limited | Active | Drop-in web component; under 10 minutes to working chat. Less customizable for embedded panel use case. |

([GitHub: assistant-ui](https://github.com/assistant-ui/assistant-ui),
[DEV Community: AI Chat UI Library Evaluation 2026](https://dev.to/alexander_lukashov/i-evaluated-every-ai-chat-ui-library-in-2026-heres-what-i-found-and-what-i-built-4p10),
[GitHub: richardgill/llm-ui](https://github.com/richardgill/llm-ui),
[GitHub: Ephibbs/flowtoken](https://github.com/Ephibbs/flowtoken),
[GitHub: chatscope/chat-ui-kit-react](https://github.com/chatscope/chat-ui-kit-react),
[GitHub: nlkitai/nlux](https://github.com/nlkitai/nlux),
[npm: @magicul/react-chat-stream](https://www.npmjs.com/package/@magicul/react-chat-stream))

#### Layering strategy

These libraries address different layers and can be combined:

| Layer | Responsibility | Options |
|---|---|---|
| **Transport + state** | SSE connection, message state, abort, tool calls | Vercel AI SDK `useChat` (recommended) or roll-your-own fetch |
| **Chat UI primitives** | Message list, input, scroll, layout | assistant-ui (headless) or custom MUI components |
| **Streaming text rendering** | Smooth token display, markdown mid-stream | llm-ui or flowtoken (optional polish layer) |

### 4. UX Patterns for Streaming Chat

#### Token-by-token rendering

| Approach | Mechanism | Visual Effect | Source |
|---|---|---|---|
| **Blinking cursor** | CSS `@keyframes blink` on a `::after` pseudo-element appended to the last text node | Familiar terminal/editor feel | [MakeAIHQ: Streaming Responses](https://makeaihq.com/guides/cluster/streaming-responses-real-time-ux-chatgpt) |
| **Fade-in tokens** | CSS `@keyframes fadeIn` applied per-word or per-character as tokens arrive | Smooth, polished feel | [FlowToken library](https://github.com/Ephibbs/flowtoken) |
| **Smooth throttling** | Buffer tokens, render at native frame rate (60fps) using `requestAnimationFrame` | Eliminates stuttering from variable token generation speed | [llm-ui](https://llm-ui.com/), [SitePoint](https://www.sitepoint.com/streaming-backends-react-controlling-re-render-chaos/) |
| **Typewriter effect** | Fixed character-per-frame rate regardless of actual token arrival speed | Consistent visual rhythm; adds latency on fast streams | [FlowToken](https://github.com/Ephibbs/flowtoken), [TypeIt](https://macarthur.me/posts/streaming-text-with-typeit/) |

**Recommendation for The Helm:** Blinking cursor + smooth throttling. Fade-in adds
visual polish but increases rendering complexity. The secondary panel should feel
responsive but not flashy.

#### Stop / abort

The "Stop generating" button is a standard pattern. Implementation:

1. Store an `AbortController` ref.
2. Pass `controller.signal` to the fetch call (or use `useChat`'s built-in `stop()`).
3. On abort, the fetch promise rejects with `AbortError`; handle gracefully by keeping
   partial text and showing a "Response stopped" indicator.

([LocalCan: AbortController Guide](https://www.localcan.com/blog/abortcontroller-nodejs-react-complete-guide-examples),
[javascript.info: Fetch Abort](https://javascript.info/fetch-abort))

#### Retry / regenerate

Two modes identified in the literature:

| Mode | Behavior | Best For |
|---|---|---|
| **Overwrite** | New response replaces the old one in-place | The Helm's use case (chat is a means to an end; history is less important) |
| **Branching** | Each retry creates a separate version; user can navigate between them | Exploratory tools (ChatGPT-style) |

Best practices:
- Provide a visible "Retry" button on failed or unsatisfying responses
- Automatic silent retry on transient errors (network drops, 503s) with transparency
- Allow guided regeneration: user edits their message before retrying
- Preserve history so users can recover previous versions

([ShapeofAI: Regenerate Pattern](https://www.shapeof.ai/patterns/regenerate))

#### Reliable / resumable streaming

For production robustness:
- **Server-side buffering:** Persist AI output as it generates; replay missed tokens on
  reconnect via a session ID + last-received sequence number.
- **Resume tokens:** Client sends last-received token ID on reconnect; server replays
  from that point.
- **SSE built-in reconnect:** The browser's EventSource implementation auto-reconnects
  with `Last-Event-Id` header (though we use fetch, this can be implemented manually).

([Ably: Reliable Resumable Token Streaming](https://ably.com/blog/token-streaming-for-ai-ux))

#### Auto-scroll

Standard pattern: `useEffect` watching the messages array, auto-scrolling the container
to the bottom when new content appears. Must respect user scroll intent -- if the user
has scrolled up to read history, do not force-scroll to the bottom.
([patterns.dev: AI UI Patterns](https://www.patterns.dev/react/ai-ui-patterns/))

#### Disabled input during streaming

Disable the input field and send button while a response is streaming to prevent
overlapping AI calls and maintain message ordering.
([patterns.dev: AI UI Patterns](https://www.patterns.dev/react/ai-ui-patterns/))

### 5. Integration: Chat State <-> Card State

This is the critical architectural question for The Helm. The chat panel is not
standalone -- it is a control surface that drives card updates.

#### Proposed data flow (Vignette 2)

```
1. Card renders with empty results + error indicator
2. User opens chat panel (drawer slides in, scoped to this card)
3. Chat context is seeded with card metadata:
   - Card type, original query, error details, data source
   - Injected as system/context message (not visible to user)
4. User types: "The samples are from the NMDC Stegen collection"
5. useChat sends: [system context] + [user message] to backend
6. Backend AI determines corrective action:
   - Generates tool call: { tool: "retry_query", params: { collection: "Stegen", ... } }
   - Streams explanation text to chat panel
7. Frontend receives tool call via useChat's onToolCall / addToolOutput:
   - Dispatches Redux action: cardSlice.actions.retryWithParams({ cardId, newParams })
   - Card re-fetches data via RTK Query with corrected parameters
8. Card updates in-place; chat shows "I've updated the query to filter by the Stegen
   collection. The card now shows 47 results."
9. onFinish callback optionally persists conversation for history
```

#### State architecture

| State Location | What Lives There | Why |
|---|---|---|
| **Redux `chatSlice`** | Active conversations keyed by `cardId`, message history, streaming status | Global access; card components can read chat status |
| **Redux `cardSlice`** (existing) | Card data, query parameters, error state, loading state | Already exists; chat-driven retries dispatch actions here |
| **`useChat` hook state** | Current streaming text, pending messages | Ephemeral; synced to Redux on message completion via `onFinish` |
| **RTK Query cache** | API response data | Card data refetched on parameter change |

#### Key patterns

**Context injection:** Use `useChat`'s `append()` to programmatically inject card
metadata as a system message when the chat panel opens. The backend receives full
context without the user having to re-explain.
([GitHub Discussion: Add context to useChat](https://github.com/vercel/ai/discussions/1869))

**Tool calls as card actions:** The AI's tool calls map directly to Redux actions.
When the AI calls `retry_query`, the frontend intercepts via `onToolCall`, dispatches
the corresponding Redux action, and provides the tool result back via `addToolOutput`.
([AI SDK Docs: Chatbot Tool Usage](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot-with-tool-calling))

**Scoped conversations:** Each chat panel instance is scoped to a specific card.
The conversation ID is the card ID. This prevents cross-card contamination and
enables independent streaming for multiple open panels.

**Drawer pattern:** The chat panel should be implemented as a Material-UI `Drawer`
component (anchor right or bottom). It is secondary content that slides in from one
edge and can be dismissed without losing the main view. Two common patterns:
- **Push drawer:** Main content shifts to accommodate the panel
- **Overlay drawer:** Panel slides over main content with a backdrop

([Fluent 2: Drawer Usage](https://fluent2.microsoft.design/components/web/react/core/drawer/usage),
[Creative Bloq: Slideouts, Sidebars and Drawers](https://www.creativebloq.com/ux/ui-design-pattern-tips-slideouts-sidebars-101413343))

**Widget state synchronization:** The card (widget) treats the AI-provided parameters
as authoritative data, while maintaining its own ephemeral UI state (scroll position,
selected tab). When a tool call completes, the card reapplies its local UI state on
top of the new data snapshot.
([HackerNoon: Streamable UI Pattern](https://hackernoon.com/the-streamable-ui-pattern-turn-chat-into-a-live-clickable-react-dashboard),
[OpenAI Apps SDK: State Management](https://developers.openai.com/apps-sdk/build/state-management))

## Conclusions

### Recommended approach: Vercel AI SDK `useChat` + custom MUI chat components

1. **Use `@ai-sdk/react` `useChat`** as the transport + state layer.
   - It handles streaming, abort, tool calls, context injection, and message state.
   - It works with any SSE backend via the Data Stream Protocol.
   - It integrates with Redux via decoupled state (v5+).
   - It provides first-class testing utilities (mock models, simulated streams).
   - It has 20M+ monthly downloads and active maintenance.

2. **Build chat UI components with Material-UI**, not a third-party chat UI library.
   - The chat panel is secondary and minimal -- a message list, input field, and
     action buttons. It does not need the full feature set of assistant-ui or chatscope.
   - Custom MUI components maintain visual consistency with the rest of The Helm.
   - Keep it simple: `MessageList`, `ChatInput`, `ChatDrawer`.

3. **Optionally add `llm-ui` or `flowtoken`** for streaming text rendering polish if
   the basic approach (append text to a `<span>` with a CSS cursor) feels insufficient
   during user testing.

4. **Do NOT roll your own streaming infrastructure.** The Vercel AI SDK handles SSE
   parsing, buffering, abort, reconnection, and tool calls. Reimplementing this is
   500-1000 lines of subtle code with edge cases around chunked SSE parsing, partial
   JSON, and connection drops.

5. **Backend contract:** The backend must implement the
   [Data Stream Protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
   (SSE with `x-vercel-ai-ui-message-stream: v1` header and the documented message
   types). This is a straightforward protocol that can be implemented in any language.

### What to skip

- **chatscope / nlux / Deep Chat:** These are full chat app frameworks. The Helm needs
  a secondary panel, not a chat app. The overhead and style conflicts are not worth it.
- **`@microsoft/fetch-event-source`:** Unmaintained since 2021. If you need raw fetch +
  SSE, use native `TextDecoderStream` or `eventsource-parser`.
- **Branching regeneration:** Overwrite mode is simpler and matches the "chat as a means
  to fix the card" mental model. Branching adds complexity without clear user value for
  this use case.

### Open questions for implementation

1. Should chat history persist across sessions (requires backend storage) or be
   ephemeral (lost on page refresh)?
2. Should multiple chat panels be open simultaneously (one per card), or should only
   one panel be open at a time?
3. Should the AI be able to proactively open the chat panel (e.g., when a card errors),
   or should it always be user-initiated?

## Sources

- [AI SDK Documentation: Introduction](https://ai-sdk.dev/docs/introduction)
- [AI SDK Documentation: Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
- [AI SDK Documentation: Transport](https://ai-sdk.dev/docs/ai-sdk-ui/transport)
- [AI SDK Documentation: useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [AI SDK Documentation: Testing](https://ai-sdk.dev/docs/ai-sdk-core/testing)
- [AI SDK Documentation: Chatbot Tool Usage](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot-with-tool-calling)
- [AI SDK 3.4 Announcement](https://vercel.com/blog/ai-sdk-3-4)
- [AI SDK 5 Announcement](https://vercel.com/blog/ai-sdk-5)
- [AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6)
- [GitHub: Vercel AI SDK without NextJS Discussion](https://github.com/orgs/community/discussions/177224)
- [GitHub: Programmatically add messages with useChat](https://github.com/vercel/ai/discussions/2404)
- [GitHub: Add context to useChat without exposing to user](https://github.com/vercel/ai/discussions/1869)
- [Vercel Community: useChat without API route](https://community.vercel.com/t/possible-to-use-ai-sdks-usechat-hook-without-an-api-route/6891)
- [Robin Wieruch: Full-Stack React.js Chat with AI SDK](https://www.robinwieruch.de/react-ai-sdk-chat/)
- [DEV Community: AI Chat UI Library Evaluation 2026](https://dev.to/alexander_lukashov/i-evaluated-every-ai-chat-ui-library-in-2026-heres-what-i-found-and-what-i-built-4p10)
- [patterns.dev: AI UI Patterns](https://www.patterns.dev/react/ai-ui-patterns/)
- [Ably: Reliable Resumable Token Streaming for AI UX](https://ably.com/blog/token-streaming-for-ai-ux)
- [ShapeofAI: Regenerate Pattern](https://www.shapeof.ai/patterns/regenerate)
- [HackerNoon: Streamable UI Pattern](https://hackernoon.com/the-streamable-ui-pattern-turn-chat-into-a-live-clickable-react-dashboard)
- [SitePoint: Streaming Backends & React Re-render Control](https://www.sitepoint.com/streaming-backends-react-controlling-re-render-chaos/)
- [Akash Kumar: Why React Apps Lag With Streaming Text](https://akashbuilds.com/blog/chatgpt-stream-text-react)
- [Medium: EventSource vs Fetch API](https://medium.com/@piyalidas.it/javascript-eventsource-vs-fetch-api-d29157e48433)
- [LogRocket: Fetch Event Source for SSE in React](https://blog.logrocket.com/using-fetch-event-source-server-sent-events-react/)
- [Medium: SSE Using POST Without EventSource](https://medium.com/@david.richards.tech/sse-server-sent-events-using-a-post-request-without-eventsource-1c0bd6f14425)
- [GitHub: Azure/fetch-event-source](https://github.com/Azure/fetch-event-source)
- [GitHub: assistant-ui](https://github.com/assistant-ui/assistant-ui)
- [GitHub: richardgill/llm-ui](https://github.com/richardgill/llm-ui)
- [GitHub: Ephibbs/flowtoken](https://github.com/Ephibbs/flowtoken)
- [GitHub: chatscope/chat-ui-kit-react](https://github.com/chatscope/chat-ui-kit-react)
- [GitHub: nlkitai/nlux](https://github.com/nlkitai/nlux)
- [npm: @magicul/react-chat-stream](https://www.npmjs.com/package/@magicul/react-chat-stream)
- [LocalCan: AbortController Guide](https://www.localcan.com/blog/abortcontroller-nodejs-react-complete-guide-examples)
- [javascript.info: Fetch Abort](https://javascript.info/fetch-abort)
- [Creative Bloq: UI Pattern Tips - Slideouts, Sidebars, Drawers](https://www.creativebloq.com/ux/ui-design-pattern-tips-slideouts-sidebars-101413343)
- [Fluent 2: Drawer Component Usage](https://fluent2.microsoft.design/components/web/react/core/drawer/usage)
- [OpenAI Apps SDK: State Management](https://developers.openai.com/apps-sdk/build/state-management)
- [MakeAIHQ: Streaming Responses for Real-Time UX](https://makeaihq.com/guides/cluster/streaming-responses-real-time-ux-chatgpt)
- [Streaming Text Like an LLM with TypeIt](https://macarthur.me/posts/streaming-text-with-typeit/)
- [SaaStr: Assistant UI Analysis](https://www.saastr.com/ai-app-of-the-week-assistant-ui-the-react-library-thats-eating-the-ai-chat-interface-market/)
