# Task 01: Vite 8 Project Scaffold + Config

**ID:** app-shell/01
**Status:** pending
**Deps:** design-system (theme contract + primitives must exist)

## Context

This is the foundation task for the entire app-shell domain. It creates the Vite 8 project using the `react-ts` template with Rolldown as the bundler (Vite 8 default), configures TypeScript strict mode with bundler module resolution, sets up path aliases (`@/` -> `src/`), and adds the required Vite plugins for vanilla-extract and SVGR. The directory structure from app-shell.md section 1 is established here.

## Implementation Requirements

### Files to Create/Modify

1. **`vite.config.ts`** (~60 lines)
   - Import and register `@vanilla-extract/vite-plugin` and `vite-plugin-svgr`
   - Configure `resolve.alias` so `@/` maps to `src/`
   - Configure `server.proxy` to forward `/api/*` to backend URL
   - Set dev server port to 5173

2. **`tsconfig.json`** (~40 lines)
   - Enable strict mode
   - Set `"moduleResolution": "bundler"`
   - Add path alias `"@/*": ["./src/*"]`
   - Extend from Vite's recommended tsconfig if available

3. **Directory structure** (empty `index.ts` barrel files where needed)
   - `src/app/` -- App.tsx, routes.tsx, providers.tsx (stubs)
   - `src/features/sessions/` -- placeholder
   - `src/common/api/`, `src/common/components/`, `src/common/hooks/`, `src/common/stores/`, `src/common/utils/`
   - `src/mocks/` -- placeholder
   - `src/generated/` -- add to `.gitignore`
   - `src/test/` -- placeholder

4. **`src/main.tsx`** (~15 lines)
   - Minimal entry point: imports React, renders a placeholder `<App />` into `#root`
   - MSW bootstrap will be added in task 09

5. **`index.html`** (~15 lines)
   - Standard Vite HTML entry referencing `src/main.tsx`
   - `<div id="root">` mount point

6. **`.gitignore`** additions
   - `src/generated/` directory

### Package Dependencies

Add to `package.json` (the Vite scaffold provides React + Vite):
- `@vanilla-extract/vite-plugin`
- `vite-plugin-svgr`
- `@vanilla-extract/css` (peer of the plugin)

## Demo Reference

No specific demo vignette. This is infrastructure scaffolding.

## Integration Proofs

```bash
# 1. Vite version is 8.x
npx vite --version

# 2. Dev server starts and responds
npm run dev &
curl -s http://localhost:5173/ | grep -q 'root'

# 3. TypeScript compiles with zero errors
npx tsc --noEmit

# 4. Path alias resolves (import something from @/ in a test file)
npx vitest run --reporter=verbose 2>&1 | grep -q 'PASS\|no test'

# 5. Build succeeds
npm run build
ls dist/index.html
```

## Acceptance Criteria

- [ ] `npx vite --version` outputs a 8.x version
- [ ] `npm run dev` starts dev server on port 5173 without errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `@/` path alias resolves in imports (verified by a trivial import in main.tsx)
- [ ] `npm run build` produces `dist/index.html`
- [ ] `src/generated/` is listed in `.gitignore`
- [ ] Directory structure matches app-shell.md section 1
- [ ] vanilla-extract plugin is registered and functional (a `.css.ts` file compiles)
- [ ] SVGR plugin is registered (an SVG import as component compiles)

## Anti-Patterns

- Do NOT use Create React App -- it is deprecated
- Do NOT use framework mode for React Router (no file-based routing)
- Do NOT install Material-UI -- this project uses vanilla-extract + custom primitives
- Do NOT add application logic here -- this task is purely scaffolding
- Do NOT hardcode backend URLs in vite.config.ts -- those go in env files (task 02)
