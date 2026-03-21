# Task 07: OpenAPI Spec Authoring (Sessions API)

**ID:** app-shell/07
**Status:** pending
**Deps:** (none)

## Context

This task creates the OpenAPI 3.1 specification for the sessions API defined in app-shell.md section 4. The spec is the single source of truth for Orval code generation (task 08) and Spectral linting. It defines all 7 session endpoints, the Session and User models, and standard error responses. This task has no code dependencies and can be worked on in parallel with task 01.

## Implementation Requirements

### Files to Create

1. **`src/api/openapi.yaml`** (~250 lines)
   - OpenAPI version: `3.1.0`
   - Info: title "The Helm API", version "0.1.0"
   - Servers: `[{ url: "/api", description: "Proxied backend" }]`
   - Paths (from app-shell.md section 4):
     - `GET /api/sessions` -- List sessions for current user -> `Session[]`
     - `POST /api/sessions` -- Create a new session -> `Session`
     - `GET /api/sessions/{id}` -- Get session by ID -> `Session`
     - `PATCH /api/sessions/{id}` -- Update session (title, status) -> `Session`
     - `DELETE /api/sessions/{id}` -- Delete session -> `204`
     - `POST /api/sessions/{id}/join` -- Join a session via invite -> `Session`
     - `GET /api/sessions/{id}/members` -- List session members -> `User[]`
   - Components/Schemas:
     - `Session`: id (uuid), title (string), createdAt (date-time), updatedAt (date-time), ownerId (string), memberIds (string[]), status (enum: active, archived)
     - `User`: id (string), displayName (string), avatarUrl (string, nullable)
     - `CreateSessionRequest`: title (string, required)
     - `UpdateSessionRequest`: title (string, optional), status (enum, optional)
     - `Error`: message (string), code (string)
   - Security: Bearer token auth scheme
   - Standard error responses: 400, 401, 403, 404, 500

2. **`.spectral.yaml`** (~15 lines)
   - Extend `spectral:oas` default ruleset
   - Enable recommended rules
   - Add custom rule: `operation-operationId` (require operationId on all operations)

3. **`package.json`** script addition
   - `"lint:api": "spectral lint src/api/openapi.yaml"`

### Package Dependencies

- `@stoplight/spectral-cli` (devDependency)

## Demo Reference

Acceptance criterion 10 from app-shell.md: "Spectral lints the OpenAPI spec with zero errors in CI"

## Integration Proofs

```bash
# 1. Spectral lint passes with zero errors
npx spectral lint src/api/openapi.yaml

# 2. YAML is valid (parseable)
node -e "require('yaml').parse(require('fs').readFileSync('src/api/openapi.yaml','utf8'))"

# 3. All 7 endpoints are defined
grep -c 'operationId:' src/api/openapi.yaml
# Should output 7

# 4. Session schema has all required fields
grep 'id:' src/api/openapi.yaml
grep 'title:' src/api/openapi.yaml
grep 'createdAt:' src/api/openapi.yaml
grep 'ownerId:' src/api/openapi.yaml
grep 'memberIds:' src/api/openapi.yaml
grep 'status:' src/api/openapi.yaml
```

## Acceptance Criteria

- [ ] `src/api/openapi.yaml` exists and is valid OpenAPI 3.1.0
- [ ] All 7 session endpoints from app-shell.md section 4 are defined
- [ ] `Session` schema has all 7 fields (id, title, createdAt, updatedAt, ownerId, memberIds, status)
- [ ] `User` schema has id, displayName, avatarUrl
- [ ] Request body schemas exist for create and update operations
- [ ] Error response schemas defined for 400, 401, 403, 404, 500
- [ ] Bearer token security scheme is defined
- [ ] Every operation has an `operationId`
- [ ] `npx spectral lint src/api/openapi.yaml` passes with zero errors
- [ ] `.spectral.yaml` config file exists

## Anti-Patterns

- Do NOT use OpenAPI 3.0 -- use 3.1.0 (required for Orval Zod schema generation)
- Do NOT define endpoints for other domains (cards, collaboration, etc.) -- only sessions
- Do NOT use `$ref` to external files -- keep the spec in a single file for simplicity
- Do NOT omit operationId -- Orval uses it to generate function names
- Do NOT use generic names like `getData` -- use descriptive operationIds like `listSessions`, `createSession`
