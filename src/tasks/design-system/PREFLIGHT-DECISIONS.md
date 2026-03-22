# Preflight Decisions — design-system (Fresh Pass)

## Resolved

### R1. Add `task` InputType and `queued` status to theme contract and values
Architecture defines 7 InputTypes (including `task`: fg #7A3B5E, bg #F2E6EE, border #C9A3B8) and 5 statuses (including `queued`: #6B7280). The existing code has only 6 types and 4 statuses. Fix in Task 01 review — add `task` to contract, theme, InputType union. Add `queued` to contract and theme.

### R2. Propagate `task` and `queued` to downstream components
- Task 08 (variants): add `queued` state to `cardStatus` variants (scale pulse same as thinking/running)
- Task 18 (Chip): add `task` to `chipColorVariants` styleVariants
- Task 19 (Badge): add `queued` to `dotColorVariants` styleVariants
- Task 20 (Card): add `task` to `accentColorVariants` styleVariants
- Update all related tests to cover 7 types / 5 statuses

### R3. Fix spec naming mismatches — code is canonical
Specs reference `shimmerStyle`, `pulseStyle`, `spinStyle`. Code exports `shimmer`, `pulse`, `spin` (style classes) and `shimmerKeyframes`, `pulseKeyframes`, `spinKeyframes`, `fadeInUpKeyframes` (keyframe names). Code names are canonical — reviewers should accept code names, not reject for spec naming.

### R4. Files already exist — treat as review/fix, not greenfield
All 20 tasks have existing implementations. The adversarial review cycle (Phase B) will review existing code against the spec + architecture. Phase A-Fix handles gaps found.

### R5. No fontFace() calls needed
Google Fonts CDN `<link>` tags in app.html handle font loading. Theme tokens reference font-family names directly. The spec's fontFace requirement and `font-display: swap` acceptance criterion are superseded by this decision. Reviewers should not reject for absence of fontFace.

### R6. Icon registry — use existing pattern
Spec says `iconRegistry: Record<string, React.FC<...>>`. Code uses `iconPaths: Record<string, ReactElement>`. The ReactElement pattern is simpler and works — keep it. Rename to `iconRegistry` for spec compliance, or update spec to match code. Decision: keep code name `iconPaths`, reviewer should not reject for this naming difference. Extra icons (chat, copy, pin, etc.) added by card domain are legitimate.

### R7. Button hardcoded colors
`#ffffff` for solid-danger text and raw rgba for hover tints. No `white` token exists in the contract. Decision: use `vars.color.surface` instead of `#ffffff`. For hover tints, use CSS `color-mix()` or accept a small raw value as a pragmatic exception since no tint token system exists.

### R8. Sprinkles scale corrections
- Add `minHeight: '100vh'` (in spec, missing from code)
- Add `width: '75%'` and `height: '75%'` (in spec, missing from code)
- Remove extra values not in spec (`inline-block`, `space-evenly`, `wrap-reverse`, `dotted`, `33.333%`) OR update spec to include them. Decision: keep the extras (they're useful), add the missing values. Spec is a minimum, not a maximum.

### R9. Motion variant values — spec is authoritative
Where existing code differs from spec (cardEnterExit y values, panelSlide state names, easing choices, dropzone missing accept/reject states), the spec is authoritative. Fix code to match spec during review.

### R10. Stack `wrap` prop type
Spec says `boolean`, code uses `FlexWrap` string enum. Decision: use `boolean` per spec (simpler API). Map `true → 'wrap'`, `false → 'nowrap'` internally.

### R11. Weak test assertions
Tests that only assert `toBeInTheDocument()` for behavioral criteria (color, focus-visible, size) are insufficient. Review should flag these. Fix agents should strengthen assertions where feasible in happy-dom (acknowledge that computed styles from vanilla-extract aren't available in happy-dom — assert className presence instead).

### R12. Integration proof `tsc` commands
`npx tsc --noEmit <single-file>` doesn't work with bundler module resolution. Use `npx tsc --noEmit` (project-wide) instead. Reviewers should not reject for this spec defect.

### R13. `reducedMotion` export in keyframes
Spec requires a standalone `reducedMotion` style export. Current code applies reduced motion inline in each animation style's `@media` block. Decision: keep the inline approach (it's self-contained). Also export a standalone `reducedMotion` class for consumers that need to apply it manually.

### R14. Animations barrel (`src/common/animations/index.ts`)
Currently an empty stub. Should be populated with re-exports of easing, keyframes, variants, and LazyMotionProvider. Not explicitly a task — handle during domain review.

### R15. SPEC CONTRADICTION RESOLVED: Task specs reference stale type/status counts
Multiple task specs were written before the `task` InputType and `queued` status were added to the architecture. They reference "six types" and "four statuses" instead of seven and five. **Resolution (confirmed by user):** update all task specs to match the architecture. The architecture doc is authoritative — task specs that disagree on counts, enumerations, or type lists must be updated to match. Reviewers encountering stale counts in task specs should treat the architecture as the tiebreaker, not flag as SPEC CONTRADICTION, provided the code follows the architecture correctly.

## NEEDS USER REVIEW

None — all items resolved with obvious paths.
