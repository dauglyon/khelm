# Card Domain -- Task Breakdown

The card domain defines the atomic unit of work in The Helm. It covers the card data model and TypeScript types, the card header (shortname editing, type badge, status indicator, action buttons), type-specific body renderers for six card types (SQL, Python, Literature, Hypothesis, Note, Data Ingest), the status lifecycle state machine with animated transitions, streaming content rendering with token buffering, the inline chat panel for error recovery and context injection, and cross-card reference pills. Cards are rendered inside the workspace domain's masonry grid; this domain owns everything inside the card container boundary.

## Implementation Targets

| Target | File(s) | Description |
|--------|---------|-------------|
| Card types | `src/features/cards/types.ts` | CardType, CardStatus, CardContent, CardResult, Card record, Message |
| Card Zustand store | `src/features/cards/store.ts` | Per-card state, chat state, streaming buffers |
| Card component | `src/features/cards/Card.tsx` | Outer card shell, dispatches to header + body |
| Card header | `src/features/cards/CardHeader.tsx` | Shortname, type badge, status dot, action buttons |
| Card body (registry) | `src/features/cards/CardBody.tsx` | Delegates to type-specific renderer |
| SQL body | `src/features/cards/bodies/SqlBody.tsx` | Code block + result table |
| Python body | `src/features/cards/bodies/PythonBody.tsx` | Code block + stdout/stderr + figures |
| Literature body | `src/features/cards/bodies/LiteratureBody.tsx` | Publication list with expandable abstracts |
| Hypothesis body | `src/features/cards/bodies/HypothesisBody.tsx` | Claim callout + analysis + suggested query chips |
| Note body | `src/features/cards/bodies/NoteBody.tsx` | Editable text area |
| Data Ingest body | `src/features/cards/bodies/DataIngestBody.tsx` | Schema preview + sample table + progress bar |
| Status animations | `src/features/cards/StatusIndicator.tsx` | Animated status dot/icon with Motion variants |
| Streaming renderer | `src/features/cards/StreamingContent.tsx` | Markdown rendering with cursor, auto-scroll |
| Chat panel | `src/features/cards/ChatPanel.tsx` | Slide-in panel, message list, input, actions |
| Chat transport | `src/features/cards/chatStream.ts` | fetch + ReadableStream SSE parsing |
| Reference pills | `src/features/cards/ReferencePills.tsx` | Clickable pills for cross-card references |
| Card styles | `src/features/cards/card.css.ts` | vanilla-extract styles for all card components |
| Card tests | `src/features/cards/__tests__/` | Vitest unit/integration tests |

## Task Table

| ID | Summary | Deps | Status | Preflight |
|----|---------|------|--------|-----------|
| 01 | Card types and data model | design-system (InputType enum) | planned | types compile, no runtime imports |
| 02 | Card Zustand store (card CRUD + selectors) | 01 | planned | store actions pass unit tests |
| 03 | Card header component | 01, 02, design-system (Chip, Badge, IconButton) | planned | header renders with all props |
| 04 | Status indicator with animations | 01, design-system (Badge, keyframes, variants) | planned | all 4 statuses render with correct animation |
| 05 | Card shell component | 01, 02, 03, 04, design-system (Card primitive) | planned | card renders header + placeholder body |
| 06 | Card body registry and Note body | 01, 05 | planned | note body renders editable text |
| 07 | SQL body renderer | 01, 06, design-system (typography tokens) | planned | code block + table render from mock data |
| 08 | Python body renderer | 01, 06 | planned | code + stdout/stderr + figures render |
| 09 | Literature body renderer | 01, 06 | planned | publication list renders, abstracts expand |
| 10 | Hypothesis body renderer | 01, 06, design-system (Chip) | planned | claim callout + chips render, chip click fires callback |
| 11 | Data Ingest body renderer | 01, 06 | planned | schema table + sample rows + progress bar render |
| 12 | Streaming content renderer | 01, 02 | planned | markdown renders incrementally, cursor blinks |
| 13 | Streaming buffer integration | 02, 12, workspace (streamBuffers) | planned | token flush updates card content at 50ms interval |
| 14 | Chat panel layout and messages | 01, design-system (TextInput, IconButton) | planned | panel slides in, messages render by role |
| 15 | Chat SSE transport | 01, 14 | planned | fetch+ReadableStream parses SSE tokens |
| 16 | Chat abort and retry | 14, 15 | planned | abort commits partial, retry resubmits |
| 17 | Chat store integration | 02, 14, 15, 16 | planned | chat state per card in Zustand |
| 18 | Cross-card reference pills | 01, 02, workspace (useCardShortname) | planned | pills render, click scrolls to target |
| 19 | Card accessibility and reduced motion | 03, 04, 05, 14 | planned | keyboard nav, aria attrs, prefers-reduced-motion |
| 20 | Card integration test suite | all above | planned | full card lifecycle tests with MSW |

## Critical Path DAG

```
                     01 types
                    / |  \  \
                   /  |   \  \
                  v   v    v  v
          02 store  04 status  14 chat-layout
          /  |  \       |           |
         /   |   \      |           v
        v    v    v     |      15 chat-transport
  03 header  12 stream  |           |
        |     |         |           v
        v     v         v      16 chat-abort-retry
       05 card-shell----+           |
        |                           v
        v                      17 chat-store
   06 body-registry                 |
   / | |  \  \                      |
  v  v v   v  v                     |
 07 08 09 10 11                     |
  |  |  |  |  |                     |
  v  v  v  v  v                     |
  +--+--+--+--+-----+---------+----+
                     |
                     v
              18 reference-pills
                     |
                     v
              13 stream-buffer-integration
                     |
                     v
              19 accessibility
                     |
                     v
              20 integration-tests
```

## Parallelism Opportunities (Waves)

| Wave | Tasks | Can Run In Parallel | Notes |
|------|-------|-------------------|-------|
| 1 | 01 | No | Foundation types, no deps besides design-system |
| 2 | 02, 04, 14 | Yes | Store, status indicator, and chat layout are independent |
| 3 | 03, 12, 15 | Yes | Header needs store+types; streaming needs store; chat transport needs chat layout |
| 4 | 05, 16 | Yes | Card shell needs header+status; chat abort needs transport |
| 5 | 06, 17 | Yes | Body registry needs shell; chat store needs all chat pieces |
| 6 | 07, 08, 09, 10, 11 | Yes | All five type-specific bodies are fully independent |
| 7 | 18 | No | Reference pills need store + workspace selectors |
| 8 | 13 | No | Streaming buffer integration wires store to workspace |
| 9 | 19 | No | Accessibility pass across all components |
| 10 | 20 | No | Integration tests validate full lifecycle |
