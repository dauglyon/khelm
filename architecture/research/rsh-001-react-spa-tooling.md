# RSH-001: React SPA Tooling Choices for The Helm

**Date:** 2026-03-21 | **Status:** Completed

## Question

What are the optimal technology choices for build tooling, state management, masonry layout, and styling for The Helm -- a scientific exploration interface built as a React SPA with masonry card grids, streaming LLM responses, WebSocket collaboration, and animation-heavy UI?

## Context

The Helm is a React single-page application with the following technical requirements:

- **Masonry card grid** as the primary UI surface (10-50 cards per session)
- **Streaming LLM responses** that update card content in real-time via token streams
- **Collaboration** via WebSocket for multi-user sessions
- **Animation-heavy UI** using Motion (formerly Framer Motion) for card reflow, transitions, and layout changes
- **Custom design tokens** defined in `architecture/README.md` (specific colors, typography, easing curves)
- **No SSR needed** -- pure client-side SPA deployed as static assets
- **Currently migrating from CRA** (Create React App, officially deprecated Feb 2025)

---

## Findings

### 1. Build Tooling: Vite vs Next.js vs Remix/React Router 7 vs CRA

#### Current Versions & Maintenance Status

| Tool | Current Version | Release Date | Maintenance Status | GitHub Stars | npm Weekly Downloads |
|------|----------------|-------------|-------------------|-------------|---------------------|
| **Vite** | 8.0.x | Mar 2026 | Active (VoidZero-backed, weekly patches) | 72.5k | ~52M |
| **Next.js** | 16.2 | Mar 2026 | Active (Vercel-backed) | 138k | ~28M |
| **React Router 7** | 7.13.1 | Feb 2026 | Active (Shopify-backed via Remix) | -- | -- |
| **CRA** | 5.x (maintenance) | Feb 2025 (sunset) | **Deprecated** -- no active maintainers | -- | declining |

Sources: [Vite releases](https://vite.dev/releases), [Next.js 16.2 blog](https://nextjs.org/blog/next-16-2), [React Router npm](https://www.npmjs.com/package/react-router), [CRA sunset announcement](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)

#### Build Speed Benchmarks (Vite 8 with Rolldown)

| Metric | Vite 8 (Rolldown) | Vite 7 (Rollup) | Next.js 16 | Notes |
|--------|-------------------|-----------------|------------|-------|
| Dev server cold start | <1s | 1-2s | 5s+ (large projects) | Vite uses native ESM |
| Production build (small SPA) | **0.8s** | 3.8s | -- | 5x improvement (real project) |
| Production build (large app) | **6s** | 46s (est.) | -- | Linear.app benchmark |
| Synthetic 19k modules | **1.61s** | 40.10s | -- | 25x improvement |
| HMR | <50ms | <100ms | ~200ms | Vite uses native ESM hot updates |

Sources: [Peterbe.com Vite 8 benchmark](https://www.peterbe.com/plog/vite-8-is-5x-faster), [Vite 8 announcement](https://vite.dev/blog/announcing-vite8), [The Register Vite 8 Rolldown](https://www.theregister.com/2026/03/16/vite_8_rolldown/)

#### SPA Suitability Comparison

| Criterion | Vite | Next.js | React Router 7 | CRA |
|-----------|------|---------|----------------|-----|
| Pure SPA (no server) | Native -- designed for this | Requires `output: 'export'` config, `ssr: false` per component | SPA mode / library mode | Native |
| Static asset deployment | Yes (S3, Nginx, etc.) | Yes (with static export) | Yes (SPA mode) | Yes |
| SSR/SSG overhead | None | Significant -- must opt out | Optional framework mode | None |
| Plugin ecosystem | 2000+ Rollup/Vite plugins | Next.js-specific | Vite-based in framework mode | Webpack-based (stale) |
| Bundle splitting | Automatic via Rolldown | Automatic | Automatic (framework mode) | Webpack-based |
| React 19 support | Yes | Yes (React Canary/19.2) | Yes | Partial (maintenance only) |
| Config complexity for SPA | Minimal (`vite.config.ts`) | Moderate (must disable SSR features) | Moderate (mode selection) | Zero-config but inflexible |

Sources: [Next.js SPA guide](https://nextjs.org/docs/app/guides/single-page-applications), [Remix SPA mode](https://v2.remix.run/docs/guides/spa-mode/), [Vite getting started](https://vite.dev/guide/)

#### Verdict: Build Tooling

**Vite 8** is the clear choice for a pure SPA. It is purpose-built for client-side apps, has the fastest build times (Rolldown: 10-30x over Rollup), requires zero SSR workarounds, and has the largest plugin ecosystem. Next.js adds significant framework weight that is counterproductive when SSR is not needed. CRA is deprecated and must be migrated away from. React Router 7 is a strong routing solution but as a build tool, it delegates to Vite anyway in framework mode.

---

### 2. State Management: Zustand vs Jotai vs Redux Toolkit vs Valtio

#### Package Comparison

| Library | Version | npm Weekly Downloads | Bundle Size (min+gzip) | Architecture | Created By |
|---------|---------|---------------------|----------------------|--------------|------------|
| **Zustand** | 5.x | **~14M** | **~1.2 KB** | Single store, hooks-based | pmndrs (Poimandres) |
| **Redux Toolkit** | 2.x | ~10M (redux: ~13M) | ~13.8 KB (+react-redux) | Single store, actions/reducers/slices | Redux team (Mark Erikson) |
| **Jotai** | 2.x | ~2.6M | ~2.1 KB | Atomic (bottom-up) | pmndrs (Poimandres) |
| **Valtio** | 2.x | ~1M | ~3.8 KB | Proxy-based mutable | pmndrs (Poimandres) |

Sources: [npm trends comparison](https://npmtrends.com/jotai-vs-recoil-vs-redux-vs-valtio-vs-zustand), [State Management in 2026 (DEV)](https://dev.to/jsgurujobs/state-management-in-2026-zustand-vs-jotai-vs-redux-toolkit-vs-signals-2gge), [Better Stack comparison](https://betterstack.com/community/guides/scaling-nodejs/zustand-vs-redux-toolkit-vs-jotai/)

#### Performance Characteristics

| Metric | Zustand | Redux Toolkit | Jotai | Valtio |
|--------|---------|--------------|-------|--------|
| Memory (1000 subscriptions) | 2.1 MB | 3.2 MB | 1.8 MB | ~2.5 MB |
| Initial parse time | 8ms | 34ms | 9ms | ~12ms |
| Re-render granularity | Selector-based | Selector-based | Atom-level (finest) | Proxy-tracked |
| Boilerplate | Minimal | Moderate (slices, actions) | Minimal | Minimal |
| DevTools | Yes (Redux DevTools) | Yes (native) | Yes (jotai-devtools) | Yes (valtio-devtools) |
| TypeScript DX | Excellent | Excellent | Excellent | Good |

Source: [PkgPulse state management 2026](https://www.pkgpulse.com/blog/react-state-management-2026)

#### Fitness for The Helm's Requirements

| Requirement | Zustand | Redux Toolkit | Jotai | Valtio |
|-------------|---------|--------------|-------|--------|
| **Streaming LLM token updates** | Excellent -- `setState` outside React, batch with `requestAnimationFrame` | Good -- dispatch actions, but middleware overhead per token | Good -- update individual atoms per card | Excellent -- mutate proxy directly, auto-batched |
| **Cross-card references** | Good -- selectors across single store | Good -- selectors across single store | Excellent -- derived atoms compose naturally | Good -- derive from proxy snapshots |
| **WebSocket collaboration** | Excellent -- `subscribe()` outside React, Liveblocks integration exists | Good -- middleware pattern | Good -- atoms can sync externally | Good -- proxy mutations map to patches |
| **Session state (cards)** | Good -- flat normalized store | Good -- `createEntityAdapter` built-in | Good -- dynamic atom creation per card | Good -- mutable array/map |
| **Animation integration** | Neutral | Neutral | Neutral | Neutral |
| **Migration from existing Redux** | Moderate effort | **None (already Redux)** | High effort | Moderate effort |
| **Learning curve** | Low | Moderate (existing knowledge helps) | Low-moderate | Low |

Sources: [Zustand WebSocket discussion](https://github.com/pmndrs/zustand/discussions/1651), [Liveblocks Zustand](https://liveblocks.io/docs/api-reference/liveblocks-zustand), [Streaming backends React re-render control](https://www.sitepoint.com/streaming-backends-react-controlling-re-render-chaos/)

#### Key Pattern: Streaming LLM Updates

For high-frequency token streaming, the recommended architecture is to buffer updates outside React's state system and flush snapshots at display refresh rate:

> "Your network layer should never directly drive React renders. Instead, it buffers incoming data outside React's state system, and a display-synchronized loop flushes snapshots into state at a cadence the renderer can handle." -- [SitePoint, 2025](https://www.sitepoint.com/streaming-backends-react-controlling-re-render-chaos/)

Both Zustand (`getState()`/`setState()` outside React) and Valtio (direct proxy mutation) support this pattern natively. Redux Toolkit requires dispatching actions which adds overhead per token. Jotai atoms can be updated externally via `store.set()`.

#### Verdict: State Management

**Zustand** is recommended as the primary state store. It has the largest community (14M downloads/week), smallest bundle (1.2 KB), excellent streaming update patterns via external `setState`, proven Liveblocks integration for collaboration, and the lowest learning curve. For The Helm's card-centric model, a single Zustand store with normalized card entities and selector-based subscriptions provides the right balance of simplicity and performance.

Jotai is a strong alternative if per-card atom isolation proves valuable for render optimization, but adds complexity in managing atom lifecycles for dynamic card creation/deletion.

---

### 3. Masonry Layout: react-masonry-css vs Masonic vs CSS Grid vs @tanstack/virtual

#### Library Comparison

| Library | Bundle Size | npm Weekly Downloads | Last Updated | Virtualization | Animation Support |
|---------|------------|---------------------|-------------|----------------|-------------------|
| **react-masonry-css** | ~3 KB | ~150k | 5+ years ago | No | Manual (works with Motion `layout`) |
| **Masonic** | ~15 KB | ~50k | 2+ years ago | Yes (red-black interval tree) | Limited (virtualization conflicts with Motion) |
| **@tanstack/react-virtual** | ~10-15 KB | ~9.4M | 5 days ago | Yes (headless) | Limited (virtualization conflicts with Motion) |
| **masonry-grid** | ~1.4 KB | New (2025) | 2025 | No | Works with CSS transforms |
| **CSS native masonry** | 0 KB | N/A | Spec: Mar 2025 | N/A | Native CSS transitions |
| **Custom CSS Grid + Motion** | 0 KB (CSS) | N/A | N/A | No | Full Motion `layout` support |

Sources: [react-masonry-css npm](https://www.npmjs.com/package/react-masonry-css), [Masonic GitHub](https://github.com/jaredLunde/masonic), [@tanstack/react-virtual npm](https://www.npmjs.com/package/@tanstack/react-virtual), [masonry-grid DEV article](https://dev.to/dangreen/masonry-grid-a-14-kb-library-that-actually-works-341n), [CSS Grid Lanes spec](https://developer.chrome.com/blog/masonry-update)

#### CSS Native Masonry Status (as of March 2026)

| Browser | Status | Version |
|---------|--------|---------|
| Safari | Technology Preview 234 | Behind flag |
| Chrome/Edge | Developer testing | Chrome 140+ |
| Firefox | Flag-gated | Firefox 77+ |
| **Production-ready** | **Not yet** | **Estimated Q2-Q3 2026** |

Source: [Chrome masonry update](https://developer.chrome.com/blog/masonry-update), [CSS Grid Lanes Chrome Status](https://chromestatus.com/feature/5149560434589696)

#### Animation Compatibility Analysis

For The Helm, Motion (Framer Motion) `layout` animations are required for card reflow. This creates a critical constraint:

| Approach | Motion `layout` Compatible | Why |
|----------|--------------------------|-----|
| react-masonry-css | **Yes** | Renders all items to DOM; Motion can measure and animate positions |
| Masonic | **No** | Virtualization removes/adds DOM nodes, breaking Motion's FLIP measurement |
| @tanstack/virtual | **No** | Same virtualization conflict |
| CSS Grid + Motion | **Yes** | Motion `layout` works with any CSS-positioned elements |
| masonry-grid | **Partial** | Uses transforms internally which may conflict with Motion transforms |

Source: [Motion layout animations](https://www.framer.com/motion/layout-animations/), [Masonry in React performance](https://medium.com/@colecodes/masonry-in-react-a-performance-hell-fb779f5fcebd)

#### Scale Considerations

With 10-50 cards per session, virtualization is unnecessary:

- 50 DOM nodes is trivial for modern browsers
- Virtualization adds complexity and breaks animation
- The performance bottleneck will be streaming LLM content updates, not layout

#### Verdict: Masonry Layout

**react-masonry-css + Motion `layout`** is the recommended approach for the current card count (10-50). It is lightweight (3 KB), renders all items to the DOM (enabling Motion FLIP animations), and handles responsive column breakpoints via CSS flexbox. No virtualization is needed at this scale.

For progressive enhancement, monitor CSS native masonry (`grid-template-rows: masonry`) adoption. Once browser support reaches production readiness (estimated Q3 2026), consider migrating to native CSS masonry with a `@supports` fallback to react-masonry-css.

**Alternative:** A custom CSS Grid layout with Motion `layoutId` provides more control over card placement and animation choreography if react-masonry-css's column-based distribution proves too rigid.

---

### 4. Styling: CSS Modules vs Tailwind vs vanilla-extract vs styled-components

#### Library Comparison

| Library | npm Weekly Downloads | Bundle Size (runtime) | Zero Runtime | Type Safety | Design Token Support | Status |
|---------|---------------------|----------------------|-------------|-------------|---------------------|--------|
| **Tailwind CSS** | ~17-53M (varies by version) | 0 KB runtime (6-12 KB CSS output) | Yes | No (string-based) | Config-based (`tailwind.config`) | Active (v4.1) |
| **CSS Modules** | Built into bundlers | 0 KB runtime | Yes | Partial (typed-css-modules tooling) | CSS custom properties | Stable standard |
| **vanilla-extract** | ~1.3M | 0 KB runtime | Yes | **Full TypeScript** | First-class (`createTheme`, Sprinkles) | Active (v1.20) |
| **styled-components** | ~9M | **~15-20 KB runtime** | No | Partial (via generics) | ThemeProvider (JS objects) | **Maintenance mode** |

Sources: [Tailwind npm](https://www.npmjs.com/package/tailwindcss), [@vanilla-extract/css npm](https://www.npmjs.com/package/@vanilla-extract/css), [styled-components maintenance mode](https://blogs.utkarshrajput.com/styled-components-fading-out-in-2025), [CSS-in-JS 2025 trends](https://jeffbruchado.com.br/en/blog/css-in-js-2025-tailwind-styled-components-trends)

#### Design Token Fitness

The Helm defines custom design tokens (colors, typography, easing curves) in `architecture/README.md`. Here is how each approach handles them:

| Capability | Tailwind | CSS Modules | vanilla-extract | styled-components |
|-----------|----------|-------------|-----------------|-------------------|
| Custom color palette | `tailwind.config` extend | CSS custom properties | `createTheme()` -- typed | Theme object |
| Custom typography scale | Config theme | CSS custom properties | `createTheme()` -- typed | Theme object |
| Custom easing curves | Config theme extend | CSS custom properties | Style definitions + typed | Theme object |
| Token autocomplete in IDE | Class name suggestions | None (or typed-css-modules) | **Full TS autocomplete** | Partial |
| Token typo detection | None (runtime) | None | **Compile-time error** | None |
| Multiple themes | Multiple configs or CSS vars | CSS custom properties | `createThemeContract()` | Multiple ThemeProviders |
| Vite integration | Built-in (PostCSS) | Built-in | `@vanilla-extract/vite-plugin` | Babel plugin |
| Co-location with components | No (utility classes in JSX) | Adjacent `.module.css` files | Adjacent `.css.ts` files | Inline in component files |

Sources: [vanilla-extract theming](https://vanilla-extract.style/), [Sprinkles API](https://vanilla-extract.style/documentation/sprinkles-api/), [Type-safe design system with vanilla-extract](https://medium.com/@dev-afzalansari/type-safe-design-system-in-react-with-vanilla-extract-d1cc825a3da7), [Tailwind config](https://tailwindcss.com/)

#### Performance Comparison

| Metric | Tailwind | CSS Modules | vanilla-extract | styled-components |
|--------|----------|-------------|-----------------|-------------------|
| Runtime CSS generation | None | None | None | **Yes (impacts streaming perf)** |
| Bundle impact | CSS only (6-12 KB gzipped) | CSS only | CSS only | **15-20 KB JS runtime** |
| Server Component compatible | Yes | Yes | Yes | **No** |
| Dynamic styles (streaming content) | Class toggling | Class toggling | Class toggling + `assignInlineVars` | Template literals (runtime cost) |
| Build-time extraction | Yes (PostCSS) | Yes (bundler) | Yes (esbuild/Vite plugin) | No |

Sources: [React CSS 2026 comparison](https://medium.com/@imranmsa93/react-css-in-2026-best-styling-approaches-compared-d5e99a771753), [Tailwind vs CSS-in-JS 2025](https://medium.com/@vishalthakur2463/styling-at-scale-tailwind-css-vs-css-in-js-in-2025-0e80db15e58c)

#### Verdict: Styling

**vanilla-extract** is recommended for The Helm. Rationale:

1. **Type-safe design tokens**: The Helm's custom color palette, typography scale, and easing curves become TypeScript contracts. Typos are caught at compile time, and IDE autocomplete surfaces all available tokens.
2. **Zero runtime**: Critical for streaming LLM updates -- no style generation overhead during high-frequency card content mutations.
3. **Sprinkles**: Provides a type-safe utility-class-like API (similar to Tailwind) built from the project's own design tokens, without shipping Tailwind's full utility generation pipeline.
4. **Vite integration**: Official `@vanilla-extract/vite-plugin` with Vite 8 support.
5. **Co-located `.css.ts` files**: Styles live next to components, matching the existing feature-based directory structure.

styled-components is eliminated due to maintenance mode status, runtime overhead during streaming, and incompatibility with React Server Components (future-proofing concern). Tailwind is a strong alternative but lacks compile-time token validation -- custom design tokens in a Tailwind config are stringly-typed and silently fail on typos. CSS Modules are viable but lack type safety without additional tooling.

---

## Conclusions

| Category | Recommendation | Runner-Up | Rationale |
|----------|---------------|-----------|-----------|
| **Build Tooling** | **Vite 8** | React Router 7 (library mode) | Purpose-built for SPA, fastest builds (Rolldown), no SSR overhead, CRA migration path |
| **State Management** | **Zustand** | Jotai | Smallest bundle, largest community, external setState for streaming, Liveblocks collab |
| **Masonry Layout** | **react-masonry-css** | Custom CSS Grid | Motion `layout` compatible, no virtualization needed at 10-50 cards, lightweight |
| **Styling** | **vanilla-extract** | Tailwind CSS | Type-safe design tokens, zero runtime, Sprinkles for utility API, Vite plugin |

### Migration Path from Current Stack (CRA + Redux Toolkit + SCSS Modules)

1. **CRA to Vite 8**: Well-documented migration. Replace `react-scripts` with `vite`, add `vite.config.ts`, update `index.html` to reference entry point directly.
2. **Redux Toolkit to Zustand**: Can be done incrementally -- Zustand and Redux can coexist. Migrate slice-by-slice.
3. **SCSS Modules to vanilla-extract**: Can be done incrementally -- `.module.scss` and `.css.ts` files can coexist in Vite. Migrate component-by-component.
4. **Add react-masonry-css**: New UI component, no migration needed -- additive.

---

## Sources

All URLs accessed 2026-03-21 unless otherwise noted.

### Build Tooling
- [Vite Releases](https://vite.dev/releases)
- [Vite 8 Announcement](https://vite.dev/blog/announcing-vite8)
- [Vite 8 is 5x Faster -- Peterbe.com](https://www.peterbe.com/plog/vite-8-is-5x-faster)
- [Vite 8 Rolldown -- The Register](https://www.theregister.com/2026/03/16/vite_8_rolldown/)
- [Vite 8 Rolldown Migration Guide -- byteiota](https://byteiota.com/vite-8-0-rolldown-migration-guide-10-30x-faster-builds/)
- [Next.js 16.2 Blog](https://nextjs.org/blog/next-16-2)
- [Next.js SPA Guide](https://nextjs.org/docs/app/guides/single-page-applications)
- [React Router v7 -- Remix Blog](https://remix.run/blog/react-router-v7)
- [Sunsetting Create React App -- React Blog](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)
- [Vite vs Next.js 2026 -- DesignRevision](https://designrevision.com/blog/vite-vs-nextjs)
- [Vite vs Next.js 2025 -- Strapi](https://strapi.io/blog/vite-vs-nextjs-2025-developer-framework-comparison)

### State Management
- [npm trends: zustand vs jotai vs redux vs valtio](https://npmtrends.com/jotai-vs-recoil-vs-redux-vs-valtio-vs-zustand)
- [State Management in 2026 -- DEV Community](https://dev.to/jsgurujobs/state-management-in-2026-zustand-vs-jotai-vs-redux-toolkit-vs-signals-2gge)
- [React State: Redux vs Zustand vs Jotai 2026 -- InHaq](https://inhaq.com/blog/react-state-management-2026-redux-vs-zustand-vs-jotai.html)
- [Choosing State Management 2026 -- PkgPulse](https://www.pkgpulse.com/blog/react-state-management-2026)
- [Zustand vs Redux Toolkit vs Jotai -- Better Stack](https://betterstack.com/community/guides/scaling-nodejs/zustand-vs-redux-toolkit-vs-jotai/)
- [Zustand WebSocket Discussion](https://github.com/pmndrs/zustand/discussions/1651)
- [Liveblocks Zustand API Reference](https://liveblocks.io/docs/api-reference/liveblocks-zustand)
- [Streaming Backends & React Re-render Control -- SitePoint](https://www.sitepoint.com/streaming-backends-react-controlling-re-render-chaos/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)

### Masonry Layout
- [react-masonry-css npm](https://www.npmjs.com/package/react-masonry-css)
- [react-masonry-css GitHub](https://github.com/paulcollett/react-masonry-css)
- [Masonic GitHub](https://github.com/jaredLunde/masonic)
- [@tanstack/react-virtual npm](https://www.npmjs.com/package/@tanstack/react-virtual)
- [TanStack Virtual Masonry Discussion](https://github.com/TanStack/virtual/discussions/692)
- [Masonry Grid: 1.4 kB Library -- DEV Community](https://dev.to/dangreen/masonry-grid-a-14-kb-library-that-actually-works-341n)
- [CSS Grid Lanes -- Chrome Status](https://chromestatus.com/feature/5149560434589696)
- [CSS Masonry Update -- Chrome Blog](https://developer.chrome.com/blog/masonry-update)
- [Motion Layout Animations](https://www.framer.com/motion/layout-animations/)
- [Masonry in React: Performance -- Medium](https://medium.com/@colecodes/masonry-in-react-a-performance-hell-fb779f5fcebd)
- [Framer Motion npm](https://www.npmjs.com/package/framer-motion)

### Styling
- [vanilla-extract Official Site](https://vanilla-extract.style/)
- [@vanilla-extract/css npm](https://www.npmjs.com/package/@vanilla-extract/css)
- [Sprinkles API Documentation](https://vanilla-extract.style/documentation/sprinkles-api/)
- [Type-Safe Design System with vanilla-extract -- Medium](https://medium.com/@dev-afzalansari/type-safe-design-system-in-react-with-vanilla-extract-d1cc825a3da7)
- [From Tailwind to vanilla-extract -- gafemoyano](https://gafemoyano.com/en/posts/from-tailwind-to-vanilla-extract/)
- [styled-components Maintenance Mode -- Medium](https://medium.com/@ignatovich.dm/the-end-of-an-era-styled-components-in-maintenance-mode-af3477e25953)
- [CSS-in-JS 2025 Trends -- jeffbruchado](https://jeffbruchado.com.br/en/blog/css-in-js-2025-tailwind-styled-components-trends)
- [React CSS 2026 Comparison -- Medium](https://medium.com/@imranmsa93/react-css-in-2026-best-styling-approaches-compared-d5e99a771753)
- [Tailwind CSS Official](https://tailwindcss.com/)
- [Tailwind CSS npm](https://www.npmjs.com/package/tailwindcss)
