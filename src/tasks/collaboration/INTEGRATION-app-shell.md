# Integration: app-shell -> collaboration

## Imports Required

### Environment Configuration
- **`getWsUrl()`** from `src/common/utils/env.ts` -- the Socket.IO client connects to the WebSocket server URL configured via `VITE_WS_URL`; this is the primary integration point for establishing the real-time connection
- **`getApiBaseUrl()`** from `src/common/utils/env.ts` -- fallback or supplementary REST endpoints for session state snapshots

### Auth Context
- **`authStore.token`** from `src/common/stores/authStore.ts` -- the Socket.IO `connect` event sends the auth token for server-side authentication; the token is required for room membership and lock operations
- **`authStore.isAuthenticated`** -- the Socket.IO client must not attempt connection when unauthenticated; connect only after auth is confirmed

### Session Context
- **`sessionStore.activeSessionId`** -- the collaboration domain uses the active session ID to:
  - Join the correct Socket.IO room (`session:join { sessionId }`)
  - Leave the room on session change (`session:leave { sessionId }`)
  - Scope all collaboration events (presence, locks, card mutations) to the active session
- **`useSession(sessionId)`** hook -- provides session metadata (member list) for presence initialization

### Layout Slots
- **Header region** -- presence indicators (participant avatars with online/idle/offline status) render in the session header area alongside the existing `SessionHeader` component
- **Card header** -- small avatars of users focused on a card render in each card's header; the card domain provides the slot, but the data comes from the collaboration domain's presence store
- The collaboration domain must integrate its presence UI into existing app-shell layout components without altering their structure

### Provider Infrastructure
- **TanStack Query** `QueryClientProvider` -- the collaboration domain uses TanStack Query for:
  - Initial session state snapshot fetch on join/reconnect
  - Cache invalidation when server-authoritative state broadcasts arrive (e.g., `card:created` invalidates card list cache)
- **LazyMotionProvider** -- presence indicator animations (avatar appear/disappear transitions) require Motion in the provider tree

### Route Guards
- **`RequireAuth`** -- the collaboration domain operates only within authenticated routes; Socket.IO connection lifecycle is tied to the authenticated session view at `/session/:id`
- **`RequireSession`** -- validates that the session exists before the collaboration domain attempts to join a Socket.IO room

### MSW / Mock Infrastructure
- MSW does not directly mock Socket.IO (WebSocket transport), but the collaboration domain uses the MSW test infrastructure pattern from app-shell (Vitest setup, `src/test/setup.ts`) for unit testing collaboration stores and handlers
- The collaboration domain may add custom MSW handlers for REST fallback endpoints (e.g., session state snapshot)

## Acceptance Criteria

1. Socket.IO client reads `VITE_WS_URL` via `getWsUrl()` for the server connection URL
2. Socket.IO `connect` event includes the auth token from `authStore.token`
3. Socket.IO client does not attempt connection when `authStore.isAuthenticated` is false
4. Socket.IO room join uses `activeSessionId` from the session store
5. Changing `activeSessionId` triggers `session:leave` on the old session and `session:join` on the new session
6. Presence indicators render in the Header region without breaking the 56px height constraint
7. Participant avatars in card headers use data from the collaboration presence store
8. Server-authoritative state broadcasts (`card:created`, `card:updated`, `card:deleted`) invalidate the appropriate TanStack Query caches
9. Collaboration domain only activates within `RequireAuth` + `RequireSession` guarded routes
10. Collaboration tests use the Vitest + MSW test setup from app-shell (`src/test/setup.ts`)
