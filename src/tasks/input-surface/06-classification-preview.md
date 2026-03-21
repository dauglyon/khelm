# 06 -- Classification Preview

## Dependencies

| Dependency | Type | What it provides |
|------------|------|------------------|
| 05 (classifier) | intra-domain | Classification results in store (`classifiedType`, `confidence`, `alternatives`) |
| 02 (editor) | intra-domain | Position reference for inline placement |
| 01 (store) | intra-domain | `useInputSurfaceStore` for reading classification state and writing overrides |
| design-system | cross-domain | Input type color tokens, easing tokens, button/pill primitives |

## Context

The classification preview is a live type indicator that shows the user what the system thinks their input is. It updates as classification results arrive in the store. Confidence level determines the visual treatment: solid pill (high), dashed border with alternatives (medium), or selectable pills (low). Clicking the indicator opens a type selector dropdown.

Reference: `architecture/input-surface.md` section 4 (Classification Preview).

## Implementation Requirements

### Files to create

1. `src/features/input-surface/classification-preview/ClassificationPreview.tsx` -- Type indicator and dropdown
2. `src/features/input-surface/classification-preview/classificationPreview.css.ts` -- vanilla-extract styles with confidence variants
3. `src/features/input-surface/classification-preview/ClassificationPreview.test.tsx` -- Unit tests

### Type indicator

| Aspect | Specification |
|--------|---------------|
| Position | Leading edge (left side) of the input bar, inline |
| Content | Type label: "SQL", "Python", "Literature", "Hypothesis", "Note", "Data Ingest" |
| Colors | Foreground, background, border from input type color tokens |
| Animation | Fade transition (150ms, `easing.inOut`) when type changes |
| Interaction | Clickable -- opens type selector dropdown |
| Empty state | Hidden when input text < 3 characters (no classification yet) |
| Loading state | Subtle pulse animation (CSS `@keyframes`) while `isClassifying` is true |

### Confidence-based UX

| Confidence | Visual | Behavior |
|------------|--------|----------|
| >= 0.80 | Solid background, solid border | Show type; no user action needed |
| 0.50 - 0.79 | Dashed border | Show type; clicking opens dropdown with alternatives |
| < 0.50 | No pre-selected type | Show top 2-3 alternatives as selectable pills |

### Type selector dropdown

| Aspect | Specification |
|--------|---------------|
| Trigger | Click the type indicator, or auto-open when confidence < 0.50 |
| Content | All six input types as selectable items, each with its color |
| Ordering | Classifier-ranked (highest confidence first) when alternatives available; alphabetical otherwise |
| Selection | Click to set `userOverrideType` in store; override persists until text changes significantly |
| Dismiss | Click outside, Escape, or select a type |

### Store interaction

| Read | Purpose |
|------|---------|
| `classifiedType` | Current classifier result |
| `confidence` | Determines visual treatment |
| `alternatives` | Populates dropdown ordering |
| `userOverrideType` | Shows user's override if set |
| `isClassifying` | Triggers loading pulse |

| Write | Purpose |
|-------|---------|
| `setUserOverride(type)` | When user selects a type from dropdown |

### Component API

```tsx
interface ClassificationPreviewProps {
  // No required props -- reads from Zustand store
  className?: string;
}
```

## Demo Reference (Vignette 1 -- The Core Loop)

As the user types "SELECT * FROM biosample...", the type indicator transitions from empty to "SQL" with a solid blue pill (high confidence). If the user types something ambiguous, the indicator shows a dashed border and the dropdown offers alternatives. The user can click to override.

## Integration Proofs

```bash
# Preview renders correct confidence-based UX
vitest run src/features/input-surface/classification-preview --reporter=verbose

# Verify: no indicator shown when classifiedType is null
# Verify: solid pill for confidence >= 0.80
# Verify: dashed border for confidence 0.50-0.79
# Verify: multiple selectable pills for confidence < 0.50
# Verify: clicking indicator opens dropdown with all 6 types
# Verify: selecting type in dropdown calls setUserOverride
# Verify: Escape dismisses dropdown
# Verify: pulse animation shown when isClassifying is true
# Verify: fade transition on type change (CSS class applied)
```

### Test setup

```ts
// Pre-populate store for each test scenario
const { result } = renderHook(() => useInputSurfaceStore());
act(() => {
  result.current.setClassification({
    type: 'sql',
    confidence: 0.92,
    alternatives: [{ type: 'python', confidence: 0.05 }],
  });
});
```

## Acceptance Criteria

- [ ] Type indicator renders at leading edge of input bar
- [ ] Indicator shows correct type label and colors from design tokens
- [ ] High confidence (>= 0.80): solid background and border
- [ ] Medium confidence (0.50-0.79): dashed border
- [ ] Low confidence (< 0.50): multiple selectable pills, no pre-selection
- [ ] Clicking indicator opens type selector dropdown
- [ ] Dropdown shows all 6 types with correct colors
- [ ] Dropdown items ordered by confidence (highest first)
- [ ] Selecting a type calls `setUserOverride` in store
- [ ] Dropdown dismisses on Escape, click outside, or selection
- [ ] Indicator hidden when no classification (< 3 chars typed)
- [ ] Pulse animation during `isClassifying`
- [ ] Fade transition (150ms, `easing.inOut`) when type changes
- [ ] Styles use vanilla-extract with design-system tokens

## Anti-Patterns

- Do not call the classifier from this component. Classification is triggered by the editor via the classification service (task 05).
- Do not store dropdown open/closed state in Zustand. Use local React state.
- Do not hardcode type colors. Use design-system tokens indexed by type.
- Do not skip the confidence-based visual differentiation. All three tiers must be distinct.
