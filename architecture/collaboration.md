# Collaboration

Real-time multi-user sessions over Socket.IO with server-authoritative state, presence awareness, and card-level pessimistic locking.

**Research:** [RSH-004](research/rsh-004-realtime-collaboration.md) (Socket.IO), [RSH-013](research/rsh-013-card-locking.md) (card locking)

---

## 1. Connection Lifecycle

Socket.IO manages transport, reconnection, and room membership. The server is the single source of truth.

| Event | Direction | Payload | Behavior |
|-------|-----------|---------|----------|
| `connect` | Client -> Server | Auth token | Server authenticates, adds client to session room, sends full state snapshot |
| `disconnect` | Server detects | `socketId` | Release all locks held by this socket, broadcast presence update |
| `reconnect` | Client -> Server | Auth token, `sessionId` | Re-join room, receive fresh state snapshot (cards, locks, presence) |

### Reconnection behavior

- Socket.IO handles transport-level reconnection automatically (exponential backoff).
- On successful reconnect, the client requests a full state snapshot and reconciles local state.
- Any locks the user held before disconnect will have expired (TTL) or been cleaned up (disconnect event). The client must re-acquire locks explicitly.

---

## 2. Session Rooms

Each session maps to one Socket.IO room. All participants (human and AI) join the same room.

| Event | Direction | Payload | Behavior |
|-------|-----------|---------|----------|
| `session:join` | Client -> Server | `{ sessionId }` | Server adds socket to room, broadcasts `session:member:joined` |
| `session:leave` | Client -> Server | `{ sessionId }` | Server removes socket from room, releases locks, broadcasts `session:member:left` |
| `session:state` | Server -> Client | Full session snapshot | Sent on join/reconnect: cards, locks, presence, chat history |

---

## 3. Server-Authoritative State Broadcast

Clients never mutate state directly. All mutations flow through the server.

```
Client sends operation -> Server validates -> Server persists -> Server broadcasts result to room
```

| Event | Direction | Payload | Notes |
|-------|-----------|---------|-------|
| `card:create` | Client -> Server | Card data | Server assigns ID, persists, broadcasts `card:created` |
| `card:update` | Client -> Server | `{ cardId, changes }` | Server validates lock ownership, persists, broadcasts `card:updated` |
| `card:delete` | Client -> Server | `{ cardId }` | Server validates lock ownership, persists, broadcasts `card:deleted` |
| `chat:send` | Client -> Server | `{ message }` | Server assigns sequence number, persists, broadcasts `chat:message` |
| `card:reorder` | Client -> Server | `{ cardId, position }` | Lock-free. Server resolves ordering, broadcasts `card:reordered` |

On rejection (e.g., stale lock, invalid data), the server sends an error event and the client reverts optimistic UI.

---

## 4. Presence System

Tracks who is online and what they are focused on. Updated in real time.

### Presence state per participant

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Unique user identifier |
| `displayName` | string | Shown in participant list and avatars |
| `avatarUrl` | string | User profile image |
| `status` | `'online' \| 'idle' \| 'offline'` | Connection status |
| `focusedCardId` | string or null | Card the user is currently viewing/editing |
| `role` | `'human' \| 'ai'` | Participant type |

### Presence events

| Event | Direction | Payload | Behavior |
|-------|-----------|---------|----------|
| `presence:update` | Client -> Server | `{ focusedCardId }` | Client reports focus changes (card click, scroll into view) |
| `presence:sync` | Server -> Room | `{ participants: PresenceState[] }` | Full presence state broadcast on any change |

### Presence indicators

| Location | What is shown |
|----------|---------------|
| Session participant list | Avatar, name, online/idle/offline status, which card is focused |
| Card header | Small avatars of users currently focused on that card |
| Cursor/focus | Colored ring around focused card matching the user's assigned color |

---

## 5. Card-Level Pessimistic Locking

One user edits a card at a time. Locks are leased, heartbeat-renewed, and auto-released on disconnect.

### Lock parameters

| Parameter | Human | AI | Rationale |
|-----------|-------|----|-----------|
| Lease TTL | 30 seconds | 60 seconds | AI streaming takes longer |
| Heartbeat interval | 10 seconds | 10 seconds | ~1/3 of lease duration |
| Server sweep interval | 5 seconds | 5 seconds | Checks for expired locks |
| Max locks per user | 1 | Multiple | Humans focus on one card; AI may parallelize |

### Lock protocol

| Event | Direction | Payload | Behavior |
|-------|-----------|---------|----------|
| `card:lock:request` | Client -> Server | `{ cardId }` | If free: grant. If held by same user: refresh. If held by other: deny with holder info. |
| `card:lock:granted` | Server -> Client | `{ cardId, holder }` | Lock confirmed. Client enables edit controls. |
| `card:lock:denied` | Server -> Client | `{ cardId, holder, reason }` | Lock refused. Client shows inline toast. |
| `card:lock:release` | Client -> Server | `{ cardId }` | Server verifies ownership, releases, broadcasts. |
| `card:lock:released` | Server -> Room | `{ cardId }` | Card now available for editing. |
| `card:lock:heartbeat` | Client -> Server | `{ cardId }` | Resets TTL. Server ignores if sender does not hold the lock. |
| `card:lock:state` | Server -> Client | `{ locks: LockEntry[] }` | Full lock table sent on connect/reconnect. |

### Auto-release on card switch

When a human user requests a lock on card B while holding a lock on card A, the server atomically releases A and grants B. No explicit release needed from the client.

### Three-layer disconnect defense

| Layer | Trigger | Timing | Reliability |
|-------|---------|--------|-------------|
| 1. `beforeunload` | Tab/window close | Immediate | Best-effort; not guaranteed by browsers |
| 2. Socket.IO `disconnect` | Connection drop detected | Immediate to ~45s (pingInterval + pingTimeout) | Reliable for clean disconnects; delayed for crashes/network loss |
| 3. TTL expiry | Server sweep finds expired lease | Within sweep interval (5s) after TTL | Guaranteed; ultimate safety net |

### Network partition recovery

On reconnect, the client requests `card:lock:state`. If a previously held lock was lost:
1. Card transitions to read-only.
2. Toast notification: "Connection interrupted. Your lock on [Card] was released."
3. Unsaved edits preserved locally; user prompted to re-acquire and apply.

---

## 6. Lock UX

| Element | Behavior |
|---------|----------|
| **Avatar badge** | Lock holder's avatar (or AI icon) shown in card top-right corner with colored ring |
| **Disabled controls** | Edit, configure, and delete controls greyed out on locked cards; card content remains fully readable |
| **Tooltip on avatar** | Hover shows "Being edited by [Name]" or "AI is generating..." |
| **Denied click** | Clicking a disabled edit control shows inline toast: "This card is being edited by [Name]." No modal. |
| **Participant list** | Shows which card each user is actively editing |

---

## 7. Lock Scope

| Action | Lock required? | Rationale |
|--------|---------------|-----------|
| Edit card content | Yes | Core structural mutation |
| Configure card settings | Yes | Changes card behavior/display |
| Delete card | Yes | Destructive; prevents deleting while another user edits |
| Request AI action on card | Yes (AI acquires) | AI will modify content |
| View card content | No | Read-only always available |
| Add comment/note | No | Append-only; does not modify card content |
| Copy card content | No | Read operation |
| Pin/flag card | No | Metadata annotation |
| Move/reorder card | No | Session-level positioning; server resolves conflicts |

---

## 8. AI Participant

The AI connects as a standard Socket.IO client, symmetric with human participants. It appears in the presence list, holds locks, and sends operations through the same protocol.

### AI lock lifecycle

| Phase | Behavior |
|-------|----------|
| Acquisition | Server acquires lock on behalf of AI when card generation starts. AI avatar appears on card. |
| During streaming | AI backend sends heartbeats every 10s. Card shows streaming indicator + AI avatar. |
| Completion | AI releases lock. Card becomes editable. |
| Error/timeout | Lock expires via standard TTL (60s). |

### Preemption: "Stop generating"

Users can interrupt AI mid-stream and take over the card.

| Step | What happens |
|------|-------------|
| 1 | User clicks "Stop generating" on the AI-locked card |
| 2 | Client sends `card:lock:preempt` with `{ cardId }` |
| 3 | Server sends abort signal to AI backend |
| 4 | Server saves partial AI response to card state |
| 5 | Server releases AI lock, grants lock to requesting user |
| 6 | Server broadcasts lock state change to room |

Single click, no confirmation modal. Partial content is preserved. Mirrors the stop pattern in ChatGPT/Claude.

---

## 9. Note Cards

Note cards are a collaboration primitive. Any participant can create a note card to provide context, ask questions, or leave instructions visible to all session members.

| Property | Detail |
|----------|--------|
| Type | `note` (same card model as other types) |
| Lock behavior | Same as other cards: lock to edit, lock-free to view/comment |
| Visibility | Visible to all session participants |
| Persistence | Persisted with the session |
| Use cases | Collaboration context ("I'm investigating X"), questions, instructions for AI |

---

## 10. State Management Integration

| Concern | Approach |
|---------|----------|
| Socket events -> UI | Socket.IO event handlers call Zustand `setState` directly (outside React) |
| Lock state | Zustand store slice: `Map<cardId, LockEntry>` |
| Presence state | Zustand store slice: `Map<userId, PresenceState>` |
| Optimistic UI | Client applies optimistic update on send; reverts on server rejection |
| Token buffering | Not applicable (collaboration events are discrete, not streaming tokens) |

---

## 11. Scaling Path

| Phase | Lock storage | Socket.IO transport | Trigger |
|-------|-------------|---------------------|---------|
| v1 | In-memory `Map` | Single server | MVP |
| v2 | Redis `SET NX PX` | `@socket.io/redis-adapter` | Session concurrency exceeds single-server capacity |

Redlock and consensus systems (ZooKeeper, etcd) are not needed. Single Redis instance with TTL is sufficient for card-level efficiency locks.
