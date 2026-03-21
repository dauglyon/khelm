# RSH-004: What Real-Time Collaboration Technology Best Fits Session-Based Card + Chat Sync?

**Date:** 2026-03-21 | **Status:** Completed

## Question

For a React SPA ("The Helm") built around session-based collaborative scientific exploration -- where multiple users (including an AI participant) share a workspace of discrete cards and a chat stream, all syncing in real-time with presence indicators -- what technology should power the real-time collaboration layer? Is CRDT complexity justified when the collaboration granularity is at the card level (whole-object create/update/delete + chat append) rather than character-level text editing?

## Context

The Helm's collaboration model is **session-based**, not document-editing-based:

- **Shared workspace of discrete cards**: Cards are created, updated, reordered, and deleted. Each card is an atomic unit -- two users are unlikely to concurrently edit the same card's internal content at the character level.
- **Chat stream**: Append-only sequence of messages. No editing of prior messages in real-time.
- **AI participant**: An AI agent appears symmetrically alongside human users, contributing cards and chat messages through the same sync mechanism.
- **Presence indicators**: All participants (human and AI) show online/offline status, and potentially what card they are viewing or interacting with.
- **Session scope**: Collaboration is bounded to a session/room. Not a persistent always-on document like Google Docs.

The conflict profile is **low**: concurrent edits to the same card are rare since cards are discrete units. The most common concurrent operations are *different users creating different cards* or *multiple users appending chat messages* -- both of which are naturally conflict-free even without CRDTs.

### Key Technical Requirements

1. Real-time sync of card state and chat messages across all session participants
2. Presence/awareness (who is online, what they are looking at)
3. Low latency for chat messages (sub-500ms)
4. React integration (hooks, state management compatibility with Redux Toolkit)
5. Scalability for moderate user counts (2-20 users per session)
6. Self-hostability preferred (scientific/institutional deployment context)
7. Reasonable operational complexity

## Findings

### Category 1: CRDT Libraries (Yjs, Automerge)

CRDTs (Conflict-free Replicated Data Types) are data structures designed to be modified concurrently by different users and merged automatically without conflicts. They were originally designed for scenarios like collaborative text editing where character-level merge semantics matter.

#### Yjs

| Attribute | Details |
|---|---|
| **What it is** | High-performance CRDT library exposing shared types (Y.Map, Y.Array, Y.Text) that auto-sync across peers ([GitHub - yjs/yjs](https://github.com/yjs/yjs)) |
| **Bundle size** | ~17 kB minified+gzipped (pure JS, no WASM) ([Bundlephobia](https://bundlephobia.com/package/yjs)) |
| **Weekly downloads** | ~2.5 million ([npm trends](https://npmtrends.com/automerge-vs-yjs)) |
| **Conflict resolution** | Automatic CRDT merge -- concurrent changes to different fields merge cleanly; concurrent changes to same field use deterministic conflict resolution ([Yjs Docs](https://docs.yjs.dev)) |
| **Offline support** | Full offline-first design. Edits work offline and sync on reconnect. Persistence to IndexedDB via y-indexeddb provider ([DEV Community](https://dev.to/hexshift/building-offline-first-collaborative-editors-with-crdts-and-indexeddb-no-backend-needed-4p7l)) |
| **Presence** | Built-in Awareness protocol -- a lightweight state-based CRDT that propagates JSON objects (cursor position, username, online status) to all peers. Auto-removes offline clients after 30s timeout ([Yjs Awareness Docs](https://docs.yjs.dev/getting-started/adding-awareness)) |
| **React integration** | No official React bindings, but community solutions exist (e.g., yjs + valtio + React, yjs + Zustand). Requires manual bridging to Redux ([DEV Community - Tutorial](https://dev.to/route06/tutorial-building-a-collaborative-editing-app-with-yjs-valtio-and-react-1mcl)) |
| **Transport** | Transport-agnostic. Providers for WebSocket (y-websocket), WebRTC (y-webrtc), and others. y-websocket includes a basic Node.js server ([y-websocket docs](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket)) |
| **Self-hostability** | Fully self-hostable. y-websocket-server is open source. Production deployments need custom infrastructure for persistence, load balancing, and fault tolerance ([Velt - Yjs WebSocket Server Guide](https://velt.dev/blog/yjs-websocket-server-real-time-collaboration)) |
| **Pricing** | Free and open source (MIT license) |
| **Vendor lock-in** | None |
| **Complexity** | Moderate. The CRDT concepts (shared types, providers, awareness) require learning, but the API surface is manageable. Production infrastructure (scaling y-websocket, persistence) adds operational complexity ([Velt](https://velt.dev/blog/yjs-websocket-server-real-time-collaboration)) |

#### Automerge

| Attribute | Details |
|---|---|
| **What it is** | CRDT library with JSON-like data model, Rust core compiled to WASM with JS bindings. Includes automerge-repo for batteries-included networking/storage ([Automerge](https://automerge.org/)) |
| **Bundle size** | ~800 kB+ including WASM binary (significantly larger than Yjs due to Rust/WASM compilation) ([Automerge WASM Packaging](https://automerge.org/blog/2024/08/23/wasm-packaging/)) |
| **Weekly downloads** | ~5,300 (vs Yjs's ~2.5M) ([npm trends](https://npmtrends.com/automerge-vs-yjs)) |
| **Conflict resolution** | Automatic CRDT merge with JSON data model. Recent Automerge 3.0 achieved 10x memory reduction ([BigGo News](https://biggo.com/news/202508071934_Automerge_3.0_Memory_Improvements)) |
| **Offline support** | Full offline-first / local-first design. Core philosophy is local-first computing ([Automerge Repo](https://automerge.org/blog/automerge-repo/)) |
| **Presence** | Ephemeral data API for non-persistent state (cursors, presence). Data is CBOR-encoded and broadcast to peers but not saved to the document ([Automerge Ephemeral Data](https://automerge.org/docs/reference/repositories/ephemeral/)) |
| **React integration** | Official React hooks via @automerge/automerge-repo-react-hooks ([Automerge React Tutorial](https://automerge.org/docs/tutorial/react/)) |
| **Transport** | automerge-repo provides WebSocket sync out of the box. Sync protocol handles efficient delta transfer ([Automerge Network Sync](https://automerge.org/docs/tutorial/network-sync/)) |
| **Self-hostability** | Fully self-hostable. automerge-repo-sync-server is a simple Express/WebSocket server. No proprietary infrastructure ([GitHub - sync-server](https://github.com/automerge/sync-server)) |
| **Pricing** | Free and open source |
| **Vendor lock-in** | None |
| **Complexity** | Higher than Yjs. WASM initialization adds complexity. Smaller ecosystem and community. Debugging WASM-compiled code is harder ([HN Discussion](https://news.ycombinator.com/item?id=41012895)) |

### Category 2: Hosted Collaboration Platforms (Liveblocks, PartyKit, Supabase Realtime)

#### Liveblocks

| Attribute | Details |
|---|---|
| **What it is** | Hosted collaboration infrastructure with pre-built React components for presence, cursors, comments, notifications, and multiplayer state ([Liveblocks](https://liveblocks.io)) |
| **Conflict resolution** | Built-in conflict resolution using CRDTs under the hood (LiveList, LiveMap, LiveObject types). Also supports Yjs documents ([Liveblocks Docs](https://liveblocks.io/docs/guides/how-to-use-liveblocks-presence-with-react)) |
| **Offline support** | Limited. Primarily designed for online-connected scenarios |
| **Presence** | First-class support via `useOthers`, `useMyPresence`, `useUpdateMyPresence` React hooks. Live cursors with pre-built components ([Liveblocks Presence Tutorial](https://liveblocks.io/docs/tutorial/react/getting-started/presence)) |
| **React integration** | Excellent. Purpose-built React hooks and Suspense-compatible components. `@liveblocks/react` package ([Liveblocks React API](https://liveblocks.io/docs/api-reference/liveblocks-react)) |
| **Self-hostability** | Limited. Sync engine is open source (AGPL v3), but production self-hosting "requires additional infrastructure pieces and expertise." No self-hosted option for regulated industries requiring data residency ([Liveblocks Blog](https://liveblocks.io/blog/open-sourcing-the-liveblocks-sync-engine-and-dev-server)) |
| **Pricing** | Free: 500 monthly active rooms, 256 MB storage. Pro: $30/mo + $0.03/room overage. Team: $600/mo. Enterprise: custom ([Liveblocks Pricing](https://liveblocks.io/pricing)) |
| **Vendor lock-in** | High. Proprietary API surface. Migration would require rewriting collaboration layer. Data lives in Liveblocks' cloud ([Velt - Liveblocks Review](https://velt.dev/blog/liveblocks-sdk-review-alternatives-2025)) |
| **Complexity** | Low development complexity (pre-built components). High operational dependency on vendor |

#### PartyKit (now Cloudflare)

| Attribute | Details |
|---|---|
| **What it is** | Serverless real-time platform where each "party" (room) runs in a Cloudflare Durable Object. Acquired by Cloudflare in 2024 ([Cloudflare Blog](https://blog.cloudflare.com/cloudflare-acquires-partykit/)) |
| **Conflict resolution** | No built-in conflict resolution. You implement your own logic in the party server. Can integrate Yjs for CRDT support ([PartyKit Docs](https://docs.partykit.io/examples/)) |
| **Offline support** | No built-in offline support. PartySocket handles reconnection and message buffering but not offline-first sync ([PartySocket API](https://docs.partykit.io/reference/partysocket-api/)) |
| **Presence** | No built-in presence primitive. Must be implemented manually using room state and message broadcasting ([PartyKit](https://www.partykit.io/)) |
| **React integration** | `usePartySocket` React hook for WebSocket connection lifecycle management. Handles connect/disconnect/cleanup automatically ([PartyKit React Docs](https://docs.partykit.io/tutorials/add-partykit-to-a-nextjs-app/4-add-websockets/)) |
| **Self-hostability** | Tied to Cloudflare Workers/Durable Objects infrastructure. Open source but requires Cloudflare account for deployment ([GitHub - cloudflare/partykit](https://github.com/cloudflare/partykit)) |
| **Pricing** | Cloudflare Workers Paid plan: $5/mo base. Durable Objects: 1M requests included, then $0.15/M. WebSocket messages billed at 20:1 ratio (100 WS messages = 5 requests). Duration: 400K GB-s included, then $12.50/M GB-s ([Cloudflare DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)) |
| **Vendor lock-in** | Moderate-High. Locked to Cloudflare's edge infrastructure. Migration requires rewriting server-side logic |
| **Complexity** | Low-moderate. Elegant programming model (each room = a stateful server). But limited to Cloudflare's runtime constraints |

#### Supabase Realtime

| Attribute | Details |
|---|---|
| **What it is** | Real-time engine built on Elixir/Phoenix providing Broadcast (pub/sub), Presence (CRDT-based user tracking), and Postgres Changes (database event streaming) ([Supabase Realtime](https://supabase.com/docs/guides/realtime)) |
| **Conflict resolution** | No built-in conflict resolution for application data. Presence uses an internal CRDT for state merging. Application-level conflicts must be handled manually (e.g., optimistic UI with server reconciliation) ([Supabase Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture)) |
| **Offline support** | No built-in offline persistence for web. Messages sent while disconnected are lost. Reconnection re-subscribes to channels ([Supabase Broadcast Docs](https://supabase.com/docs/guides/realtime/broadcast)) |
| **Presence** | Built-in Presence API using CRDTs internally. Tracks shared state with 'sync', 'join', 'leave' events. Authorization support for presence channels ([Supabase Presence](https://supabase.com/docs/guides/realtime/presence)) |
| **React integration** | `@supabase/supabase-js` client with channel-based API. Community React hooks (e.g., react-supabase). Requires manual integration with useEffect for channel subscriptions ([GitHub - react-supabase](https://github.com/awkweb/react-supabase)) |
| **Self-hostability** | Fully self-hostable via Docker. Realtime is open source (Elixir). However, self-hosted Broadcast/Presence has had stability issues (channel crashes in some versions). Requires Elixir expertise for debugging ([GitHub Issue #1617](https://github.com/supabase/realtime/issues/1617)) |
| **Pricing** | Free: 2M messages, 200 peak connections. Pro ($25/mo): 5M messages, 500 connections + overage. Team ($599/mo). Enterprise: custom ([Supabase Realtime Pricing](https://supabase.com/docs/guides/realtime/pricing)) |
| **Vendor lock-in** | Low-moderate. Open source stack (Postgres + Elixir). Data model is standard SQL. Realtime layer is replaceable, though Supabase-specific client APIs would need rewriting |
| **Complexity** | Low for Broadcast/Presence. Higher if using Postgres Changes for sync. Self-hosting adds significant operational burden ([Supabase Self-Hosting Docs](https://supabase.com/docs/guides/self-hosting)) |

### Category 3: WebSocket Broadcast (Socket.IO, ws)

#### Socket.IO

| Attribute | Details |
|---|---|
| **What it is** | Event-driven WebSocket library with automatic reconnection, rooms, namespaces, and fallback transports. 59K GitHub stars ([Socket.IO](https://socket.io/)) |
| **Conflict resolution** | None built-in. Must implement application-level conflict resolution (LWW, OT, or integrate a CRDT library) ([Ably - Scaling Socket.IO](https://ably.com/topic/scaling-socketio)) |
| **Offline support** | Limited. Client buffers emitted events in memory during disconnection and replays on reconnect. Connection State Recovery (v4+) can restore session state for brief disconnections. No persistent offline queue -- data lost if process closes ([Socket.IO Offline Behavior](https://socket.io/docs/v3/client-offline-behavior/), [Socket.IO Connection State Recovery](https://socket.io/docs/v4/connection-state-recovery)) |
| **Presence** | No built-in presence. Trivial to implement using rooms + join/leave events. Widely documented pattern ([VideoSDK - Socket.IO Rooms](https://www.videosdk.live/developer-hub/socketio/socketio-rooms)) |
| **React integration** | No official React hooks. Community packages exist. Requires manual useEffect management for socket lifecycle. Well-documented patterns for React ([LogRocket - WebSocket Tutorial](https://blog.logrocket.com/websocket-tutorial-socket-io/)) |
| **Transport** | WebSocket primary, with HTTP long-polling fallback. Supports binary data. Custom event-based protocol adds serialization overhead vs raw WS ([MergeSociety - WebSockets vs Socket.IO](https://www.mergesociety.com/code-report/websocets-explained)) |
| **Self-hostability** | Fully self-hostable. Node.js server. Horizontal scaling requires Redis adapter for multi-server pub/sub ([Ably - Scaling Socket.IO](https://ably.com/topic/scaling-socketio)) |
| **Pricing** | Free and open source (MIT) |
| **Vendor lock-in** | None |
| **Complexity** | Low for basic use. Moderate for production: requires implementing rooms, presence, conflict resolution, message ordering, and scaling infrastructure (Redis, load balancers, sticky sessions) ([Socket.IO v4.8.3 - Dec 2025](https://dev.to/abanoubkerols/socketio-the-complete-guide-to-building-real-time-web-applications-2026-edition-c7h)) |

#### ws (raw WebSocket)

| Attribute | Details |
|---|---|
| **What it is** | Minimal, high-performance WebSocket client/server for Node.js. 20K GitHub stars ([GitHub - ws](https://github.com/websockets/ws)) |
| **Conflict resolution** | None. Fully DIY |
| **Offline support** | None. Fully DIY |
| **Presence** | None. Fully DIY |
| **React integration** | None. Use native WebSocket API or wrap manually |
| **Transport** | Raw WebSocket protocol. Lowest possible overhead. Best throughput and latency ([Velt - Socket.IO vs WebSocket](https://velt.dev/blog/socketio-vs-websocket-guide-developers)) |
| **Self-hostability** | Fully self-hostable |
| **Pricing** | Free and open source (MIT) |
| **Vendor lock-in** | None |
| **Complexity** | High. Must build everything: reconnection, heartbeats, rooms, broadcasting, presence, serialization, error handling, scaling |

### Category 4: Firebase Realtime Database

| Attribute | Details |
|---|---|
| **What it is** | Google's managed NoSQL cloud database with real-time sync across connected clients. Data stored as JSON tree ([Firebase](https://firebase.google.com/docs/database)) |
| **Conflict resolution** | Last-write-wins at the path level. Transactions available for atomic read-modify-write operations. No CRDT or OT support ([Firebase Docs](https://firebase.google.com/docs/database)) |
| **Offline support** | Full offline persistence on mobile (iOS, Android, Flutter). **Web SDK: very limited** -- writes buffered in memory only, lost on page reload. No disk persistence for web ([GitHub Issue #7442](https://github.com/firebase/firebase-js-sdk/issues/7442)) |
| **Presence** | Built-in via `.info/connected` + `onDisconnect()` handlers. Well-documented pattern but requires manual setup. onDisconnect must be re-established on each reconnection ([Firebase Presence Blog](https://firebase.blog/posts/2013/06/how-to-build-presence-system/)) |
| **React integration** | No official React hooks. Community libraries exist (e.g., ReactFire). Straightforward to integrate with useEffect ([React Native Firebase](https://rnfirebase.io/database/usage)) |
| **Self-hostability** | **Not self-hostable.** Fully managed Google Cloud service. Firebase Emulator Suite available for local development only ([RxDB - Firebase Alternative](https://rxdb.info/articles/firebase-realtime-database-alternative.html)) |
| **Pricing** | Spark (Free): 1 GB stored, 10 GB/mo download, 100 simultaneous connections. Blaze (pay-as-you-go): $5/GB stored, $1/GB downloaded. Costs can escalate unpredictably with real-time listeners ([Firebase Pricing](https://firebase.google.com/pricing), [Airbyte - Firebase Pricing](https://airbyte.com/data-engineering-resources/firebase-database-pricing)) |
| **Vendor lock-in** | **Very high.** Proprietary database format, proprietary query language, proprietary SDK. Migration requires complete data export and query rewriting ([Supabase - Firebase Comparison](https://supabase.com/alternatives/supabase-vs-firebase)) |
| **Complexity** | Low development complexity for simple cases. Unpredictable cost scaling. Data modeling constrained by JSON tree structure |

### Comparison Summary

| Criterion | Yjs | Automerge | Liveblocks | PartyKit | Supabase RT | Socket.IO | ws | Firebase RTDB |
|---|---|---|---|---|---|---|---|---|
| **Dev Complexity** | Medium | Medium-High | Low | Low-Med | Low-Med | Low-Med | High | Low |
| **Conflict Resolution** | Automatic CRDT | Automatic CRDT | Automatic CRDT | DIY | DIY (Presence: CRDT) | DIY | DIY | Last-write-wins |
| **Offline Support** | Full | Full | Limited | None | None | In-memory only | None | Web: memory only |
| **Presence** | Built-in (Awareness) | Ephemeral data API | First-class hooks | DIY | Built-in API | DIY (easy) | DIY | Manual pattern |
| **React Integration** | Community | Official hooks | Excellent (purpose-built) | Hook available | Community | Community | None | Community |
| **Self-Hostable** | Yes (fully) | Yes (fully) | Partial (AGPL engine) | No (Cloudflare only) | Yes (Docker) | Yes (fully) | Yes (fully) | No |
| **Vendor Lock-in** | None | None | High | Moderate-High | Low-Moderate | None | None | Very High |
| **Pricing** | Free (OSS) | Free (OSS) | Free tier; $30+/mo Pro | $5/mo + usage | Free tier; $25+/mo | Free (OSS) | Free (OSS) | Free tier; usage-based |
| **Bundle Size** | ~17 kB gzip | ~800+ kB (WASM) | SDK ~30-50 kB | ~5 kB (client) | ~20 kB (client) | ~45 kB | ~3 kB | ~100+ kB |
| **Maturity** | High (900K+ weekly DL) | Lower (5K weekly DL) | High (well-funded) | Medium (Cloudflare-backed) | High (Supabase ecosystem) | Very High (59K stars) | Very High | Very High (Google) |

### Is CRDT Complexity Justified for Card-Level Collaboration?

This is the central design question. The analysis follows:

**Arguments against CRDTs for this use case:**

1. **Conflict rarity**: Cards are discrete objects. Two users simultaneously editing the *same field of the same card* is an edge case, not the norm. Most concurrent operations are creating different cards or appending different chat messages -- naturally non-conflicting operations ([TinyMCE - OT vs CRDT](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/)).

2. **Append-only chat**: Chat messages are append-only. An ordered list with server-assigned timestamps or sequence numbers resolves ordering without CRDTs ([CRDT Dictionary](https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/)).

3. **Unnecessary overhead**: CRDTs maintain metadata for conflict resolution (version vectors, tombstones, operation history) that adds memory and bandwidth cost. For card-level operations, a simple server-authoritative broadcast achieves the same user-visible result with less complexity ([Velt - CRDT Implementation Guide](https://velt.dev/blog/crdt-implementation-guide-conflict-free-apps)).

4. **Server-authoritative model fits better**: With a central server already required for AI agent participation, persistence, and authentication, a server-authoritative state model is natural. The server is the source of truth; clients receive updates via broadcast.

**Arguments for CRDTs:**

1. **Future-proofing**: If cards ever support rich-text content editing (e.g., collaborative editing within a card), CRDTs become essential. Starting with CRDT infrastructure avoids a costly migration later.

2. **Offline support**: If users need to work offline and sync later, CRDTs handle merge automatically. A server-broadcast model requires custom reconciliation logic for offline scenarios.

3. **Yjs is lightweight enough**: At ~17 kB gzipped, Yjs adds minimal overhead. Using Y.Map for cards and Y.Array for chat, the API is not much more complex than managing a Redux store. The Awareness protocol provides presence for free.

4. **Proven at scale**: Yjs powers collaborative features in production at companies building tools similar to this use case (shared workspaces, not just text editors) ([Synergy Codes - React Flow + Yjs](https://www.synergycodes.com/blog/real-time-collaboration-for-multiple-users-in-react-flow-projects-with-yjs-e-book)).

**Verdict**: For the current requirements (card-level ops, chat append, presence), **CRDTs are not strictly necessary**. A server-authoritative WebSocket broadcast with last-write-wins at the card level would work. However, Yjs's lightweight footprint and built-in Awareness protocol make it a reasonable choice if there is *any* expectation of richer in-card editing in the future, or if offline support is desired.

## Conclusions

### Recommended Approach: Server-Authoritative WebSocket Broadcast with Optional Yjs Upgrade Path

**Primary recommendation**: Start with a **server-authoritative WebSocket broadcast** model using **Socket.IO** (or a similar WebSocket layer):

1. **Server holds authoritative state** for each session (cards, chat, presence).
2. **Clients send operations** (createCard, updateCard, deleteCard, sendMessage) to the server.
3. **Server validates, persists, and broadcasts** the resulting state changes to all session participants.
4. **Presence** is tracked server-side using connection join/leave events, broadcast to all clients.
5. **AI participant** connects as another client, sending operations through the same channel.
6. **Conflict resolution** is last-write-wins at the card level, which is acceptable given the low-conflict profile. For rare true conflicts (two users editing the same card), the last server-received update wins, and the "losing" client sees their UI update to reflect the authoritative state.

**Why this approach:**

- **Simplest correct solution** for the stated requirements. Card-level CRUD + chat append + presence do not require the merge semantics CRDTs provide.
- **Self-hostable** with no vendor lock-in. Socket.IO is MIT-licensed, battle-tested, and scales horizontally with Redis.
- **Zero marginal cost** -- no per-message pricing, no MAU limits.
- **AI agent integration** is straightforward -- the AI connects as a WebSocket client, same as human users.
- **Redux Toolkit integration** is clean: WebSocket events dispatch Redux actions, updating the store. This is a well-documented pattern.

**Upgrade path to Yjs**: If future requirements introduce rich-text editing within cards or offline-first support, Yjs can be layered in for specific features (e.g., Y.Text for card content editing) without replacing the overall architecture. Yjs's transport-agnostic design means it can run over the same WebSocket connection.

### Why Not the Alternatives

| Option | Why Not (for this use case) |
|---|---|
| **Yjs/Automerge as primary** | CRDT merge semantics are overkill for card-level CRUD. Adds conceptual complexity (shared types, providers, document model) without proportional benefit. Automerge's WASM bundle is prohibitively large. |
| **Liveblocks** | Excellent DX but high vendor lock-in, not truly self-hostable, and per-room pricing is unnecessary cost for an open-source scientific tool. Data residency concerns for institutional deployments. |
| **PartyKit** | Elegant model but locked to Cloudflare. Not self-hostable. Limited built-in primitives (no presence, no conflict resolution). |
| **Supabase Realtime** | Good if already using Supabase for database. But Realtime self-hosting has had stability issues, and no built-in conflict resolution for application data. Adds Elixir operational dependency. |
| **Firebase RTDB** | Not self-hostable. Very high vendor lock-in. Web offline support is effectively non-existent. Unpredictable cost scaling. |
| **Raw ws** | Too low-level. Would require building rooms, reconnection, heartbeats, and presence from scratch. Socket.IO provides these out of the box. |

### Architecture Sketch

```
Client A (React + Redux)          Server (Node.js)          Client B (React + Redux)
        |                              |                              |
        |--- createCard(data) -------->|                              |
        |                              |-- validate & persist         |
        |<-- cardCreated(card) --------|-- cardCreated(card) -------->|
        |                              |                              |
        |                              |<--- sendMessage(msg) --------|
        |                              |-- validate & persist         |
        |<-- messageReceived(msg) -----|-- messageReceived(msg) ----->|
        |                              |                              |
        |--- presenceUpdate(state) --->|                              |
        |<-- presenceSync(all) --------|-- presenceSync(all) -------->|
        |                              |                              |
AI Agent connects as Client C, same protocol
```

## Sources

### CRDT Libraries
- [Yjs GitHub Repository](https://github.com/yjs/yjs)
- [Yjs Documentation](https://docs.yjs.dev)
- [Yjs Awareness & Presence](https://docs.yjs.dev/getting-started/adding-awareness)
- [Yjs Awareness API](https://docs.yjs.dev/api/about-awareness)
- [y-websocket Documentation](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket)
- [Yjs Shared Types](https://docs.yjs.dev/getting-started/working-with-shared-types)
- [Yjs WebSocket Server Guide - Velt](https://velt.dev/blog/yjs-websocket-server-real-time-collaboration)
- [Building a Collaborative Editing App with Yjs, valtio, and React](https://dev.to/route06/tutorial-building-a-collaborative-editing-app-with-yjs-valtio-and-react-1mcl)
- [Y.js for Collaborative React Apps](https://medium.com/@t.bendallah/taming-real-time-state-why-y-js-is-the-ultimate-tool-for-collaborative-react-apps-922630e9659f)
- [Real-time Collaboration with React Flow + Yjs](https://www.synergycodes.com/blog/real-time-collaboration-for-multiple-users-in-react-flow-projects-with-yjs-e-book)
- [Yjs Deep Dive Part 3: Awareness - Tag1 Consulting](https://www.tag1consulting.com/blog/yjs-deep-dive-part-3)
- [Automerge Homepage](https://automerge.org/)
- [Automerge Repo](https://automerge.org/blog/automerge-repo/)
- [Automerge React Integration](https://automerge.org/docs/tutorial/react/)
- [Automerge Ephemeral Data](https://automerge.org/docs/reference/repositories/ephemeral/)
- [Automerge Sync Server](https://github.com/automerge/sync-server)
- [Automerge 3.0 Memory Improvements](https://biggo.com/news/202508071934_Automerge_3.0_Memory_Improvements)
- [Automerge WASM Packaging](https://automerge.org/blog/2024/08/23/wasm-packaging/)
- [Yjs vs Automerge npm trends](https://npmtrends.com/automerge-vs-yjs)
- [CRDT Benchmarks](https://github.com/dmonad/crdt-benchmarks)

### Hosted Platforms
- [Liveblocks Homepage](https://liveblocks.io)
- [Liveblocks Pricing](https://liveblocks.io/pricing)
- [Liveblocks React API Reference](https://liveblocks.io/docs/api-reference/liveblocks-react)
- [Liveblocks Presence Tutorial](https://liveblocks.io/docs/tutorial/react/getting-started/presence)
- [Liveblocks Open Source Sync Engine](https://liveblocks.io/blog/open-sourcing-the-liveblocks-sync-engine-and-dev-server)
- [Liveblocks Review & Alternatives - Velt](https://velt.dev/blog/liveblocks-sdk-review-alternatives-2025)
- [PartyKit Homepage](https://www.partykit.io/)
- [PartyKit Joining Cloudflare](https://blog.partykit.io/posts/partykit-is-joining-cloudflare/)
- [Cloudflare Acquires PartyKit](https://blog.cloudflare.com/cloudflare-acquires-partykit/)
- [PartySocket API](https://docs.partykit.io/reference/partysocket-api/)
- [PartyKit GitHub](https://github.com/cloudflare/partykit)
- [Cloudflare Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [PartyKit Real-Time Collaboration 2026](https://latestfromtechguy.com/article/partykit-realtime-collaboration-2026)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Realtime Pricing](https://supabase.com/docs/guides/realtime/pricing)
- [Supabase Presence](https://supabase.com/docs/guides/realtime/presence)
- [Supabase Broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- [Supabase Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture)
- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Supabase Realtime Self-Hosting Issues](https://github.com/supabase/realtime/issues/1617)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase vs Firebase](https://supabase.com/alternatives/supabase-vs-firebase)

### WebSocket Libraries
- [Socket.IO Complete Guide 2026](https://dev.to/abanoubkerols/socketio-the-complete-guide-to-building-real-time-web-applications-2026-edition-c7h)
- [Socket.IO Offline Behavior](https://socket.io/docs/v3/client-offline-behavior/)
- [Socket.IO Connection State Recovery](https://socket.io/docs/v4/connection-state-recovery)
- [Socket.IO Rooms](https://www.videosdk.live/developer-hub/socketio/socketio-rooms)
- [Scaling Socket.IO - Ably](https://ably.com/topic/scaling-socketio)
- [WebSockets vs Socket.IO Guide 2025](https://www.mergesociety.com/code-report/websocets-explained)
- [Socket.IO vs WebSocket - Velt](https://velt.dev/blog/socketio-vs-websocket-guide-developers)
- [Choosing WebSocket Library for React - Ably](https://ably.com/blog/choosing-the-right-websocket-library-for-react-project)
- [ws GitHub Repository](https://github.com/websockets/ws)
- [React WebSocket Tutorial - LogRocket](https://blog.logrocket.com/websocket-tutorial-socket-io/)

### Firebase
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Firebase Presence System](https://firebase.blog/posts/2013/06/how-to-build-presence-system/)
- [Firebase Web Offline Capabilities](https://firebase.google.com/docs/database/web/offline-capabilities)
- [Firebase Web Offline Persistence Issue](https://github.com/firebase/firebase-js-sdk/issues/7442)
- [Firebase Pricing Breakdown - Airbyte](https://airbyte.com/data-engineering-resources/firebase-database-pricing)
- [Firebase Alternatives - RxDB](https://rxdb.info/articles/firebase-realtime-database-alternative.html)

### CRDT vs OT / Conflict Resolution Theory
- [OT vs CRDT - TinyMCE](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/)
- [Building Collaborative Interfaces: OT vs CRDTs](https://dev.to/puritanic/building-collaborative-interfaces-operational-transforms-vs-crdts-2obo)
- [CRDT Implementation Guide - Velt](https://velt.dev/blog/crdt-implementation-guide-conflict-free-apps)
- [CRDT Dictionary - Ian Duncan](https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/)
- [Understanding CRDTs](https://shambhavishandilya.medium.com/understanding-real-time-collaboration-with-crdts-e764eb65024e)
- [Conflict-free Replicated Data Type - Wikipedia](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
- [Concurrency and Automatic Conflict Resolution](https://www.codecentric.de/wissens-hub/blog/concurrency-and-automatic-conflict-resolution)
- [Offline-First Collaborative Editors with CRDTs](https://dev.to/hexshift/building-offline-first-collaborative-editors-with-crdts-and-indexeddb-no-backend-needed-4p7l)
