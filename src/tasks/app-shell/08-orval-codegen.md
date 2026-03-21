# Task 08: Orval Config + Code Generation Pipeline

**ID:** app-shell/08
**Status:** pending
**Deps:** app-shell/07, app-shell/01

## Context

This task configures Orval to generate TypeScript types, TanStack Query v5 hooks, Zod validation schemas, and MSW v2 mock handlers from the OpenAPI spec created in task 07. The generated code lands in `src/generated/api/` (gitignored). This is the bridge between the API contract and the application code -- all downstream API integration uses the generated types and hooks rather than hand-written fetch calls.

## Implementation Requirements

### Files to Create/Modify

1. **`orval.config.ts`** (~50 lines)
   - Input: `src/api/openapi.yaml`
   - Output target: `src/generated/api/`
   - Client: `fetch` (not axios)
   - Hooks: TanStack Query v5
   - Mock generation: `mock: true` (uses Faker.js for realistic data)
   - Zod schemas: enabled
   - Override base URL: `import.meta.env.VITE_API_BASE_URL`
   - Operation naming: use `operationId` from spec
   - File naming: kebab-case

2. **`package.json`** script additions
   - `"generate:api": "orval"`
   - `"predev": "orval"` (optional, regenerate before dev server)

3. **`src/generated/.gitignore`** (~3 lines)
   - Ignore everything in generated except the .gitignore itself
   - `*`, `!.gitignore`

4. **Verify generated output structure** (after running `orval`):
   - `src/generated/api/sessions.ts` -- types + query hooks
   - `src/generated/api/sessions.zod.ts` -- Zod schemas
   - `src/generated/api/sessions.msw.ts` -- MSW handlers
   - `src/generated/api/model/` -- TypeScript interfaces

### Package Dependencies

- `orval` (devDependency)
- `@faker-js/faker` (devDependency, used by generated mocks)
- `zod` (dependency, used by generated schemas)
- `@tanstack/react-query` (already added in task 02)

## Demo Reference

Acceptance criterion 6 from app-shell.md: "`npm run generate:api` produces types, hooks, and MSW handlers from `openapi.yaml`"

## Integration Proofs

```bash
# 1. Orval generates without errors
npm run generate:api

# 2. Generated files exist
ls src/generated/api/

# 3. Generated TypeScript compiles
npx tsc --noEmit

# 4. Generated types match the Session model
grep 'interface Session' src/generated/api/model/session.ts

# 5. MSW handlers are generated
grep 'http.get' src/generated/api/sessions.msw.ts

# 6. Zod schemas are generated
grep 'z.object' src/generated/api/sessions.zod.ts
```

## Acceptance Criteria

- [ ] `orval.config.ts` exists with correct input/output/client configuration
- [ ] `npm run generate:api` runs successfully and produces files in `src/generated/api/`
- [ ] Generated types match the Session and User models from the OpenAPI spec
- [ ] Generated TanStack Query hooks exist for all 7 endpoints
- [ ] Generated Zod schemas exist for request/response validation
- [ ] Generated MSW handlers exist for all 7 endpoints with Faker.js data
- [ ] Generated code compiles with `npx tsc --noEmit`
- [ ] `src/generated/` is gitignored (files not committed)
- [ ] Base URL uses `import.meta.env.VITE_API_BASE_URL`

## Anti-Patterns

- Do NOT hand-write API types -- they must come from Orval generation
- Do NOT use axios -- use the `fetch` client option
- Do NOT commit generated files -- they are regenerated from the spec
- Do NOT modify generated files directly -- use Orval overrides or custom wrappers
- Do NOT import from `src/generated/` paths directly in feature code -- task 10 creates wrapper hooks
