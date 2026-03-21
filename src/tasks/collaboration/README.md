# Collaboration Domain -- Task Breakdown

Real-time multi-user sessions over Socket.IO with server-authoritative state, presence awareness, and card-level pessimistic locking. This domain adds the real-time collaboration layer on top of the workspace and card domains, enabling multiple human and AI participants to work on the same session simultaneously with conflict-free card editing.

## Implementation Targets

| Target | Description | Source |
|--------|-------------|--------|
| Socket.IO client | Transport layer with auth, reconnection, room membership | collaboration.md ss1-2 |
| Collaboration Zustand store | Lock map, presence map, optimistic state | collaboration.md s10 |
| Presence system | Track online/idle/offline status and card focus per participant | collaboration.md s4 |
| Card locking protocol | Pessimistic lock acquire/release/heartbeat/deny lifecycle | collaboration.md s5 |
| Lock UX | Avatar badges, disabled controls, denied-click toasts, tooltips | collaboration.md s6 |
| AI participant | Symmetric AI socket client, preemption ("Stop generating") | collaboration.md s8 |
| Note cards | Collaboration-primitive note card type | collaboration.md s9 |
| Reconnection & recovery | Snapshot reconciliation, lost-lock toast, local edit preservation | collaboration.md s1,s5 |

## Task Table

| ID | Summary | Deps | Status | Preflight |
|----|---------|------|--------|-----------|
| 01 | Socket.IO client manager with auth and reconnection | app-shell (env config, auth token) | planned | `VITE_WS_URL` env var exists |
| 02 | Collaboration Zustand store (locks + presence slices) | workspace (session store) | planned | workspace session store exists |
| 03 | Session room join/leave protocol | 01, 02 | planned | Socket client connects |
| 04 | Presence store slice and sync handler | 02, 03 | planned | Room join works |
| 05 | Presence UI (participant list + card avatars) | 04, design-system (Avatar) | planned | Presence store populated |
| 06 | Card lock protocol (request/grant/deny/release/heartbeat) | 01, 02 | planned | Socket client connects |
| 07 | Lock heartbeat timer and TTL management | 06 | planned | Lock grant works |
| 08 | Lock UX (avatar badge, disabled controls, denied toast) | 06, 07, card (CardHeader) | planned | Lock store populated |
| 09 | Server-authoritative card mutations (create/update/delete broadcast) | 03, 06, workspace (card store) | planned | Room + lock protocol works |
| 10 | AI participant lock lifecycle and preemption | 06, 07, card (streaming) | planned | Lock protocol works |
| 11 | Reconnection recovery (snapshot reconcile, lost-lock toast) | 01, 02, 06, 07 | planned | Socket client reconnects |
| 12 | Note card type | card (CardType, card body renderer) | planned | Card model exists |
| 13 | MSW + Socket.IO test harness | 01, 02, 03 | planned | Socket client exists |

## Critical Path

```
                     ┌──────────┐
                     │ 01       │
                     │ Socket   │
                     │ Client   │
                     └────┬─────┘
                          │
               ┌──────────┼──────────┐
               │          │          │
          ┌────▼────┐ ┌───▼────┐    │
          │ 02      │ │ 13     │    │
          │ Zustand │ │ Test   │    │
          │ Store   │ │ Harness│    │
          └────┬────┘ └────────┘    │
               │                    │
       ┌───────┼────────┐          │
       │       │        │          │
  ┌────▼──┐ ┌──▼───┐ ┌──▼───┐    │
  │ 03    │ │ 06   │ │ 04   │    │
  │ Room  │ │ Lock │ │ Pres │    │
  │ Join  │ │ Proto│ │ Sync │    │
  └───┬───┘ └──┬───┘ └──┬───┘    │
      │        │        │        │
      │   ┌────▼──┐  ┌──▼───┐   │
      │   │ 07    │  │ 05   │   │
      │   │ Heart │  │ Pres │   │
      │   │ beat  │  │ UI   │   │
      │   └──┬────┘  └──────┘   │
      │      │                   │
  ┌───▼──────▼───┐  ┌───────┐   │
  │ 09           │  │ 08    │   │
  │ Card Mutate  │  │ Lock  │   │
  │ Broadcast    │  │ UX    │   │
  └───┬──────────┘  └───────┘   │
      │                         │
  ┌───▼──────────┐  ┌──────┐   │
  │ 10           │  │ 11   │   │
  │ AI Preempt   │  │ Recon│◄──┘
  └──────────────┘  └──────┘

  ┌──────┐
  │ 12   │  (independent, depends on card domain only)
  │ Note │
  │ Card │
  └──────┘
```

## Parallelism Opportunities (Waves)

| Wave | Tasks | Rationale |
|------|-------|-----------|
| 1 | 01, 12 | Socket client is foundational; Note card is independent (card domain only) |
| 2 | 02, 13 | Store and test harness depend only on socket client |
| 3 | 03, 04, 06 | Room join, presence sync, and lock protocol can proceed in parallel once store exists |
| 4 | 05, 07, 09 | Presence UI, heartbeat, and card mutations are independent of each other |
| 5 | 08, 10, 11 | Lock UX, AI preemption, and reconnection recovery are leaf tasks |

## Cross-Domain Dependencies

| Dependency | Domain | What is needed |
|------------|--------|---------------|
| `VITE_WS_URL` env var | app-shell | Socket.IO server URL in environment config |
| Auth token access | app-shell | Function or store to get current auth token for socket handshake |
| Session store | workspace | `useSessionStore` with `cards`, `order`, `addCard`, `updateCard`, `removeCard` |
| Card model / CardType / CardStatus | card | Type definitions and card data shapes |
| Card header component | card | `CardHeader` for lock avatar badge integration |
| Card body renderer | card | Body renderer registry for note card type |
| Avatar component | design-system | Shared avatar primitive for presence indicators |
| Toast component | design-system | Inline toast for lock-denied and lost-lock notifications |
