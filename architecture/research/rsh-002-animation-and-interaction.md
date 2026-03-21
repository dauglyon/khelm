# RSH-002: Which Animation Library Best Fits The Helm's Card-Based Animated UI?

**Date:** 2026-03-21 | **Status:** Completed

## Question

Which animation library should The Helm adopt for its animation-heavy, card-based UI? The app requires: card enter/exit/reorder in a masonry grid, character-by-character typing effects (AI composing responses), shimmer/pulse loading states, slide-in panels, file drop animations, card state transitions (thinking -> running -> complete -> error), and custom easing curves. The library must compose well with masonry layout libraries and dnd-kit.

## Context

The Helm is a React 18 SPA with Redux Toolkit, TypeScript, and SCSS modules. The UI centers on a masonry grid of cards that animate through multiple states, reorder via drag-and-drop (dnd-kit), and display AI-generated content with typing effects. Performance at 20-50 simultaneously animated elements is critical. The animation system must handle:

- **Layout animations**: Cards entering, exiting, and reflowing in a masonry grid (FLIP technique)
- **Typing effects**: Character-by-character text reveal simulating AI composition
- **Loading states**: Shimmer gradients and pulse effects on skeleton cards
- **Panels**: Slide-in/slide-out side panels and drawers
- **File drops**: Visual feedback animations for drag-and-drop file uploads
- **State machines**: Cards transitioning through thinking -> running -> complete -> error with distinct animations per state
- **Custom easing**: Specific cubic-bezier curves like `cubic-bezier(0.16, 1, 0.3, 1)` and spring physics

## Findings

### Library Overview

| Aspect | Motion (fka Framer Motion) | React Spring | GSAP (+ @gsap/react) | CSS-Only (keyframes + transitions) |
|---|---|---|---|---|
| **Bundle (full, gzipped)** | ~32-34 KB (full); 4.6 KB (LazyMotion + m) | ~16-25 KB (@react-spring/web) | ~23 KB (core); grows with plugins | 0 KB |
| **License** | MIT (irrevocable) | MIT | Custom "no charge" (Webflow-owned; prohibits use in tools competing with Webflow's visual builder) | N/A |
| **React integration** | First-class (`<motion.div>`; hooks-native) | First-class (hooks-based: useSpring, useTransition) | Adapter layer (`useGSAP` hook; imperative refs) | Native (className toggling) |
| **GitHub stars** | ~31k | ~29k | ~20k+ | N/A |
| **npm weekly downloads** | ~34M (framer-motion) | ~800K (react-spring) | ~4M+ (gsap) | N/A |
| **Last release** | March 2026 (v12.38.0; actively maintained) | ~6 months ago (v10.0.3; slower cadence) | 2025 (v3.13; active post-Webflow acquisition) | Evergreen (browser-native) |
| **TypeScript** | Built-in | Built-in | DefinitelyTyped + bundled | N/A |

Sources: [Motion GitHub](https://github.com/motiondivision/motion), [React Spring GitHub](https://github.com/pmndrs/react-spring), [GSAP npm](https://www.npmjs.com/package/gsap), [npm trends: framer-motion](https://npmtrends.com/framer-motion), [react-spring npm](https://www.npmjs.com/package/react-spring), [Motion docs: reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size)

---

### Feature Comparison: The Helm's Requirements

#### 1. Card Enter/Exit/Reorder in Masonry Grid (FLIP / Layout Animations)

| Library | Support | Notes |
|---|---|---|
| **Motion** | Excellent | Built-in `layout` prop triggers automatic FLIP animations on any layout change. `AnimatePresence` handles mount/unmount with exit animations. `mode="popLayout"` removes exiting elements from flow so remaining cards reflow immediately. Built-in `<Reorder.Group>` / `<Reorder.Item>` for drag-to-reorder with automatic layout animation of surrounding items. |
| **React Spring** | Poor (requires add-ons) | No native FLIP support. The maintainer has explicitly declined built-in FLIP, preferring explicit control. Requires `react-spring-flip` or `react-flip-toolkit` as separate dependencies. `useTransition` handles enter/exit but has known issues with transform animations on unmount and "clunky" space collapse. |
| **GSAP** | Good | Flip plugin (now free) records element positions, lets you make DOM changes, then animates the difference. Works well with CSS Grid and masonry layouts. Requires imperative coding with refs; no declarative `layout` prop equivalent. |
| **CSS-Only** | Minimal | CSS `@starting-style` and View Transitions API (Baseline October 2025) enable basic enter/exit. No automatic FLIP for layout reflows. Manual `transform` tricks needed for reorder animation. |

Sources: [Motion layout animations docs](https://motion.dev/docs/react-layout-animations), [Motion Reorder docs](https://motion.dev/docs/react-reorder), [React Spring FLIP issue #395](https://github.com/react-spring/react-spring/issues/395), [GSAP Flip plugin docs](https://gsap.com/docs/v3/Plugins/Flip/), [Codrops GSAP Flip grid tutorial (Jan 2026)](https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/)

#### 2. Character-by-Character Typing Effects

| Library | Support | Notes |
|---|---|---|
| **Motion** | Excellent | Official `<Typewriter>` component (1.3 KB, Motion+) emulates natural human typing with dynamic content and intelligent backspacing. Also achievable via `useMotionValue` + `useTransform` to reveal text character-by-character, or via `variants` with `staggerChildren` on individual character `<motion.span>` elements. |
| **React Spring** | Manual only | No native typing support. Must combine with `react-type-animation` or custom `setInterval` + `useSpring` for opacity/position of each character. |
| **GSAP** | Good | `TextPlugin` provides one-line typing effects. `SplitText` (now free post-Webflow acquisition, rewritten 2025 with 50% size reduction) splits text into chars/words/lines for staggered animation. Both are now included in the main npm package. |
| **CSS-Only** | Limited | `steps()` timing function with `overflow: hidden` and `width` animation. Fixed-length strings only; no dynamic content support. Not suitable for streaming AI responses. |

Sources: [Motion Typewriter docs](https://motion.dev/docs/react-typewriter), [GSAP SplitText docs](https://gsap.com/docs/v3/Plugins/SplitText/), [GSAP TextPlugin](https://gsap.com/text/), [Codrops free GSAP plugins demos (May 2025)](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/), [Typing animation with Framer Motion](https://www.tarascodes.com/typing-animation-framer-motion-react)

#### 3. Shimmer/Pulse Loading States

| Library | Support | Notes |
|---|---|---|
| **Motion** | Good | Achievable with `animate` prop cycling opacity or gradient position via `useMotionValue`. Can use `repeat: Infinity` on transitions. Overkill for pure shimmer -- adds JS overhead. |
| **React Spring** | Adequate | `useSpring` with `loop: true` for pulsing opacity. Similar JS overhead concern. |
| **GSAP** | Adequate | `gsap.to()` with `repeat: -1` and `yoyo: true` for pulse. Timeline for shimmer gradient. |
| **CSS-Only** | Excellent | Pure CSS `@keyframes` with `background-position` or `transform` animation. Zero JS overhead. Hardware-accelerated when using `transform`. `background-attachment: fixed` keeps multiple skeleton elements in sync. Best practice is to use `transform`-based shimmer to avoid main-thread jank during JS execution. |

Sources: [CSS Skeleton Loaders: Shimmer, Pulse & Wave](https://frontend-hero.com/how-to-create-skeleton-loader), [Pure CSS Skeleton Loading (CodePen)](https://codepen.io/maoberlehner/pen/bQGZYB), [Skeleton screens, but fast (dev.to)](https://dev.to/tigt/skeleton-screens-but-fast-48f1)

#### 4. Slide-In Panels

| Library | Support | Notes |
|---|---|---|
| **Motion** | Excellent | `AnimatePresence` + `motion.div` with `initial={{ x: "100%" }}`, `animate={{ x: 0 }}`, `exit={{ x: "100%" }}`. Staggered children via `variants`. Multiple tutorials and battle-tested patterns available. |
| **React Spring** | Good | `useTransition` or `useSpring` with conditional rendering. Works but requires more boilerplate than Motion. |
| **GSAP** | Good | `gsap.fromTo()` with `x` transform. Timeline for staggered panel content. Imperative; requires ref management. |
| **CSS-Only** | Good | `transform: translateX()` + `transition` on class toggle. Simple and performant. Lacks orchestrated child staggering without `:nth-child` delay hacks. |

Sources: [freeCodeCamp animated sidebar tutorial](https://www.freecodecamp.org/news/create-a-fully-animated-sidebar/), [Egghead.io sliding sidebar with Framer Motion](https://egghead.io/blog/how-to-create-a-sliding-sidebar-menu-with-framer-motion)

#### 5. Card State Transitions (thinking -> running -> complete -> error)

| Library | Support | Notes |
|---|---|---|
| **Motion** | Excellent | `variants` system maps state names to animation configs. `AnimatePresence` handles content swaps within cards. `animate` prop accepts variant name strings, making state-machine-driven animation trivial: `<motion.div animate={cardState} variants={cardVariants}>`. |
| **React Spring** | Good | `useSpring` or `useTransition` driven by state. Physics-based transitions feel natural. No built-in variant system; requires manual mapping. |
| **GSAP** | Good | Timeline-based state transitions with labels. Powerful but imperative; state-to-animation mapping is manual. |
| **CSS-Only** | Adequate | `data-state` attribute selectors + CSS transitions. Limited to properties CSS can transition; no orchestration of multi-step transitions. |

Sources: [Motion variants and animation docs](https://motion.dev/docs/react-animation), [AnimatePresence docs](https://motion.dev/docs/react-animate-presence), [Advanced animation patterns (Maxime Heckel)](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)

#### 6. Gesture / Drag Support

| Library | Support | Notes |
|---|---|---|
| **Motion** | Built-in | `drag`, `whileHover`, `whileTap`, `whileFocus`, `whileDrag` props. Drag constraints, elastic boundaries, snap-to points. Included in `domMax` feature bundle (+25 KB). |
| **React Spring** | Via companion | `@use-gesture/react` (same pmndrs org) provides `useDrag`, `usePinch`, etc. Gesture data feeds into `api.start()`. Clean integration but two packages. |
| **GSAP** | Plugin | `Draggable` plugin (now free). Powerful with inertia/snap. Not React-idiomatic; requires ref-based setup. |
| **CSS-Only** | None | No gesture support. Requires JS for any drag behavior. |

Sources: [@use-gesture docs](https://use-gesture.netlify.app/), [Motion gesture docs](https://motion.dev/docs/react-animation), [GSAP Draggable](https://gsap.com/docs/v3/Plugins/Draggable/)

#### 7. Custom Easing Curves

| Library | Support | Notes |
|---|---|---|
| **Motion** | Full | Accepts `ease: [0.16, 1, 0.3, 1]` (cubic-bezier array), named easings ("easeInOut"), `cubicBezier()` helper, and spring physics (`type: "spring"`, `stiffness`, `damping`, `mass`). Per-keyframe easing arrays supported. |
| **React Spring** | Spring-only by default | Physics-based (spring) is the core model. Arbitrary easing possible via `config` but the library philosophy centers on spring dynamics, not bezier curves. |
| **GSAP** | Full | 30+ built-in easing functions, `CustomEase` plugin for arbitrary bezier curves, spring simulation via `Elastic` ease. Industry-leading easing flexibility. |
| **CSS-Only** | Full (CSS) | `cubic-bezier()` in `transition-timing-function`. `linear()` function for arbitrary curves. No spring physics without `@keyframes` approximation. |

Sources: [Motion easing functions](https://www.framer.com/motion/easing-functions/), [Motion transitions docs](https://motion.dev/docs/react-transitions), [GSAP CustomEase](https://gsap.com/docs/v3/Eases/CustomEase/)

---

### Performance at 20-50 Simultaneous Animated Elements

| Library | Assessment | Details |
|---|---|---|
| **Motion** | Good (with optimization) | Animations use CSS `transform` on the compositor thread wherever possible, avoiding layout/paint. `LazyMotion` reduces initial JS cost. Layout animations trigger a single FLIP measurement per frame. Both GSAP and Motion struggle on low-end devices beyond ~50 simultaneous animations without optimization. v11 (2025) improved rendering pipelines for large numbers of animated elements. |
| **React Spring** | Good | Runs animation loop outside React's render cycle via `requestAnimationFrame`. Does not trigger React re-renders for intermediate frames. Physics calculations are lightweight. |
| **GSAP** | Good | Uses `requestAnimationFrame` loop. `ScrollTrigger.batch()` groups animations efficiently. GPU-accelerated transforms. However, all animations run on the main JS thread (no WAAPI delegation), making them vulnerable to jank if the main thread is busy. |
| **CSS-Only** | Excellent | Hardware-accelerated `transform` and `opacity` animations run on the compositor thread, immune to main-thread congestion. Best raw performance for simple animations. |

The [Motion animation performance tier list](https://motion.dev/magazine/web-animation-performance-tier-list) ranks approaches:
- **S/A tier**: WAAPI and CSS compositor animations (transform, opacity) -- run off main thread
- **C tier**: CSS custom properties (always trigger paint)
- **D/E tier**: JS `requestAnimationFrame` libraries (GSAP, React Spring) -- main-thread bound, vulnerable to jank

Motion (Framer Motion) is unique in that it delegates to WAAPI where possible (transform/opacity), falling back to JS for properties WAAPI cannot handle (layout animations, complex values). This hybrid approach gives it better performance than pure-JS libraries for compositor-friendly properties.

Sources: [Motion performance tier list](https://motion.dev/magazine/web-animation-performance-tier-list), [Motion vs GSAP comparison](https://motion.dev/docs/gsap-vs-motion), [Framer Motion vs Motion One mobile performance (2025)](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025), [LogRocket animation libraries comparison (2026)](https://blog.logrocket.com/best-react-animation-libraries/)

---

### Composability with Masonry Layout Libraries and dnd-kit

#### Masonry Libraries

The primary React masonry options are:
- **react-masonry-css** (~3 KB, CSS columns, no virtualization, good for <200 items)
- **Masonic** (~15 KB, virtualized, handles 10K+ items)
- **Masonry Grid** (1.4 KB, vanilla JS core, framework wrappers)
- **MUI Masonry** (part of MUI, CSS flexbox-based)

| Library | Masonry Composability | Notes |
|---|---|---|
| **Motion** | Best | The `layout` prop automatically FLIP-animates any layout change, including CSS column/grid reflows from masonry libraries. `AnimatePresence` + `layout` on each card handles enter/exit with surrounding cards animating to fill gaps. Works because Motion observes element position via `getBoundingClientRect`, independent of how the layout is computed. |
| **React Spring** | Adequate | No automatic layout detection. Must manually measure positions and feed deltas into `useSpring`. Can work with `react-flip-toolkit` as intermediary. |
| **GSAP** | Good | `Flip.getState()` before DOM change, then `Flip.from()` after. Framework-agnostic; works with any masonry lib. More boilerplate than Motion. |
| **CSS-Only** | Poor | No way to animate layout reflows caused by masonry column changes. Items snap to new positions. |

#### dnd-kit Integration

| Library | dnd-kit Composability | Notes |
|---|---|---|
| **Motion** | Good (with caveats) | Developers successfully use Motion for layout animation + dnd-kit for drag logic, updating item order on `onDragMove` rather than `onDragEnd` so Motion animates items into new positions. Known issues: `DragOverlay` applies opacity styles that conflict; container height animations can desync with dnd-kit's position tracking. `mode="popLayout"` helps. |
| **React Spring** | Good | `@use-gesture` + React Spring handles the animation side. dnd-kit handles drop targets/collision. Less conflict since React Spring doesn't automatically measure layout. |
| **GSAP** | Good | dnd-kit's `DragOverlay` accepts custom animation functions; GSAP timelines can drive these. Less common integration pattern; fewer community examples. |
| **CSS-Only** | Adequate | dnd-kit provides `transform` and `transition` CSS values via `useSortable`. Basic reorder animation works. No FLIP for complex layout changes. |

Sources: [dnd-kit + Framer Motion issue #605](https://github.com/clauderic/dnd-kit/issues/605), [dnd-kit + Framer Motion discussion #1036](https://github.com/clauderic/dnd-kit/discussions/1036), [dnd-kit + Framer Motion sync issues #1576](https://github.com/clauderic/dnd-kit/discussions/1576), [dnd-kit sortable docs](https://docs.dndkit.com/presets/sortable)

---

### Emerging Alternative: CSS View Transitions API

The View Transitions API reached Baseline "Newly Available" status in October 2025 (Chrome 111+, Edge 111+, Firefox 133+, Safari 18+). React has added experimental `<ViewTransition>` component support. Key features:

- Automatic FLIP-style animations between DOM states
- `view-transition-name: match-element` auto-generates names for card lists
- Runs on compositor thread (best possible performance)
- Automatic `prefers-reduced-motion` handling

However, it is still experimental in React, doesn't support drag gestures, and has limited control over animation orchestration. Worth monitoring but not production-ready for The Helm's requirements today.

Sources: [Chrome View Transitions 2025 update](https://developer.chrome.com/blog/view-transitions-in-2025), [React ViewTransition docs](https://react.dev/reference/react/ViewTransition), [React Labs blog (April 2025)](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more)

---

### Summary Scorecard

| Requirement | Motion | React Spring | GSAP | CSS-Only |
|---|---|---|---|---|
| Card enter/exit/reorder (FLIP) | 5 | 2 | 4 | 1 |
| Typing effects | 5 | 2 | 4 | 1 |
| Shimmer/pulse loading | 3 | 3 | 3 | 5 |
| Slide-in panels | 5 | 4 | 4 | 4 |
| Card state transitions | 5 | 4 | 4 | 3 |
| Gesture/drag | 5 | 4 | 3 | 0 |
| Custom easing | 5 | 3 | 5 | 4 |
| Perf (20-50 elements) | 4 | 4 | 3 | 5 |
| Masonry composability | 5 | 3 | 4 | 1 |
| dnd-kit composability | 4 | 4 | 3 | 3 |
| DX / API ergonomics | 5 | 3 | 3 | 3 |
| Bundle size impact | 3 | 4 | 3 | 5 |
| Maintenance / ecosystem | 5 | 3 | 4 | 5 |
| **Total (out of 65)** | **59** | **43** | **47** | **40** |

Scale: 5 = excellent, 4 = good, 3 = adequate, 2 = poor, 1 = very poor, 0 = not supported.

## Conclusions

### Recommendation: Motion (formerly Framer Motion) as primary, CSS for shimmer/pulse

**Motion is the clear choice for The Helm's primary animation library.** It dominates in the areas that matter most for a card-based animated UI:

1. **Layout animations are its killer feature.** A single `layout` prop gives automatic FLIP animations when cards reorder, resize, or reflow in a masonry grid. No other library matches this with comparable DX.

2. **AnimatePresence + variants create a natural state machine.** Card states (thinking -> running -> complete -> error) map directly to variant names, and enter/exit animations "just work" with `AnimatePresence`.

3. **Typing effects are first-class.** The official Typewriter component (1.3 KB) or staggered character variants handle AI response streaming cleanly.

4. **dnd-kit integration is proven.** While there are known friction points (DragOverlay opacity, container height sync), the community has established working patterns. Using `onDragMove` for order updates with Motion handling layout animation is the recommended approach.

5. **Ecosystem dominance.** 34M weekly downloads, active maintenance (March 2026 release), MIT license, and the largest community of any React animation library.

**Use CSS-only for shimmer/pulse loading states.** These are simple repeating animations that benefit from zero JS overhead and compositor-thread execution. A `@keyframes` shimmer using `transform: translateX()` is more performant than any JS library for this use case.

### Bundle Size Mitigation

Use `LazyMotion` with the `m` component and async-load the `domMax` feature bundle (needed for drag gestures and layout animations). This reduces the initial render cost to ~4.6 KB, with the full ~25 KB `domMax` bundle loaded asynchronously.

### What to Watch

- **CSS View Transitions API**: When React's `<ViewTransition>` stabilizes, it could replace some Motion layout animations with zero-JS, compositor-thread performance. Monitor React canary releases.
- **dnd-kit friction**: If dnd-kit integration proves too problematic, Motion's built-in `<Reorder>` component is an alternative for simple reorder cases, though it lacks dnd-kit's collision detection and multi-container support.
- **GSAP as a scalpel**: For any edge case requiring timeline-precise sequencing (e.g., a complex multi-step onboarding animation), GSAP can be used alongside Motion for that specific feature. Its `SplitText` is also excellent for advanced text effects beyond what Motion's Typewriter provides.

## Sources

### Official Documentation
- [Motion (Framer Motion) - Official Site](https://motion.dev/)
- [Motion Layout Animations](https://motion.dev/docs/react-layout-animations)
- [Motion Reorder](https://motion.dev/docs/react-reorder)
- [Motion AnimatePresence](https://motion.dev/docs/react-animate-presence)
- [Motion Transitions & Easing](https://motion.dev/docs/react-transitions)
- [Motion Easing Functions](https://www.framer.com/motion/easing-functions/)
- [Motion Typewriter](https://motion.dev/docs/react-typewriter)
- [Motion Reduce Bundle Size](https://motion.dev/docs/react-reduce-bundle-size)
- [Motion LazyMotion](https://motion.dev/docs/react-lazy-motion)
- [Motion Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list)
- [Motion GSAP vs Motion Comparison](https://motion.dev/docs/gsap-vs-motion)
- [Motion GitHub](https://github.com/motiondivision/motion)
- [React Spring - Official Site](https://www.react-spring.dev/)
- [React Spring useTransition](https://react-spring.dev/docs/components/use-transition)
- [React Spring GitHub](https://github.com/pmndrs/react-spring)
- [@use-gesture Documentation](https://use-gesture.netlify.app/)
- [GSAP - Official Site](https://gsap.com/)
- [GSAP Flip Plugin](https://gsap.com/docs/v3/Plugins/Flip/)
- [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)
- [GSAP Text Animations](https://gsap.com/text/)
- [@gsap/react npm](https://www.npmjs.com/package/@gsap/react)
- [GSAP Standard License](https://gsap.com/community/standard-license/)
- [dnd-kit Documentation](https://dndkit.com/)
- [dnd-kit Sortable](https://docs.dndkit.com/presets/sortable)

### Comparison Articles & Benchmarks
- [Comparing the Best React Animation Libraries for 2026 - LogRocket](https://blog.logrocket.com/best-react-animation-libraries/)
- [Beyond Eye Candy: Top 7 React Animation Libraries for Real-World Apps in 2026 - Syncfusion](https://www.syncfusion.com/blogs/post/top-react-animation-libraries)
- [Framer Motion vs Motion One: Mobile Animation Performance in 2025](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025)
- [Framer vs GSAP: Which Animation Library Should You Choose? - Pentaclay](https://pentaclay.com/blog/framer-vs-gsap-which-animation-library-should-you-choose)
- [Web Animation for Your React App: Framer Motion vs GSAP - Semaphore](https://semaphore.io/blog/react-framer-motion-gsap)
- [GSAP vs Motion Guide 2026 - Satish Kumar](https://satishkumar.xyz/blogs/gsap-vs-motion-guide-2026)
- [Animating React UIs in 2025: Framer Motion 12 vs React Spring 10 - Hooked On UI](https://hookedonui.com/animating-react-uis-in-2025-framer-motion-12-vs-react-spring-10/)
- [React Animation Libraries in 2025: What Companies Are Actually Using - DEV](https://dev.to/raajaryan/react-animation-libraries-in-2025-what-companies-are-actually-using-3lik)

### Integration & Community Discussions
- [dnd-kit + Framer Motion Layout Animation - Issue #605](https://github.com/clauderic/dnd-kit/issues/605)
- [dnd-kit + Framer Motion Integration Issues - Issue #1381](https://github.com/clauderic/dnd-kit/issues/1381)
- [dnd-kit + Framer Motion Sync Issues - Discussion #1576](https://github.com/clauderic/dnd-kit/discussions/1576)
- [Using Framer Motion with Masonry Layout - Discussion #1036](https://github.com/clauderic/dnd-kit/discussions/1036)
- [React Spring FLIP Support - Issue #395](https://github.com/react-spring/react-spring/issues/395)
- [React Spring FLIP-style Animations - Issue #9](https://github.com/pmndrs/react-spring/issues/9)

### Tutorials & Implementation Guides
- [Everything About Framer Motion Layout Animations - Maxime Heckel](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/)
- [Advanced Animation Patterns with Framer Motion - Maxime Heckel](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)
- [Framer Motion Complete React & Next.js Guide 2026 - inhaq](https://inhaq.com/blog/framer-motion-complete-guide-react-nextjs-developers)
- [Creating React Animations in Motion - LogRocket](https://blog.logrocket.com/creating-react-animations-with-motion/)
- [Animated Sidebar with Framer Motion - freeCodeCamp](https://www.freecodecamp.org/news/create-a-fully-animated-sidebar/)
- [Typing Animation with Framer Motion - Tara's Codes](https://www.tarascodes.com/typing-animation-framer-motion-react)
- [CSS Skeleton Loaders: Shimmer, Pulse & Wave - Frontend Hero](https://frontend-hero.com/how-to-create-skeleton-loader)
- [Animating Responsive Grid Layout Transitions with GSAP Flip - Codrops (Jan 2026)](https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/)
- [From SplitText to MorphSVG: Free GSAP Plugins - Codrops (May 2025)](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/)

### Licensing & Ecosystem Changes
- [GSAP Is Now Completely Free - CSS-Tricks](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/)
- [Webflow Makes GSAP 100% Free - Webflow Blog](https://webflow.com/blog/gsap-becomes-free)
- [GSAP 3.13 Release](https://gsap.com/blog/3-13/)
- [Chrome View Transitions 2025 Update](https://developer.chrome.com/blog/view-transitions-in-2025)
- [React ViewTransition Component](https://react.dev/reference/react/ViewTransition)
- [React Labs: View Transitions, Activity, and More (April 2025)](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more)

### Masonry Layout Libraries
- [Masonic GitHub](https://github.com/jaredLunde/masonic)
- [react-masonry-css npm](https://www.npmjs.com/package/react-masonry-css)
- [Masonry Grid (1.4 KB) - DEV](https://dev.to/dangreen/masonry-grid-a-14-kb-library-that-actually-works-341n)
- [MUI Masonry](https://mui.com/material-ui/react-masonry/)
