# RSH-010: Drag-and-Drop Library Selection for The Helm

**Date:** 2026-03-21 | **Status:** Completed

## Question

Which drag-and-drop library best fits The Helm's two use cases -- card reordering within a masonry grid (with Motion layout animations) and OS file drops onto a workspace -- given the React/TypeScript/Motion (Framer Motion) stack?

## Context

The Helm is a React SPA using a masonry card layout with Motion (formerly Framer Motion) for animations. Two distinct drag-and-drop interactions are needed:

1. **Card reordering (Vignette 5):** Users select and reorder cards within a masonry grid during narrative composition. Drag operations must trigger animated reflow of surrounding cards using Motion's `layout` animation system.

2. **File drop (Vignette 3):** Users drag OS files (from Finder/Explorer) onto a workspace drop zone for data ingest. Requires visual feedback (highlight, progress indication) during the drag-over state.

The key architectural tension: both dnd-kit and Motion use CSS `transform` properties. dnd-kit applies transforms for drag previews and sort animations; Motion applies transforms for layout animations. These can conflict, causing position calculation mismatches and visual glitches.

## Findings

### Library Overview

Six options were evaluated: dnd-kit, @hello-pangea/dnd, pragmatic-drag-and-drop (Atlassian), react-dnd, native HTML5 DnD API, and react-dropzone.

### Comparison Table: Core Capabilities

| Criterion | dnd-kit | @hello-pangea/dnd | pragmatic-drag-and-drop | react-dnd | Native HTML5 DnD | react-dropzone |
|---|---|---|---|---|---|---|
| **Bundle size (gzipped)** | ~12.3 kB (core) [1] | ~32 kB [1][2] | ~4.7 kB (core) [3][4] | ~23.4 kB (+ backend) [1] | 0 kB | ~7-10 kB [5] |
| **Tree-shakeable** | Yes [1] | No [1] | Yes (entry points) [4] | Partial [1] | N/A | Yes |
| **Maintenance status** | Active; experimental rewrite underway targeting 1.0 [6][7] | Community-maintained fork; stable but infrequent releases [8][9] | Active; backed by Atlassian, powers Jira/Trello/Confluence [3] | Effectively unmaintained; last release ~4 years ago (v16.0.1) [10] | Browser-native | Active; v14.x [5] |
| **npm weekly downloads** | ~6M (@dnd-kit/core) [11] | ~3M (inherited from rbd) [1] | ~345K [12] | ~2.5M [1] | N/A | ~5M [5] |
| **License** | MIT | Apache-2.0 | Apache-2.0 [12] | MIT | N/A | MIT |
| **TypeScript** | Native [1] | Native | Native | Native [1] | N/A | Native |
| **React 18+ support** | Yes | Yes [9] | Yes | Yes | N/A | Yes |

### Comparison Table: Feature Fit

| Criterion | dnd-kit | @hello-pangea/dnd | pragmatic-drag-and-drop | react-dnd | Native HTML5 DnD | react-dropzone |
|---|---|---|---|---|---|---|
| **Grid/masonry reorder** | Supported via SortableContext; variable-size items require custom sorting strategy [13][14] | Not supported; lists only, no grid layouts [2][15] | Low-level; no built-in sort; grid reorder has known cascading-event bugs [16] | Supported via custom implementation | Manual implementation | N/A (file-only) |
| **OS file drop** | Not supported; does not use HTML5 DnD API [17] | Not supported [4] | Supported via external adapter (`dropTargetForExternal`) [18] | Supported via HTML5 backend (`NativeTypes.FILE`) [19] | Supported natively | Yes; primary purpose [5] |
| **Keyboard DnD** | Built-in; arrow keys move items between sortable positions; customizable key bindings [20] | Built-in; spacebar to grab, arrow keys to move [15] | Not built-in; recommends action menus with buttons/forms as alternative [21] | Manual implementation required [1] | Not supported | Keyboard-accessible file dialog (Enter/Space to open) [22] |
| **Screen reader support** | Built-in; ARIA live regions, customizable screen reader instructions [20] | Built-in; comprehensive announcements [15] | Action-menu pattern with live region announcements [21] | Manual [1] | Not supported | Partial; root div focus issues reported [22] |
| **Touch support** | Built-in sensors (Touch, Pointer); requires `touch-action: none` on drag handles [23] | Built-in; long-press to initiate [24] | Uses native HTML5 DnD (touch support varies by browser; documented issues on Android) [25] | Requires separate touch backend package [26] | Not supported on most mobile browsers | Touch-supported via native events |
| **Performance at scale** | 60fps at 1,000 items [1] | 60fps up to ~300 items, degrades beyond [1] | Lightweight; powers Jira boards at scale [3] | 45fps at 1,000 items [1] | Browser-dependent | N/A |

### Comparison Table: Motion (Framer Motion) Integration

| Criterion | dnd-kit | @hello-pangea/dnd | pragmatic-drag-and-drop | react-dnd | Native HTML5 DnD | react-dropzone |
|---|---|---|---|---|---|---|
| **CSS transform conflict** | **Yes -- significant.** Both dnd-kit and Motion apply CSS `transform` to the same elements. dnd-kit uses transforms for drag position and sort animation; Motion uses transforms for `layout` animation. This causes position calculation mismatches. [27][28][29] | Uses own animation system; bypasses Motion entirely. Combining with Motion layout animations is not documented. | No conflict; uses native HTML5 DnD which does not apply CSS transforms. Animations are fully delegated to the consumer. [4] | Uses HTML5 backend with no CSS transforms on the original element. No inherent conflict. | No transforms applied | N/A |
| **Known integration issues** | (1) DragOverlay injects opacity styles, preventing Motion from controlling styling [27]. (2) Container height animations cause sync issues -- dnd-kit's internal position tracking diverges from visual positions during Motion animations [29]. (3) Masonry column-internal reorder causes "catapult" animation where items jump to original position before animating to target [30]. (4) Framer Motion v11+ breaks examples written for v3 [28]. | No documented Motion integration. Library controls its own physics-based animation system. | No known integration issues. Being headless and transform-free, Motion can animate elements freely. | Minimal conflict risk since HTML5 backend does not manipulate element transforms. | No conflict | N/A |
| **Workarounds available** | (1) Update item order on `DragMove` instead of `DragEnd`, letting Motion handle layout animation for non-overlay items [27]. (2) Use `CSS.Translate.toString()` instead of `CSS.Transform.toString()` to avoid scale interference [31]. (3) Disable Motion `layout` animation on actively dragged items. (4) The experimental `@dnd-kit/react` v0.3 rewrite may improve this, but is pre-1.0 [6][7]. | N/A | N/A | N/A | N/A | N/A |
| **Recommended pairing** | Possible but requires careful implementation and workarounds; multiple unresolved GitHub issues [27][28][29][30] | Not recommended for Motion integration; would fight two animation systems | Clean pairing; Motion handles all visual feedback and animation [4] | Clean pairing; Motion handles all visual feedback | Clean pairing | Complementary; no animation concerns |

### Motion's Built-in Reorder Component

Motion (Framer Motion) includes a `Reorder.Group` / `Reorder.Item` component pair for drag-to-reorder lists [32]. However, it has critical limitations for The Helm's use case:

- **Single-axis only:** `Reorder.Group` supports `axis="x"` or `axis="y"`, but not both simultaneously. Attempting 2D reorder (as needed for masonry grids) results in items that cannot be dropped between other items reliably [33][34].
- **No multi-container support:** Cannot drag between different groups/columns [32].
- **No scrollable container support:** Does not handle drag within scrollable areas [32].
- **Recommendation from Motion docs:** "For advanced use-cases we recommend something like DnD Kit" [32].

This rules out Motion's built-in reorder as a standalone solution for masonry card reordering.

### The Core Transform Tension: dnd-kit + Motion

This is the most critical finding. Multiple GitHub issues document the conflict:

1. **Root cause:** dnd-kit's `useSortable` hook applies `transform` CSS to position items during drag. Motion's `layout` prop also applies `transform` to animate items to new positions. When both attempt to control the same element's transform, dnd-kit's internal coordinate system diverges from the visual positions Motion creates [27][29].

2. **Directional asymmetry:** Downward drags often work correctly (container height grows from bottom), but upward drags fail because Motion's height animation shifts item positions relative to where dnd-kit expects them [29].

3. **Masonry-specific issues:** Within-column reorder in masonry layouts causes a "catapult" effect where the dragged item snaps to its original position before animating to the target. Cross-column moves work correctly [30]. This issue remains unresolved.

4. **Version sensitivity:** dnd-kit's storybook examples use Framer Motion v3.x, but current Motion is v11+. Upgrading Framer Motion versions breaks the integration patterns shown in examples [28].

5. **Experimental rewrite:** The `@dnd-kit/react` v0.3.x rewrite (pre-1.0) changes the architecture significantly, but there is no documented confirmation that it resolves Motion integration issues [6][7].

### pragmatic-drag-and-drop: The Transform-Free Alternative

Pragmatic-drag-and-drop avoids the transform conflict entirely because it is built on the native HTML5 DnD API and does not apply CSS transforms to elements [4]. This means:

- Motion can freely apply `layout` animations to all elements without interference.
- The developer has full control over visual feedback during drag operations.
- The library provides the drag-and-drop event plumbing while the consumer (Motion, in our case) handles all visual presentation.

However, pragmatic-drag-and-drop has its own challenges:

- **No built-in sort/reorder:** Sorting logic must be implemented manually. A sortable grid has a known issue with cascading `onDropTargetChange` events that trigger infinite reorder loops [16].
- **Accessibility model differs:** Uses action menus instead of keyboard drag, which is a valid accessibility pattern but different from the keyboard-drag experience users may expect [21].
- **Touch reliability issues:** Despite claiming touch support, multiple reports of inconsistent behavior on Android and iOS (long press-and-hold duration too long, drag starting but not completing) [25].
- **Smaller community:** ~345K weekly downloads vs. ~6M for dnd-kit [11][12].

## Conclusions

### Recommended Architecture: Dual-Library Approach

No single library optimally serves both use cases. The recommended approach is:

**Use Case 1 -- Card Reordering (Vignette 5):**

**Primary recommendation: pragmatic-drag-and-drop + Motion layout animations.**

- pragmatic-drag-and-drop provides drag event infrastructure without CSS transform interference, allowing Motion to handle all visual animation cleanly.
- The lack of built-in sorting is mitigable: implement reorder logic in a reducer/state handler that updates on drop events (not during drag, avoiding the cascading event issue).
- The Apache-2.0 license is permissive enough for most use cases.
- The accessibility model (action menus) is actually well-suited to card-based interfaces where a "Move to position..." menu is natural.

**Fallback recommendation: dnd-kit (experimental @dnd-kit/react).**

- If pragmatic-drag-and-drop's touch issues prove blocking or the manual sorting implementation is too costly, dnd-kit remains the most feature-complete option.
- Use the workaround pattern: update order on `DragMove`, use `CSS.Translate.toString()`, and disable Motion `layout` on the actively dragged item.
- Monitor the `@dnd-kit/react` 1.0 release for potential resolution of Motion integration issues.
- dnd-kit's keyboard accessibility for grid reordering is superior to pragmatic-drag-and-drop's action-menu approach.

**Use Case 2 -- File Drop (Vignette 3):**

**Recommendation: react-dropzone.**

- Purpose-built for OS file drops with a mature, well-tested API.
- Headless design (via `useDropzone` hook) allows full control over drop zone UI and Motion animations.
- Small bundle size (~7-10 kB gzipped).
- Active maintenance, ~5M weekly downloads.
- If pragmatic-drag-and-drop is chosen for card reordering, its external adapter (`dropTargetForExternal`) could handle file drops too, reducing total dependencies. However, react-dropzone provides richer file validation (type, size, count limits) out of the box.

### Decision Matrix

| Factor | pragmatic-drag-and-drop + react-dropzone | dnd-kit + react-dropzone |
|---|---|---|
| Motion compatibility | No conflict | Requires workarounds; unresolved masonry issues |
| Bundle size | ~4.7 kB + ~7-10 kB | ~12.3 kB + ~7-10 kB |
| Keyboard DnD | Action menus (valid but different) | Built-in arrow-key navigation |
| Touch support | Documented issues on mobile | Built-in sensors; well-tested |
| Sorting built-in | No; manual implementation | Yes; SortableContext |
| Masonry grid | Manual; known cascading-event issue | Supported but variable-size items need custom strategy |
| Community size | Smaller; Atlassian-backed | Larger; community-driven |
| Maintenance trajectory | Stable; Atlassian production use | Active rewrite; pre-1.0 experimental |

### Risk Assessment

- **pragmatic-drag-and-drop risk:** Manual sort implementation effort; touch reliability on mobile; smaller community for troubleshooting.
- **dnd-kit risk:** Unresolved Motion transform conflicts in masonry layouts; experimental rewrite may introduce breaking changes; Framer Motion version sensitivity.
- **Mitigations:** Build a proof-of-concept with the primary recommendation (pragmatic-drag-and-drop + Motion layout) for a small masonry grid (5-10 cards) before committing. If touch or sort issues emerge, pivot to dnd-kit with documented workarounds.

## Sources

1. [Best React Drag and Drop Libraries 2025: Complete Guide (zoer.ai)](https://zoer.ai/posts/zoer/best-react-drag-drop-libraries-comparison) -- Bundle sizes, performance benchmarks, accessibility comparison table
2. [Top 5 Drag-and-Drop Libraries for React in 2026 (Puck)](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) -- Library comparison with pros/cons, @hello-pangea/dnd grid limitation
3. [Pragmatic drag and drop - Atlassian Design System](https://atlassian.design/components/pragmatic-drag-and-drop/) -- Official documentation, architecture overview
4. [Implement the Pragmatic drag and drop library (LogRocket Blog)](https://blog.logrocket.com/implement-pragmatic-drag-drop-library-guide/) -- Bundle size (~4.7kB), external file support, no CSS transforms
5. [react-dropzone - npm](https://www.npmjs.com/package/react-dropzone) -- Package details, weekly downloads
6. [dnd-kit maintenance status - GitHub Issue #1830](https://github.com/clauderic/dnd-kit/issues/1830) -- Maintainer confirms active development, experimental branch status
7. [dnd-kit next discussion - GitHub Discussion #1603](https://github.com/clauderic/dnd-kit/discussions/1603) -- @dnd-kit/react rewrite details, migration guide
8. [@hello-pangea/dnd maintenance announcement - GitHub Issue #2437](https://github.com/atlassian/react-beautiful-dnd/issues/2437) -- Fork creation and maintenance continuation
9. [@hello-pangea/dnd - npm](https://www.npmjs.com/package/@hello-pangea/dnd) -- React 18 support, current version
10. [react-dnd - npm](https://www.npmjs.com/package/react-dnd) -- Last published 4 years ago (v16.0.1)
11. [@dnd-kit/core - npm](https://www.npmjs.com/package/@dnd-kit/core) -- Weekly download statistics (~6M)
12. [@atlaskit/pragmatic-drag-and-drop - npm](https://www.npmjs.com/package/@atlaskit/pragmatic-drag-and-drop) -- Weekly downloads (~345K), Apache-2.0 license
13. [dnd-kit masonry grid handling - GitHub Issue #720](https://github.com/clauderic/dnd-kit/issues/720) -- Variable-size grid item challenges
14. [dnd-kit grid with drag handle example (CodeSandbox)](https://codesandbox.io/s/dndkit-grid-with-drag-handle-example-x9w71) -- Working grid implementation
15. [@hello-pangea/dnd GitHub repository](https://github.com/hello-pangea/dnd) -- Grid not supported; lists only
16. [Implement a sortable grid correctly - pragmatic-drag-and-drop Issue #166](https://github.com/atlassian/pragmatic-drag-and-drop/issues/166) -- Cascading onDropTargetChange event bug
17. [Drop file support? - dnd-kit Issue #1581](https://github.com/clauderic/dnd-kit/issues/1581) -- File drop not supported
18. [Pragmatic drag and drop core package - External adapter](https://atlassian.design/components/pragmatic-drag-and-drop/core-package/) -- dropTargetForExternal, monitorForExternal
19. [React DnD Native Files example](https://react-dnd.github.io/react-dnd/examples/other/native-files/) -- HTML5 backend file drop
20. [dnd-kit Accessibility Guide](https://docs.dndkit.com/guides/accessibility) -- Keyboard sensor, ARIA attributes, screen reader instructions
21. [Pragmatic drag and drop Accessibility Guidelines](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines/) -- Action menu pattern, no keyboard drag
22. [react-dropzone keyboard accessibility PR #336](https://github.com/react-dropzone/react-dropzone/pull/336) -- Root div focus issues
23. [dnd-kit Touch Sensor documentation](https://docs.dndkit.com/api-documentation/sensors/touch) -- touch-action: none requirement
24. [@hello-pangea/dnd touch sensor docs](https://github.com/hello-pangea/dnd/blob/main/docs/sensors/touch.md) -- Long-press activation
25. [pragmatic-drag-and-drop mobile/touch support discussion - GitHub Discussion #93](https://github.com/atlassian/pragmatic-drag-and-drop/discussions/93) -- Touch issues reported
26. [react-dnd-touch-backend - Bundlephobia](https://bundlephobia.com/package/react-dnd-touch-backend) -- Separate package required
27. [Framer Motion for layout animation - dnd-kit Issue #605](https://github.com/clauderic/dnd-kit/issues/605) -- DragOverlay opacity, useDragOverlay hook proposal
28. [Issue with framer motion integration - dnd-kit Issue #1381](https://github.com/clauderic/dnd-kit/issues/1381) -- Framer Motion version incompatibility (v3 vs v11)
29. [Sync Issues with DnD-Kit and Framer Motion - dnd-kit Discussion #1576](https://github.com/clauderic/dnd-kit/discussions/1576) -- Height animation sync divergence
30. [Using framer motion with masonry layout - dnd-kit Discussion #1036](https://github.com/clauderic/dnd-kit/discussions/1036) -- Catapult animation bug, unresolved
31. [dnd-kit CSS Transform documentation fix - Issue #27](https://github.com/dnd-kit/docs/issues/27) -- CSS.Translate vs CSS.Transform
32. [Motion Reorder documentation](https://motion.dev/docs/react-reorder) -- Reorder.Group/Item, limitations, dnd-kit recommendation
33. [Reorder on both x and y axis not working - Motion Issue #2089](https://github.com/motiondivision/motion/issues/2089) -- 2D grid reorder bug
34. [Multi-axis support in Reorder.Group - Motion Issue #1400](https://github.com/framer/motion/issues/1400) -- Feature request for axis="xy"
35. [dnd-kit future of library & maintenance - GitHub Issue #1194](https://github.com/clauderic/dnd-kit/issues/1194) -- Major refactor goals, framework agnosticism
36. [react-beautiful-dnd deprecated - GitHub Issue #2672](https://github.com/atlassian/react-beautiful-dnd/issues/2672) -- Repository archived August 2025
37. [Native HTML5 DnD accessibility - HTML5 Doctor](http://html5doctor.com/accessibility-native-drag-and-drop/) -- No keyboard/touch support natively
38. [react-dropzone official documentation](https://react-dropzone.js.org/) -- API reference, file validation features
