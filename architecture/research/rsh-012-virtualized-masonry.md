# RSH-012: Virtualized Masonry Layout Options for React with Motion Animations

**Date:** 2026-03-21 | **Status:** Completed

## Question

What are the best options for implementing a virtualized masonry layout in React when the app uses Motion (Framer Motion) for animations, potentially displaying hundreds of cards simultaneously? How do we resolve the fundamental tension between virtualization (removing off-screen items from the DOM) and Motion's `layout` prop (which uses FLIP animations requiring both start and end positions in the DOM)?

## Context

The application may display hundreds of cards in a masonry (Pinterest-style) layout. At scale, rendering all cards to the DOM simultaneously degrades performance. Virtualization solves this by only rendering visible items, but it conflicts with Motion's layout animation system, which relies on the FLIP technique: measuring an element's position before and after a layout change, then animating the transform. If an element is removed from the DOM by the virtualizer, FLIP cannot compute its start or end position.

Pinterest itself uses a virtualized masonry component in their open-source [Gestalt design system](https://github.com/pinterest/gestalt), with configurable virtual buffer zones above and below the viewport ([source](https://github.com/pinterest/gestalt/blob/master/packages/gestalt/src/Masonry.tsx)). This confirms that virtualization is the industry-standard approach for large masonry grids, but animation is typically sacrificed or limited to simple CSS transitions on initial reveal.

## Findings

### Performance Thresholds: When Does Non-Virtualized Masonry Become a Problem?

| Item Count | Expected Performance | Notes |
|---|---|---|
| < 200 | Smooth | Non-virtualized libraries like react-masonry-css work fine ([source](https://dev.to/adioof/why-i-built-another-masonry-library-for-react-and-why-its-faster-3195)) |
| 200-500 | Generally acceptable | Depends on card complexity; simple cards with few DOM nodes per card may still be fine |
| 500-2,000 | Degradation begins | Noticeable jank on scroll, especially with complex cards containing images, multiple text elements |
| 2,000+ | Significant problems | Browser slowdown confirmed by benchmarks; virtualization becomes necessary ([source](https://dev.to/adioof/why-i-built-another-masonry-library-for-react-and-why-its-faster-3195)) |

Key insight from benchmarks: with virtualization, DOM node count stays constant (~45-50 nodes) regardless of total items (100 or 100,000), maintaining 58-60 FPS even at 10,000 items ([source](https://dev.to/adioof/why-i-built-another-masonry-library-for-react-and-why-its-faster-3195)).

### Library Comparison

#### 1. Masonic

| Attribute | Details |
|---|---|
| Package | [`masonic`](https://www.npmjs.com/package/masonic) |
| Version | 4.1.0 |
| Bundle size | ~15 KB gzipped ([source](https://bundlephobia.com/package/masonic)) |
| Weekly downloads | ~37,000-52,000 ([source](https://npmtrends.com/masonic-vs-react-mason-vs-react-masonry-component-vs-react-masonry-css-vs-react-masonry-infinite-vs-react-masonry-responsive-vs-react-movable)) |
| Last commit | December 2024 ([source](https://github.com/jaredLunde/masonic)) |
| Open issues | 41 ([source](https://github.com/jaredLunde/masonic)) |
| Maintenance | Low activity; last npm publish ~1 year ago |
| Virtualization | Yes, using red-black interval trees for O(log n + m) lookup ([source](https://github.com/jaredLunde/masonic)) |
| Animation support | None built-in. Has `onRender` callback but no animation primitives ([source](https://github.com/jaredLunde/masonic)) |
| Motion integration | No documented integration. Would need to wrap rendered items in `motion.div` manually |
| Overscan | Configurable via `overscanBy` prop ([source](https://github.com/jaredLunde/masonic)) |
| Key limitations | No built-in infinite scroll, no custom scroll container support ([source](https://github.com/jaredLunde/masonic)) |

**Assessment:** Mature virtualization engine but maintenance is declining. No animation story. Wrapping items in `motion.div` for simple enter animations (opacity, translateY) would work, but `layout` animations across virtualization boundaries would break.

#### 2. @tanstack/react-virtual

| Attribute | Details |
|---|---|
| Package | [`@tanstack/react-virtual`](https://www.npmjs.com/package/@tanstack/react-virtual) |
| Version | Latest (actively maintained) |
| Bundle size | ~19.8 KB ([source](https://bundlephobia.com/package/@tanstack/react-virtual)) |
| Weekly downloads | ~4,600,000 ([source](https://www.npmjs.com/package/@tanstack/react-virtual)) |
| Masonry support | Via `lanes` API; not a dedicated masonry component ([source](https://github.com/TanStack/virtual/discussions/692)) |
| Animation support | None built-in; headless/unstyled by design ([source](https://tanstack.com/virtual/latest)) |
| Motion integration | Partial. `useWindowVirtualizer` works better with Motion than `useVirtualizer` due to positioning differences ([source](https://github.com/TanStack/virtual/discussions/482)). A community [CodeSandbox](https://codesandbox.io/s/react-virtual-framer-motion-rvlns) demonstrates basic integration |

**Masonry implementation approach:** TanStack Virtual's `lanes` option divides items into columns. Each virtual item has a `lane` property indicating its column. Items are absolutely positioned using CSS transforms based on lane index and scroll offset. However, implementing true masonry (variable heights distributed across columns using shortest-column-first) requires custom logic on top of the lanes API -- the library does not compute masonry positions automatically ([source](https://github.com/TanStack/virtual/discussions/692), [source](https://github.com/TanStack/virtual/discussions/1117)).

**Assessment:** The most popular and actively maintained option. Headless design means maximum flexibility but also maximum implementation effort for masonry. The lanes API provides building blocks but not a complete masonry solution. Motion integration is possible but requires careful handling of positioning (avoid absolute positioning, prefer block translation) ([source](https://github.com/TanStack/virtual/discussions/482)).

#### 3. @virtuoso.dev/masonry (React Virtuoso)

| Attribute | Details |
|---|---|
| Package | [`@virtuoso.dev/masonry`](https://www.npmjs.com/package/@virtuoso.dev/masonry) |
| Version | 1.4.0 |
| Bundle size | ~29.6 KB ([source](https://bundlephobia.com/package/react-virtuoso)) |
| Weekly downloads | Low adoption (2 dependent packages) ([source](https://www.npmjs.com/package/@virtuoso.dev/masonry)) |
| Last published | ~2 months ago (actively maintained) ([source](https://www.npmjs.com/package/@virtuoso.dev/masonry)) |
| Parent library | Part of the React Virtuoso ecosystem (react-virtuoso has 557 dependents) ([source](https://www.npmjs.com/package/react-virtuoso)) |
| Features | Virtualized rendering, variable item heights (auto-measured), dynamic column count, window scroll support, SSR, shortest-column-first distribution ([source](https://virtuoso.dev/masonry/)) |
| Overscan | Configurable via `overscan` prop with `{ main, reverse }` directional control ([source](https://github.com/petyosi/react-virtuoso/issues/188)) |
| Animation support | No built-in animation primitives documented |
| Motion integration | Not documented |

**Assessment:** The only dedicated, actively-maintained virtualized masonry component with a full feature set. Being relatively new (separate package from main react-virtuoso), adoption is low but the parent library is battle-tested. No animation story out of the box, but the overscan system with directional control could help with animation continuity.

#### 4. Pinterest Gestalt Masonry

| Attribute | Details |
|---|---|
| Package | [`gestalt`](https://www.npmjs.com/package/gestalt) (full design system) |
| Virtualization | Optional via `virtualize` prop; requires `scrollContainer` ([source](https://github.com/pinterest/gestalt/blob/master/packages/gestalt/src/Masonry.tsx)) |
| Buffer control | `virtualBufferFactor` (multiplier of container height), `virtualBoundsTop`, `virtualBoundsBottom` (pixel values) ([source](https://github.com/Kronuz/react-gestalt-masonry)) |
| Animation | None built-in; Pinterest's production site uses no layout animations on the masonry grid |

**Assessment:** This is what Pinterest actually uses in production. It validates the pattern of virtualization without animation. Not practical to import as a standalone dependency since it's part of a full design system, but it's an important reference implementation.

### 5. CSS `content-visibility: auto` -- Browser-Native "Virtualization"

| Attribute | Details |
|---|---|
| Browser support | Baseline as of September 2025; available in all major browsers ([source](https://dev.to/sebastienlorber/css-content-visibility-for-react-devs-4a3i)) |
| How it works | Browser skips rendering (layout + paint) of off-screen elements but keeps them in the DOM ([source](https://web.dev/articles/content-visibility)) |
| Performance gain | Up to 7x rendering performance improvement on initial load ([source](https://web.dev/articles/content-visibility)) |
| Requires | `contain-intrinsic-size` to tell browser how much space to reserve for hidden items ([source](https://web.dev/articles/content-visibility)) |
| DOM presence | Items stay in DOM (unlike JS virtualization) -- enables Ctrl+F search ([source](https://dev.to/sebastienlorber/css-content-visibility-for-react-devs-4a3i)) |
| React rendering | All items are still rendered by React (React reconciliation cost remains) ([source](https://github.com/petyosi/react-virtuoso/discussions/959)) |
| Safari caveat | Cmd+F may not find text in elements hidden by content-visibility: auto in Safari 18.3.1 ([source](https://cekrem.github.io/posts/content-visibility-auto-performance/)) |

**Interaction with Motion's `layout` prop -- the critical question:**

This is under-documented, but analysis of the mechanisms reveals significant concerns:

1. **`getBoundingClientRect` on hidden children:** The WICG spec explainer states that `getBoundingClientRect()` can still be called on elements with `content-visibility: hidden` to measure layout ([source](https://github.com/WICG/display-locking/blob/main/explainers/content-visibility.md)). However, `content-visibility: auto` applies `contain: size` when off-screen, which means the element's intrinsic size is replaced by `contain-intrinsic-size`. Children's actual positions inside a size-contained element may not be accurately measurable.

2. **FLIP measurement problem:** Motion's `layout` prop measures element position with `getBoundingClientRect()` before and after a layout change. If an off-screen element has `content-visibility: auto` applied, its children's size is approximated (not real), so the "First" measurement in FLIP could be based on the placeholder size rather than the actual rendered size. This would cause incorrect animation trajectories.

3. **Scrolling triggers paint:** `content-visibility: auto` causes continuous paint operations during scrolling as elements enter/leave the viewport ([source](https://dev.to/sebastienlorber/css-content-visibility-for-react-devs-4a3i)). This paint cost is higher than JS virtualization, which avoids painting entirely for off-screen items.

4. **React reconciliation is NOT skipped:** Unlike JS virtualization, React still renders all components. For hundreds of complex cards, the React render cost alone can be substantial ([source](https://github.com/petyosi/react-virtuoso/discussions/959)).

**Assessment:** `content-visibility: auto` is appealing because it keeps items in the DOM (theoretically compatible with FLIP). However, the size containment applied to off-screen elements likely breaks accurate FLIP measurements. Additionally, it does not reduce React rendering cost, which is often the primary bottleneck. Best suited as a progressive enhancement for moderate lists (200-500 items) where React rendering cost is acceptable but paint cost is the bottleneck.

### The Core Tension: Virtualization vs. Motion Layout Animations

Motion's `layout` prop uses FLIP under the hood: it measures an element's position before a React render, then after, and animates the transform delta. This requires both the start and end positions to be in the DOM ([source](https://motion.dev/docs/react-layout-animations), [source](https://www.nan.fyi/magic-motion)).

| Scenario | Virtualization | Motion `layout` | Compatible? |
|---|---|---|---|
| Card reorder within viewport | Items in DOM | Both positions measurable | Yes |
| Card moves from off-screen to viewport | Item was not in DOM | No "First" position to measure | No -- animation starts from wrong position |
| Card moves from viewport to off-screen | Item removed from DOM | No "Last" position to measure | No -- animation cannot complete |
| Window resize / column reflow | Visible items repositioned | Both positions measurable for visible items | Partially -- off-screen items jump |

The official Motion team guidance (issue [#389](https://github.com/motiondivision/motion/issues/389)): use `style` for positioning instead of variants, and let `layout` handle the animation. This works within the virtualized window but does not solve the enter/exit boundary problem.

### Compromise Patterns and Hybrid Approaches

#### Pattern 1: Overscan Buffer for Animation Continuity

Render extra items above and below the viewport to create an animation buffer zone. Items animate within this extended zone, and only pop in/out at the far edges where users are less likely to notice.

- **Masonic:** `overscanBy` prop controls buffer size ([source](https://github.com/jaredLunde/masonic))
- **React Virtuoso:** `overscan: { main, reverse }` with directional control ([source](https://github.com/petyosi/react-virtuoso/issues/188))
- **Pinterest Gestalt:** `virtualBufferFactor` (multiplier), `virtualBoundsTop`/`virtualBoundsBottom` (pixels) ([source](https://github.com/Kronuz/react-gestalt-masonry))
- **react-virtualized:** Predictive overscan that stacks buffer in scroll direction, then equalizes when scrolling stops ([source](https://github.com/bvaughn/react-virtualized/pull/478))

Trade-off: Higher overscan = more DOM nodes = less performance benefit from virtualization. A 2x buffer (2 viewport heights above + below) typically adds 100-200 extra nodes.

#### Pattern 2: Enter Animations Only (No Layout Animations)

Use simple CSS transitions or Motion `initial`/`animate` for items entering the viewport. Skip `layout` prop entirely. This is the most common production pattern.

```
Items fade/slide in when first rendered by virtualizer.
No attempt to animate position changes across virtualization boundaries.
```

This is what most production masonry grids do, including Pinterest ([source](https://github.com/pinterest/gestalt)), and it works well with any virtualization library. The `onRender` callback in Masonic can trigger these animations ([source](https://github.com/jaredLunde/masonic)).

#### Pattern 3: AnimatePresence for Exit Animations

Use Motion's `AnimatePresence` to animate items as they leave the virtualized window. This gives a fade-out effect when items scroll out. Keep exit animations short to avoid performance issues with multiple simultaneous exits ([source](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/)).

Caveat: The virtualizer must support delayed removal (keeping the element in DOM briefly after it leaves the virtual window for the exit animation to play). Not all virtualizers support this.

#### Pattern 4: Hybrid -- content-visibility for Moderate Lists, Virtualization for Large

- **< 200 items:** No virtualization needed. Full Motion `layout` animations work perfectly.
- **200-500 items:** Use `content-visibility: auto` on each masonry item. Items stay in DOM for FLIP, but rendering is skipped off-screen. Accept the risk of slightly inaccurate FLIP measurements for off-screen items and the continued React render cost.
- **500+ items:** Use JS virtualization. Limit animations to enter/exit only (Pattern 2/3). No `layout` animations.

#### Pattern 5: layoutId with Shared Element Transitions

Instead of animating items within the masonry grid itself, use Motion's `layoutId` for transitions *between* views (e.g., masonry grid to detail view). The masonry grid itself has no layout animations; the animation happens when a card expands into a detail panel. This sidesteps the virtualization conflict entirely because the shared element transition only involves two specific elements ([source](https://motion.dev/docs/react-layout-animations)).

### What Production Apps Actually Do

| App | Masonry? | Virtualized? | Layout Animations? | Technique |
|---|---|---|---|---|
| Pinterest | Yes | Yes (Gestalt Masonry with `virtualize` prop) | No | Items absolutely positioned, fade-in on initial load only ([source](https://github.com/pinterest/gestalt)) |
| Unsplash | Yes | Partial | No | Masonry with lazy-loaded images; items positioned via shortest-column algorithm ([source](https://www.webbae.net/posts/horizontal-masonry-grid-like-the-pros-unsplash-and-pinterest)) |
| Dribbble | Yes | Partial | Minimal | CSS transitions on hover; no reorder animations |

The consistent finding: **no major production masonry grid uses FLIP/layout animations on the grid itself.** Animations are limited to: (1) fade-in on initial reveal, (2) hover effects, (3) transitions to detail views.

### CSS Native Masonry (Future)

The CSS `grid-template-rows: masonry` / `display: grid-lanes` specification is in active development but **not production-ready** as of March 2026:

- Firefox: behind flag since Firefox 77 ([source](https://caniuse.com/mdn-css_properties_grid-template-rows_masonry))
- Safari Technology Preview: supports `display: grid-lanes` syntax ([source](https://webkit.org/blog/17660/introducing-css-grid-lanes/))
- Chrome: experimental flag only ([source](https://developer.chrome.com/blog/masonry-update))
- No browser ships it unflagged in stable releases ([source](https://css-tricks.com/masonry-layout-is-now-grid-lanes/))

If/when this ships, it would handle layout natively (no JS positioning), which could simplify the animation story since items would have real CSS positions rather than JS-computed absolute positions.

## Conclusions

### Recommended Approach

**For this application (hundreds of cards, Motion animations):**

1. **Use `@virtuoso.dev/masonry` or build on `@tanstack/react-virtual`** for the masonry layout with virtualization. Virtuoso Masonry offers a more complete out-of-the-box solution; TanStack offers more control but requires implementing the masonry algorithm manually.

2. **Do NOT use Motion's `layout` prop on masonry grid items.** This is the key architectural decision. The `layout` prop fundamentally conflicts with virtualization and no production app has solved this at scale.

3. **Use Motion for enter animations only.** Wrap each masonry item in a `motion.div` with `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`. Track "first render" state to avoid re-animating items that were previously visible but got recycled by the virtualizer.

4. **Use Motion `layoutId` for card-to-detail transitions.** This is where Motion's layout system shines -- animating a card expanding into a detail view. This works because both the source (card in grid) and target (detail panel) are in the DOM simultaneously.

5. **Configure generous overscan** (1.5-2x viewport height) to minimize visible pop-in/pop-out at scroll boundaries.

6. **Consider `content-visibility: auto` as a progressive enhancement** on individual cards' internal content (not the cards themselves) to reduce paint cost of complex card interiors.

### Decision Matrix

| If your card count is... | Recommended approach |
|---|---|
| < 100 | No virtualization. Use CSS masonry (columns or flexbox). Full Motion `layout` animations. |
| 100-300 | `content-visibility: auto` on items. Motion `layout` may work but test thoroughly. |
| 300-1,000 | JS virtualization required. Enter animations only. `layoutId` for detail transitions. |
| 1,000+ | JS virtualization required. Minimize animation. Prioritize scroll performance. |

## Sources

- [Masonic GitHub repository](https://github.com/jaredLunde/masonic)
- [Masonic on npm](https://www.npmjs.com/package/masonic)
- [Masonic on Bundlephobia](https://bundlephobia.com/package/masonic)
- [TanStack Virtual documentation](https://tanstack.com/virtual/latest)
- [TanStack Virtual masonry discussion #692](https://github.com/TanStack/virtual/discussions/692)
- [TanStack Virtual masonry lanes issue #1117](https://github.com/TanStack/virtual/discussions/1117)
- [TanStack Virtual + Framer Motion discussion #482](https://github.com/TanStack/virtual/discussions/482)
- [@virtuoso.dev/masonry on npm](https://www.npmjs.com/package/@virtuoso.dev/masonry)
- [React Virtuoso Masonry documentation](https://virtuoso.dev/masonry/)
- [React Virtuoso GitHub](https://github.com/petyosi/react-virtuoso)
- [React Virtuoso CSS containment discussion #959](https://github.com/petyosi/react-virtuoso/discussions/959)
- [Motion layout animations documentation](https://motion.dev/docs/react-layout-animations)
- [Motion issue #389 -- virtualized UI items](https://github.com/motiondivision/motion/issues/389)
- [Inside Framer's Magic Motion (FLIP explainer)](https://www.nan.fyi/magic-motion)
- [Maxime Heckel -- Framer Motion layout animations](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/)
- [Pinterest Gestalt design system](https://github.com/pinterest/gestalt)
- [Pinterest Gestalt Masonry source](https://github.com/pinterest/gestalt/blob/master/packages/gestalt/src/Masonry.tsx)
- [react-gestalt-masonry (TypeScript port)](https://github.com/Kronuz/react-gestalt-masonry)
- [DreamMasonry benchmarks -- "I Built a React Masonry Library That Handles 10K Items at 60fps"](https://dev.to/adioof/why-i-built-another-masonry-library-for-react-and-why-its-faster-3195)
- [CSS content-visibility for React devs](https://dev.to/sebastienlorber/css-content-visibility-for-react-devs-4a3i)
- [content-visibility performance guide](https://cekrem.github.io/posts/content-visibility-auto-performance/)
- [content-visibility on web.dev](https://web.dev/articles/content-visibility)
- [WICG content-visibility explainer](https://github.com/WICG/display-locking/blob/main/explainers/content-visibility.md)
- [CSS masonry / grid-lanes on Can I Use](https://caniuse.com/mdn-css_properties_grid-template-rows_masonry)
- [WebKit grid-lanes introduction](https://webkit.org/blog/17660/introducing-css-grid-lanes/)
- [Chrome masonry update](https://developer.chrome.com/blog/masonry-update)
- [CSS-Tricks -- Masonry is now grid-lanes](https://css-tricks.com/masonry-layout-is-now-grid-lanes/)
- [Unsplash/Pinterest horizontal masonry technique](https://www.webbae.net/posts/horizontal-masonry-grid-like-the-pros-unsplash-and-pinterest)
- [FLIP animation technique (Aerotwist)](https://aerotwist.com/blog/flip-your-animations/)
- [react-virtualized overscan documentation](https://github.com/bvaughn/react-virtualized/blob/master/docs/overscanUsage.md)
- [react-virtualized predictive overscan PR](https://github.com/bvaughn/react-virtualized/pull/478)
- [npm trends -- masonry library comparison](https://npmtrends.com/masonic-vs-react-mason-vs-react-masonry-component-vs-react-masonry-css-vs-react-masonry-infinite-vs-react-masonry-responsive-vs-react-movable)
- [Masonic on Snyk Advisor](https://snyk.io/advisor/npm-package/masonic)
- [react-virtual + framer-motion CodeSandbox](https://codesandbox.io/s/react-virtual-framer-motion-rvlns)
