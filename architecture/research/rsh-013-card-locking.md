# RSH-013: What Card-Level Locking Pattern Should We Use for Collaborative Sessions?

**Date:** 2026-03-21 | **Status:** Completed

## Question

For The Helm's collaborative sessions -- where multiple users share a workspace of discrete cards synced via Socket.IO with server-authoritative state -- what pessimistic locking pattern should we implement at the card level? How should locks be acquired, released, and displayed? How do we handle AI agents holding locks during streaming responses, disconnections, and edge cases?

## Context

The Helm is a collaborative scientific workspace where multiple users (including an AI participant) share a session of discrete cards. Based on RSH-004 findings, we chose **Socket.IO WebSocket broadcast with server-authoritative state** as the real-time collaboration layer. The conflict profile is low (cards are discrete atomic units), but we need explicit ownership during editing rather than last-write-wins conflict resolution.

### Why Pessimistic Locking Over Optimistic

The key insight from RSH-004 is that The Helm's cards are **discrete objects, not collaboratively edited text**. This makes pessimistic locking the right choice:

- **Cards are atomic units**: Unlike Google Docs (character-level OT) or Figma (property-level CRDTs), a card is edited by one user at a time. Two users should not concurrently modify the same card's content.
- **Interactions are stateful**: Some cards involve multi-step interactions (configuring a visualization, running an analysis) where partial state must be protected.
- **AI streaming**: When the AI is generating content for a card (streaming a response), the card must be exclusively owned to prevent conflicting user edits mid-stream.
- **Simplicity**: OT and CRDTs add substantial complexity (see RSH-004) that is not justified when the collaboration unit is a whole card rather than sub-document text.

### What We Need to Decide

1. Lock acquisition/release protocol over Socket.IO
2. Lock timeout/expiry duration and heartbeat renewal
3. Disconnect and failure handling
4. UX for locked cards
5. AI agent lock behavior during streaming
6. Edge cases (multiple locks per user, tab close, network partition)
7. Hybrid approach for non-destructive actions on locked cards
8. Build vs. buy

## Findings

### 1. Pessimistic vs. Optimistic Locking: When Is Each Appropriate?

| Factor | Pessimistic Locking | Optimistic Locking |
|---|---|---|
| **Assumption** | Conflicts are likely; prevent them upfront ([Medium - Abhirup Acharya](https://medium.com/@abhirup.acharya009/managing-concurrent-access-optimistic-locking-vs-pessimistic-locking-0f6a64294db7)) | Conflicts are rare; detect at commit time ([Wikipedia - Optimistic concurrency control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)) |
| **Mechanism** | Acquire exclusive lock before editing; others blocked until release ([Vlad Mihalcea](https://vladmihalcea.com/optimistic-vs-pessimistic-locking/)) | Allow concurrent edits; validate version/hash on save; reject stale writes ([ByteByteGo](https://bytebytego.com/guides/pessimistic-vs-optimistic-locking/)) |
| **Best for** | High contention, stateful multi-step interactions, data integrity critical ([Modern Treasury](https://www.moderntreasury.com/learn/pessimistic-locking-vs-optimistic-locking)) | Read-heavy workloads, short transactions, low contention ([Inery](https://inery.io/blog/article/optimistic-vs-pessimistic-locking-difference-and-best-use-cases/)) |
| **Downside** | Reduced throughput; risk of lock starvation; complexity of timeout/cleanup ([System Design Codex](https://newsletter.systemdesigncodex.com/p/pessimistic-vs-optimistic-locking)) | Retry cost on conflict; poor UX when conflicts are frequent; complex merge logic |
| **Scalability** | Degrades with many concurrent users due to lock contention ([Vlad Mihalcea](https://vladmihalcea.com/optimistic-vs-pessimistic-locking/)) | Scales well for read-heavy patterns |

#### Prior Art in Collaborative Tools

| Tool | Approach | Details |
|---|---|---|
| **Google Docs** | Optimistic (OT) | No locking. Uses Operational Transformation to merge concurrent character-level edits in real time. All edits boil down to insert, delete, and style operations on a revision log ([Google Drive Blog](https://drive.googleblog.com/2010/09/whats-different-about-new-google-docs_22.html)) |
| **Figma** | Optimistic (CRDT-inspired) | No per-object edit locks. Uses CRDT-inspired conflict resolution where concurrent edits to the same property on the same object use last-writer-wins. Server-side file-level locks via DynamoDB prevent journal corruption, but client editing is lock-free ([Figma Blog - Multiplayer](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)) |
| **Notion** | Hybrid | Last-write-wins for concurrent page edits (no character-level OT/CRDT). Offers explicit **Page Lock** that makes a page read-only; lock icon shown at top of page. "Unlock for me" option available for owners ([Notion Help Center](https://www.notion.com/help/collaborate-within-a-workspace)) |
| **Miro** | Explicit object lock | Users can lock board objects to prevent accidental moves/edits. **Protected Lock** (paid feature) ensures only the board owner/co-owner who locked an item can unlock it. Lock icon appears on context menu; shield icon for protected lock ([Miro Help Center](https://help.miro.com/hc/en-us/articles/4408887253778-Locking-content-on-the-board)) |
| **Trello** | None (last-write-wins) | No locking mechanism. When two users edit the same card description simultaneously, the first save wins and the other user's edits are silently lost. This is a known pain point ([Atlassian Community](https://community.atlassian.com/forums/Trello-questions/Simultaneous-editing-by-two-different-users/qaq-p/1301697)) |
| **Confluence** | Hybrid (collaborative + fallback lock) | Uses Synchrony service for real-time collaborative editing (up to 12 concurrent editors). When Synchrony is offline, falls back to pessimistic locking where only one user can edit at a time. Shows editor avatars during concurrent editing ([Atlassian - Collaborative Editing](https://developer.atlassian.com/cloud/confluence/collaborative-editing/)) |

**Conclusion for The Helm**: Pessimistic locking is the right fit. Our cards are discrete objects (not text streams), contention on any single card is expected (one user at a time), and the AI streaming use case demands exclusive ownership. Google Docs/Figma-style OT/CRDT is overkill. Trello's lack of locking demonstrates the data-loss risk we want to avoid. Miro and Notion's explicit lock patterns are the closest analogs.

### 2. Lock Implementation Patterns

#### Server-Side Lock Table

The server maintains an in-memory lock registry mapping `cardId` to lock metadata. Each entry contains: the locking user's ID, their socket/connection ID, a timestamp of acquisition, and the lock's expiry time ([Marmelab - Real-Time Resource Locking](https://marmelab.com/blog/2017/09/13/real-time-resource-locking-using-socketio-and-react-router.html)).

```
LockEntry {
  cardId: string
  userId: string
  socketId: string        // unique per tab/connection
  acquiredAt: timestamp
  expiresAt: timestamp
  lockType: 'user' | 'ai'
}
```

For a single-server deployment, an in-memory `Map<cardId, LockEntry>` is sufficient. When scaling to multiple server instances, the lock table should move to Redis with TTL-based expiry ([Redis Docs - Distributed Locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)).

#### Lock Acquisition/Release Protocol Over Socket.IO

Based on the Marmelab pattern and Socket.IO's event-driven architecture ([Marmelab](https://marmelab.com/blog/2017/09/13/real-time-resource-locking-using-socketio-and-react-router.html), [Socket.IO Docs](https://socket.io/docs/v4/)):

| Event | Direction | Payload | Behavior |
|---|---|---|---|
| `card:lock:request` | Client -> Server | `{ cardId }` | Server checks lock table. If free, grants lock, broadcasts update. If held by another user, returns rejection with holder info. |
| `card:lock:granted` | Server -> Client | `{ cardId, holder: { userId, displayName } }` | Confirms lock acquisition to requesting client. |
| `card:lock:denied` | Server -> Client | `{ cardId, holder: { userId, displayName }, reason }` | Lock held by another user/AI. |
| `card:lock:release` | Client -> Server | `{ cardId }` | Server verifies requester holds the lock, removes entry, broadcasts update. |
| `card:lock:released` | Server -> Broadcast | `{ cardId }` | Notifies all clients that a card is now available. |
| `card:lock:state` | Server -> Client | `{ locks: LockEntry[] }` | Full lock state sent on initial connection or reconnection. |
| `card:lock:heartbeat` | Client -> Server | `{ cardId }` | Renews the lock lease (see below). |

The server is **authoritative**: it validates all lock requests and maintains the single source of truth. Clients should not assume a lock is held without server confirmation.

#### Lock Timeout/Expiry and Heartbeat Renewal

Lock leases prevent indefinite resource holding when clients fail silently.

| Parameter | Recommended Value | Rationale |
|---|---|---|
| **Lock lease duration** | 30 seconds | Long enough to cover normal interaction without constant renewal; short enough to recover from crashes within a reasonable window. Redis `SET NX PX 30000` uses this as a common default ([Redis Docs](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)). DynamoDB Lock Client examples use 10-30 second leases ([AWS Blog - DynamoDB Lock Client](https://aws.amazon.com/blogs/database/building-distributed-locks-with-the-dynamodb-lock-client/)). |
| **Heartbeat interval** | 10 seconds | Approximately 1/3 of the lease duration. Sends `card:lock:heartbeat` to reset the expiry timer. This ratio (heartbeat = lease/3) mirrors patterns in distributed systems like Eureka (30s heartbeat, 90s expiry) and DynamoDB Lock Client ([GitHub - DynamoDB Lock Client](https://github.com/awslabs/amazon-dynamodb-lock-client/issues/34)). |
| **Grace period after missed heartbeat** | 1 missed heartbeat tolerated | If the server misses one heartbeat (network blip), the lock persists. After 2 missed heartbeats (20 seconds without contact), the lock is considered stale and auto-released. |
| **AI lock lease duration** | 60 seconds | AI streaming responses may take longer. Longer lease with same heartbeat interval. The AI backend sends heartbeats during token generation. |

The server runs a periodic sweep (every 5 seconds) to check for expired locks and release them, broadcasting `card:lock:released` events.

#### Handling Disconnects

Socket.IO provides a `disconnect` event that fires when a client's connection is lost ([Socket.IO Docs - Server Socket Instance](https://socket.io/docs/v4/server-socket-instance/)). However, detection is not always immediate:

| Scenario | Detection Time | Handling |
|---|---|---|
| **Clean tab close** | Immediate (browser sends WebSocket close frame) | `disconnect` event fires; server releases all locks held by that `socketId` ([Marmelab](https://marmelab.com/blog/2017/09/13/real-time-resource-locking-using-socketio-and-react-router.html)). |
| **Browser crash / kill** | `pingInterval + pingTimeout` (default: 25s + 20s = 45s in Socket.IO v4) | Socket.IO's heartbeat mechanism detects the dead connection ([Socket.IO - How It Works](https://socket.io/docs/v4/how-it-works/)). |
| **Network partition** | `pingInterval + pingTimeout` (45s default) | Same as crash. Lock also has its own expiry timer as a safety net. |
| **beforeunload fallback** | Immediate | Client sends explicit `card:lock:release` in `beforeunload`/`pagehide` event as a best-effort supplement to Socket.IO disconnect. Not guaranteed to complete. |

**Key design decision**: Lock expiry is the ultimate safety net. Even if Socket.IO disconnect detection fails (which is rare but possible with browser throttling of background tabs -- [Socket.IO Issue #3507](https://github.com/socketio/socket.io/issues/3507)), the lock's TTL ensures it will be released within the lease duration.

### 3. UX Patterns for Locked Resources

Based on research across Miro, Notion, Figma, Confluence, and UX best-practice guides:

#### Visual Indicator Approaches

| Pattern | Used By | Description | Pros | Cons |
|---|---|---|---|---|
| **Lock icon badge** | Miro, Notion | Small padlock icon overlaid on the locked element. Notion shows lock icon at page top. Miro shows lock icon in context menu ([Miro Help](https://help.miro.com/hc/en-us/articles/4408887253778-Locking-content-on-the-board), [Notion Help](https://www.notion.com/help/collaborate-within-a-workspace)). | Clear, universally understood | Doesn't show *who* holds the lock |
| **Avatar indicator** | Figma, Confluence, Liveblocks | User's avatar/photo shown on the element being edited. Confluence shows editor avatars during collaborative editing ([Atlassian - Collaborative Editing](https://developer.atlassian.com/cloud/confluence/collaborative-editing/)). | Shows identity; feels social/collaborative | Takes more visual space |
| **Colored border/highlight** | Figma, Google Docs | Element gets a colored border matching the lock holder's assigned color. Common in text editors for cursor position ([Ably - Collaborative UX](https://ably.com/blog/collaborative-ux-best-practices)). | Distinctive; supports multiple simultaneous indicators | Color alone may not be accessible |
| **Disabled/ghosted state** | Common pattern | Card becomes visually muted (reduced opacity, greyed out) with interactions disabled ([Ably - Collaborative UX](https://ably.com/blog/collaborative-ux-best-practices)). | Clear "can't edit" signal | May look broken rather than locked |
| **Tooltip on hover** | Nextcloud, Confluence | Hovering over locked element shows "Locked by [Name]" or "Edited by [Name]" tooltip ([GitHub - Nextcloud files_lock #157](https://github.com/nextcloud/files_lock/issues/157)). | Non-intrusive; informative | Requires hover; not visible at a glance |
| **Banner/notification** | Confluence Edit Lock plugin | Prominent pop-up notification when attempting to edit a locked resource. User must acknowledge before proceeding ([Seibert Group - Edit Lock for Confluence](https://seibert.group/blog/en/edit-lock-for-confluence-better-protection-against-simultaneous-editing-of-confluence-pages/)). | Hard to miss; explicit | Disruptive; interrupts flow |

#### Recommended UX for The Helm

Combine multiple patterns for clarity:

1. **Avatar badge on card**: Show the lock holder's avatar (or AI icon) in the card's top-right corner with a subtle colored ring. This answers "who has it?" at a glance.
2. **Reduced interactivity**: Disable edit controls on locked cards (buttons greyed out, text fields read-only). Card remains fully visible -- not ghosted, since users should still read the content.
3. **Tooltip on avatar**: Hover shows "Being edited by [Name]" or "AI is generating..." with duration held.
4. **Soft denial on click**: If a user clicks an edit control on a locked card, show an inline toast: "This card is being edited by [Name]." Do not use a modal -- keep the flow lightweight.
5. **Presence awareness**: In the session participant list, show which card each user is actively editing (member location indicator) ([Ably - Collaborative UX](https://ably.com/blog/collaborative-ux-best-practices)).

#### Queue to Edit

A "wait in line" queue adds complexity and may not be necessary for The Helm's use case (2-20 users, many cards). Instead, rely on the social protocol: users see the avatar, know the card is busy, and work on something else. If lock hold times are short (enforced by timeout), starvation is unlikely. However, a simple "Notify me when available" option could be a later enhancement.

### 4. AI Agent + Locks

When the AI agent is updating a card (streaming a response), it holds a lock like any other participant. This introduces unique considerations:

#### AI Lock Lifecycle

| Phase | Behavior |
|---|---|
| **Lock acquisition** | Server acquires lock on behalf of AI when a card generation request is initiated. Lock type is `'ai'`. AI avatar appears on the card. |
| **During streaming** | AI backend sends heartbeat events to renew the lock lease while tokens are being generated. Card shows streaming indicator + AI avatar. |
| **Completion** | AI releases lock when streaming finishes. Card becomes editable. |
| **Error/timeout** | If AI backend crashes or times out, the lock expires via the standard TTL mechanism (60s for AI locks). |

#### User Interruption / Lock Preemption

When a user wants to stop the AI mid-stream and take over the card:

| Approach | Description | Trade-offs |
|---|---|---|
| **"Stop generating" button** | User clicks a stop button on the AI-locked card. Server aborts the AI stream (via AbortController -- [Vercel AI SDK - Stopping Streams](https://ai-sdk.dev/docs/advanced/stopping-streams)), releases the AI lock, and grants the lock to the requesting user. | Clean UX. Requires the AI backend to support abort signals and partial response cleanup ([Vercel AI SDK](https://ai-sdk.dev/docs/advanced/stopping-streams)). |
| **Preemption with confirmation** | User requests the card; server prompts "AI is generating. Stop and take over?" On confirm, server aborts AI stream and transfers lock. | Safer; prevents accidental interruption. Slightly more friction. |
| **No preemption** | User must wait for AI to finish or for AI lock to expire. | Simplest implementation. Frustrating if AI is slow or stuck. |

**Recommendation**: Implement "Stop generating" with a single click (no confirmation modal). The AI stream is aborted server-side, partial content is preserved (the `onAbort` callback saves completed steps -- [Vercel AI SDK](https://ai-sdk.dev/docs/advanced/stopping-streams)), and the user immediately gets the lock. This mirrors the pattern used by ChatGPT, Claude, and other AI interfaces where users expect instant interruption capability.

The server handles the preemption atomically:
1. Receive `card:lock:preempt` from user
2. Send abort signal to AI backend
3. Save partial AI response to card state
4. Release AI lock
5. Grant user lock
6. Broadcast lock state change

### 5. Edge Cases

#### Tab Close Without Releasing

**Risk**: User closes browser tab mid-edit without explicit lock release.

**Mitigation**: Three-layer defense:
1. `beforeunload` event handler sends `card:lock:release` (best-effort, not guaranteed) ([MDN - beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event))
2. Socket.IO `disconnect` event triggers server-side lock cleanup ([Marmelab](https://marmelab.com/blog/2017/09/13/real-time-resource-locking-using-socketio-and-react-router.html))
3. Lock TTL expiry as ultimate fallback (30s for user locks, 60s for AI locks)

#### Network Partition

**Risk**: Client loses connectivity but process continues running. Client believes it still holds the lock; server may expire it.

**Mitigation**:
- Server expires the lock after `lease duration` with no heartbeat ([Redis Docs](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/))
- Client monitors Socket.IO connection state. On reconnect, client requests fresh lock state via `card:lock:state`. If the lock was lost, client transitions the card to read-only and shows a notification: "Connection was interrupted. Your lock on [Card] has been released."
- Any unsaved edits are preserved locally and the user is prompted to re-acquire the lock and apply changes (similar to offline-first reconciliation)

#### Multiple Locks Per User

**Decision**: Allow a user to hold **one lock at a time** per session.

**Rationale**: This simplifies the mental model (you are "focused" on one card) and prevents a single user from monopolizing multiple cards. If a user clicks to edit a different card, their current lock is auto-released and the new lock is acquired. This mirrors the Marmelab pattern where navigating away from a resource auto-releases its lock ([Marmelab](https://marmelab.com/blog/2017/09/13/real-time-resource-locking-using-socketio-and-react-router.html)).

**Exception**: The AI agent may hold multiple locks if generating content for multiple cards in parallel. This is a server-side policy decision.

#### Lock Starvation

**Risk**: A user repeatedly re-acquires a lock, preventing others from ever editing a card.

**Mitigation**: In a 2-20 user session with many cards, starvation is unlikely because:
- Lock leases are time-bounded (30s without heartbeat renewal implies active use)
- Social pressure: other users can see who holds locks
- If needed, a maximum continuous hold time (e.g., 5 minutes) can force release with a warning: "You've held this card for 5 minutes. Others may want to edit."

Formal fair-queuing (FIFO lock queues) is unnecessary at our scale but could be added later. Fair locks grant access to the longest-waiting requestor, trading throughput for guaranteed lack of starvation ([Jenkov - Starvation and Fairness](https://jenkov.com/tutorials/java-concurrency/starvation-and-fairness.html)).

#### Deadlocks

**Not a risk** in our model. Deadlocks require circular wait (A holds lock 1, waits for lock 2; B holds lock 2, waits for lock 1). With single-lock-per-user policy and independent card locks, circular dependencies cannot form. Even without the single-lock policy, card locks are independent resources with no ordering dependency.

### 6. Libraries and Patterns: Build vs. Buy

| Option | Description | Fit for The Helm |
|---|---|---|
| **Roll our own (in-memory)** | Simple `Map<cardId, LockEntry>` on the server. Lock/unlock via Socket.IO events. Periodic sweep for expired locks. Pattern demonstrated by Marmelab ([Marmelab](https://marmelab.com/blog/2017/09/13/real-time-resource-locking-using-socketio-and-react-router.html)). | **Best fit for v1.** Simple, no dependencies, full control. Works for single-server deployment. |
| **Redis SET NX PX** | Single Redis instance with `SET resource NX PX 30000` for atomic lock acquisition with TTL. Release via Lua script or `DELEX IFEQ` (Redis 8.4+) ([Redis Docs](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)). | **Best fit for multi-server.** When we scale to multiple Socket.IO server instances behind a load balancer, locks must be shared. Single Redis instance is sufficient for our correctness needs. |
| **Redlock (node-redlock)** | Distributed lock across N Redis instances. Majority-based consensus for fault tolerance ([npm - redlock](https://www.npmjs.com/package/redlock), [GitHub - node-redlock](https://github.com/mike-marcacci/node-redlock)). | **Overkill.** Martin Kleppmann's analysis shows Redlock is unnecessary for efficiency locks (which ours are) and insufficient for true correctness locks without fencing tokens ([Martin Kleppmann](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)). A single Redis instance with TTL is simpler and adequate. |
| **async-lock (npm)** | In-process async mutex for Node.js. Key-based locking with timeout and queuing ([npm - async-lock](https://www.npmjs.com/package/async-lock)). | **Partial fit.** Useful for protecting server-side lock table operations from race conditions within a single process, but does not solve distributed state. |
| **ZooKeeper / etcd** | Consensus-based distributed coordination. Provides sequential ephemeral nodes for fair distributed locks ([Martin Kleppmann](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)). | **Overkill.** Significant operational complexity. Only justified if we need correctness-critical distributed locks, which we do not. |
| **Socket.IO Adapter (Redis)** | `@socket.io/redis-adapter` for multi-server Socket.IO. Does not provide locking but enables broadcasting across server instances ([Socket.IO Docs](https://socket.io/docs/v4/)). | **Complementary.** Needed for multi-server Socket.IO regardless of lock implementation. Pairs naturally with Redis-based locks. |

**Recommendation**: Start with **in-memory locks** for single-server deployment. When we scale horizontally, migrate to **single Redis instance** with `SET NX PX` for lock state and `@socket.io/redis-adapter` for cross-server event broadcasting. Avoid Redlock and consensus systems.

### 7. Hybrid Approach: Partial Access to Locked Cards

Not all interactions with a card require exclusive editing access. A hybrid model allows certain non-destructive actions without acquiring the lock:

| Action | Requires Lock? | Rationale |
|---|---|---|
| **Editing card content** | Yes | Core structural edit. Must be exclusive. |
| **Configuring card settings** | Yes | Changes card behavior/display. |
| **Deleting a card** | Yes | Destructive action. Lock prevents deleting while another user is mid-edit. |
| **Moving/reordering a card** | No (server-authoritative) | Card position is session-level state, not card-internal state. Server resolves ordering conflicts. |
| **Viewing card content** | No | Read-only access is always available. |
| **Adding a comment/note** | No | Comments are append-only and don't modify card content. Similar to Google Docs' comment-on-locked-content pattern ([Microsoft Word - Comments on protected documents](https://wordribbon.tips.net/T006044_Allowing_Only_Comments_In_a_Document.html)). |
| **Copying card content** | No | Read operation. |
| **Pinning/flagging a card** | No | Metadata annotation, not content edit. |
| **Requesting AI action on card** | Yes (AI acquires lock) | AI will modify content. Lock acquired on behalf of AI. |

This hybrid model reduces lock contention significantly. Most casual interactions (reading, commenting, bookmarking) work freely. Only structural edits to card content require exclusive access.

**Implementation**: The server validates the action type on each mutation. Lock-required actions check the lock table; lock-free actions bypass it. The client UI reflects this by keeping comment/annotation controls enabled even on locked cards, while disabling edit/delete controls.

## Conclusions

### Architecture Decision

1. **Use pessimistic card-level locking** with server-authoritative lock state, communicated via Socket.IO events. This is the right level of complexity for discrete-card collaboration where conflicts must be prevented, not resolved.

2. **Lock protocol**: Request/grant/deny/release events over Socket.IO. Server maintains an in-memory lock table (single server) or Redis-backed lock table (multi-server). Locks have a 30-second TTL for users (60 seconds for AI), renewed every 10 seconds via heartbeat.

3. **Disconnect handling**: Three-layer defense -- `beforeunload` release, Socket.IO `disconnect` cleanup, and TTL expiry as ultimate fallback. Client reconciles lock state on reconnection.

4. **UX**: Avatar badge on locked cards showing the holder's identity, disabled edit controls, tooltip with details, and inline toast on denied lock attempts. No modal dialogs for lock denial.

5. **AI locks**: AI acquires locks during streaming. Users can interrupt via "Stop generating" button, which aborts the stream, saves partial content, and transfers the lock atomically.

6. **Single lock per user**: One card lock at a time per human user. Switching cards auto-releases the previous lock. AI may hold multiple concurrent locks.

7. **Hybrid access**: Comments, viewing, and metadata annotations do not require locks. Only content edits, configuration changes, and deletions require exclusive access.

8. **Build our own**: In-memory lock table for v1. Migrate to Redis `SET NX PX` when horizontally scaling. No need for Redlock or consensus systems.

### Migration Path

| Phase | Lock Storage | Socket.IO | When |
|---|---|---|---|
| **v1 (single server)** | In-memory `Map` | Single server | MVP |
| **v2 (horizontal scale)** | Redis `SET NX PX` | `@socket.io/redis-adapter` | When session concurrency exceeds single-server capacity |

## Sources

- [Marmelab - Real-Time Resource Locking Using WebSockets and Navigation](https://marmelab.com/blog/2017/09/13/real-time-resource-locking-using-socketio-and-react-router.html)
- [Redis Docs - Distributed Locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)
- [Martin Kleppmann - How to Do Distributed Locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
- [Figma Blog - How Figma's Multiplayer Technology Works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- [Figma Blog - Making Multiplayer More Reliable](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- [Google Drive Blog - Conflict Resolution in Google Docs](https://drive.googleblog.com/2010/09/whats-different-about-new-google-docs_22.html)
- [Notion Help Center - Collaborate in a Workspace](https://www.notion.com/help/collaborate-within-a-workspace)
- [Miro Help Center - Locking Content on the Board](https://help.miro.com/hc/en-us/articles/4408887253778-Locking-content-on-the-board)
- [Atlassian Community - Trello Simultaneous Editing](https://community.atlassian.com/forums/Trello-questions/Simultaneous-editing-by-two-different-users/qaq-p/1301697)
- [Atlassian - Confluence Collaborative Editing](https://developer.atlassian.com/cloud/confluence/collaborative-editing/)
- [Atlassian - Confluence Concurrent Editing and Merging](https://confluence.atlassian.com/doc/concurrent-editing-and-merging-changes-144719.html)
- [Seibert Group - Edit Lock for Confluence](https://seibert.group/blog/en/edit-lock-for-confluence-better-protection-against-simultaneous-editing-of-confluence-pages/)
- [Socket.IO Docs - How It Works](https://socket.io/docs/v4/how-it-works/)
- [Socket.IO Docs - Server Options](https://socket.io/docs/v4/server-options/)
- [Socket.IO Issue #3507 - Ping Timeout in Background Tabs](https://github.com/socketio/socket.io/issues/3507)
- [Socket.IO Issue #5135 - Heartbeat Detection Delayed](https://github.com/socketio/socket.io/issues/5135)
- [Ably - Collaborative UX Best Practices](https://ably.com/blog/collaborative-ux-best-practices)
- [GitHub - Nextcloud files_lock #157 - Lock Icon UX](https://github.com/nextcloud/files_lock/issues/157)
- [Vercel AI SDK - Stopping Streams](https://ai-sdk.dev/docs/advanced/stopping-streams)
- [Vercel AI SDK - Chatbot Resume Streams](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams)
- [GitHub - BookStackApp/BookStack #395 - Collaborative Editing Locking Discussion](https://github.com/BookStackApp/BookStack/issues/395)
- [npm - redlock](https://www.npmjs.com/package/redlock)
- [GitHub - mike-marcacci/node-redlock](https://github.com/mike-marcacci/node-redlock)
- [npm - async-lock](https://www.npmjs.com/package/async-lock)
- [AWS Blog - Building Distributed Locks with DynamoDB Lock Client](https://aws.amazon.com/blogs/database/building-distributed-locks-with-the-dynamodb-lock-client/)
- [GitHub - DynamoDB Lock Client - Heartbeat vs Lease Duration](https://github.com/awslabs/amazon-dynamodb-lock-client/issues/34)
- [Medium - Abhirup Acharya - Optimistic vs Pessimistic Locking](https://medium.com/@abhirup.acharya009/managing-concurrent-access-optimistic-locking-vs-pessimistic-locking-0f6a64294db7)
- [Vlad Mihalcea - Optimistic vs Pessimistic Locking](https://vladmihalcea.com/optimistic-vs-pessimistic-locking/)
- [ByteByteGo - Pessimistic vs Optimistic Locking](https://bytebytego.com/guides/pessimistic-vs-optimistic-locking/)
- [Modern Treasury - Pessimistic vs Optimistic Locking](https://www.moderntreasury.com/learn/pessimistic-locking-vs-optimistic-locking)
- [Wikipedia - Optimistic Concurrency Control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
- [Jenkov - Starvation and Fairness](https://jenkov.com/tutorials/java-concurrency/starvation-and-fairness.html)
- [Inery - Optimistic vs Pessimistic Locking](https://inery.io/blog/article/optimistic-vs-pessimistic-locking-difference-and-best-use-cases/)
- [OneUptime - WebSocket Scaling with Redis Pub/Sub](https://oneuptime.com/blog/post/2026-01-24-websocket-scaling-redis-pubsub/view)
- [DEV Community - Scaling WebSockets with Redis Pub/Sub and Socket.IO Adapter](https://dev.to/myougatheaxo/scaling-websockets-with-claude-code-redis-pubsub-and-socketio-adapter-2026-03-11-5666)
- [Microsoft Word - Allowing Only Comments in a Document](https://wordribbon.tips.net/T006044_Allowing_Only_Comments_In_a_Document.html)
- [Google ADK - Intro to Streaming](https://google.github.io/adk-docs/streaming/dev-guide/part1/)
- [LangChain - Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
