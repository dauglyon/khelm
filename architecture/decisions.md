# Technology Decisions

Decisions made from research (RSH-001 through RSH-013). Each entry links to the research document that informed it and captures the rationale.

## Foundation

### Build Tooling: Vite 8
**Source:** [RSH-001](research/rsh-001-react-spa-tooling.md)

Vite 8 with Rolldown delivers 10-30x faster builds than CRA. CRA is officially deprecated. Next.js and Remix add SSR overhead we don't need — The Helm is a pure SPA.

### Styling: vanilla-extract
**Source:** [RSH-001](research/rsh-001-react-spa-tooling.md)

Zero-runtime CSS-in-TypeScript. Design tokens (colors, typography, easing from `architecture/README.md`) become TypeScript contracts with compile-time validation via `createTheme()`. Sprinkles provides a type-safe utility-class API built from our own tokens. styled-components eliminated (maintenance mode, runtime overhead). Tailwind lacks compile-time token typo detection.

### Testing: Vitest + Playwright + MSW 2.x
**Source:** [RSH-011](research/rsh-011-testing-strategy.md)

- **Vitest** — Vite-native, 5-28x faster than Jest, zero config overhead. Happy DOM as default environment.
- **Playwright** — free parallelization (Cypress Cloud is $30k+/yr), cross-browser, animation-aware auto-wait.
- **MSW 2.x** — unified mocking for REST, SSE (`sse()` API in v2.12.0+), and WebSocket. Same handlers for dev, test, and Storybook.

---

## State & Data

### State Management: Zustand + TanStack Query
**Sources:** [RSH-001](research/rsh-001-react-spa-tooling.md), [RSH-006](research/rsh-006-streaming-state-management.md)

- **Zustand** for client/streaming state — external `setState`/`getState` for SSE/WebSocket handlers outside React, selector-based re-render isolation per card, ~1.2 KB gzipped.
- **TanStack Query** for server-fetched data (saved cards, user settings, API calls).
- **Buffer pattern**: tokens accumulate in a plain JS ref, flush to Zustand via `setInterval` at ~50ms (20 flushes/sec) to avoid render thrashing.

Watch item: if cross-card dependency chains become deeply nested, Jotai's `atomFamily` model may be worth reconsidering.

### API Stubs: Orval + MSW v2
**Source:** [RSH-007](research/rsh-007-api-stub-patterns.md)

Orval generates TypeScript types, TanStack Query hooks, Zod schemas, and MSW handlers from a single OpenAPI spec. MSW v2's first-class SSE support is critical for mocking streaming LLM responses in dev and tests. Workflow: write OpenAPI spec → `orval` generate → MSW intercepts in browser → swap env var for real backend.

---

## UI Components

### Masonry Layout: @tanstack/react-virtual + Custom Masonry
**Sources:** [RSH-001](research/rsh-001-react-spa-tooling.md), [RSH-012](research/rsh-012-virtualized-masonry.md)

Session workspaces may have hundreds of cards. Non-virtualized masonry degrades at 500+ items. @tanstack/react-virtual (4.6M weekly downloads) with custom masonry positioning via the `lanes` API handles this. Generous overscan (1.5-2x viewport) minimizes pop-in.

**Animation compromise**: Motion enter animations (fade/slide) on grid items, `layoutId` for card-to-detail transitions. No `layout` prop (FLIP) on grid items — no production masonry grid (Pinterest, Unsplash, Dribbble) uses FLIP on the grid itself.

### Animation: Motion (Framer Motion) + CSS Keyframes
**Source:** [RSH-002](research/rsh-002-animation-and-interaction.md)

- **Motion** — `layout` prop (FLIP) for non-grid transitions, `AnimatePresence` for enter/exit, `variants` as state machine (thinking→running→complete→error), Typewriter component for streaming text. 34M weekly downloads, MIT license.
- **CSS `@keyframes`** — shimmer/pulse loading states on compositor thread, zero JS overhead.
- **LazyMotion** — ~4.6 KB initial, full `domMax` bundle (~25 KB) loaded async.

GSAP available as a scalpel for edge cases (complex timeline sequences). CSS View Transitions API worth watching when React support stabilizes.

### Input Component: TipTap (ProseMirror)
**Source:** [RSH-003](research/rsh-003-input-component-and-mentions.md)

First-party `@tiptap/extension-mention` with `ReactNodeViewRenderer` for inline pills/chips. Suggestion utility handles autocomplete dropdown. Single-line mode via `Document.extend({ content: 'text*' })`. `editor.getText()` feeds the classifier on every keystroke. MIT-licensed core. Used by NYT, The Guardian, Atlassian.

### Card Drag & Drop: dnd-kit
**Source:** [RSH-010](research/rsh-010-drag-and-drop.md)

Built-in sortable grid support, keyboard accessibility, largest community. Known CSS transform friction with Motion — established workarounds exist (update order on `onDragMove`, let Motion handle layout animation).

### File Drop: react-dropzone
**Sources:** [RSH-008](research/rsh-008-file-handling-and-ingest.md), [RSH-010](research/rsh-010-drag-and-drop.md)

Purpose-built for OS file drops. Headless `useDropzone` hook for full UI control. File validation (type, size, count) out of the box. Separate concern from card DnD — two tools for two jobs.

---

## Backend & Data

### Input Classification: Qwen3.5-4B Local via Ollama
**Source:** [RSH-005](research/rsh-005-input-classification.md)

This is an intent classification problem (what the user wants to DO), not topic classification (what the input is ABOUT). Domain language (biology/metagenomics) appears across all seven categories (SQL, Python, Literature, Hypothesis, Note, Data Ingest, Task); instruction-tuned LLMs have a structural advantage.

- **Local**: Qwen3.5-4B via Ollama with `/no_think` mode and structured JSON output. ~100-200ms latency, zero per-token cost. Grammar-constrained decoding ensures valid JSON.
- **API fallback**: Gemini 2.5 Flash Lite or GPT-4.1 nano when local isn't available.
- **Upgrade path**: Qwen3.5-9B if 4B isn't accurate enough; LoRA fine-tuning on Qwen3-1.7B if labeled data accumulates.
- **Confidence UX**: show type if ≥0.80, offer alternatives if 0.50-0.79, let user pick if <0.50.

### File Handling: tus.io + Uppy
**Source:** [RSH-008](research/rsh-008-file-handling-and-ingest.md)

- **Upload**: tus.io for resumable uploads (critical for multi-GB scientific files). Uppy orchestrates with React components and progress UI. Galaxy Project uses tus in production.
- **Preview**: `File.slice(0, 65536)` — read first 64KB only for type detection, header extraction, and sample records. Browser never loads full file into memory.
- **Parsing**: Papa Parse for CSV/TSV (streaming, web workers). SheetJS for Excel. Custom for FASTA/FASTQ.
- **Schema inference**: custom pipeline on the 64KB slice — Papa Parse + sampling heuristics for types, dates, categoricals.
- **Full parsing**: server-side only. Client sends file via tus, server processes.

### Streaming Chat UI: Custom Implementation
**Source:** [RSH-009](research/rsh-009-streaming-chat-ui.md)

Roll our own — the chat panel is secondary UI (per-card error recovery and context injection), not a full chat app. ~150 lines of real code using fetch + ReadableStream + Zustand. No dependency on Vercel AI SDK or other chat frameworks.

Key patterns (sourced from Vercel AI SDK, Open WebUI, and chatbot-ui internals):
- **State shape**: flat message array + separate `streamingContent` string
- **Token buffering**: ref-based buffer, flush via `setInterval` at ~50ms
- **Abort**: `AbortController`, catch `AbortError` by name, commit partial content
- **Retry**: overwrite mode — slice array before last assistant message, resubmit
- **Optimistic UI**: show user message immediately before fetch starts
- **Stream parsing**: `TextDecoder({ stream: true })` for UTF-8 safety, split on `\n`, handle `data: [DONE]`

---

## Collaboration

### Real-time: Socket.IO WebSocket Broadcast
**Source:** [RSH-004](research/rsh-004-realtime-collaboration.md)

Server-authoritative model: clients send operations, server validates/persists/broadcasts. AI participant connects as another WebSocket client, symmetric with humans. MIT-licensed, scales horizontally with Redis. CRDTs (Yjs/Automerge) rejected as overkill for card-level CRUD. Upgrade path to Yjs exists if rich in-card text editing is needed later.

### Conflict Resolution: Card-Level Pessimistic Locking
**Source:** [RSH-013](research/rsh-013-card-locking.md)

- **Lock scope**: edit/configure/delete require locks. View/comment/copy/pin/move are lock-free.
- **Lease**: 30-second TTL with 10-second heartbeat renewal. Three-layer disconnect defense (beforeunload, Socket.IO disconnect event, TTL expiry).
- **One lock per user** at a time — auto-release on switching cards.
- **AI preemption**: "Stop generating" button aborts stream, saves partial content, atomically transfers lock to user.
- **Implementation**: in-memory lock table for v1, Redis `SET NX PX` for horizontal scaling. Redlock rejected per Kleppmann's analysis.
