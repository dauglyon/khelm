# Task 07: LazyMotion Provider

## Dependencies
- None (standalone Motion wrapper)

## Context
A single `<LazyMotionProvider>` at the app root provides code-split Motion features. It loads `domAnimation` synchronously (~4.6 KB, covers opacity/transform) and async-loads `domMax` (~25 KB, adds drag/layout FLIP) on first use. This avoids loading the full Motion bundle upfront.

## Implementation Requirements

### Files to Create
1. **`src/common/animations/LazyMotionProvider.tsx`** — App-level wrapper
2. **`src/common/animations/LazyMotionProvider.test.tsx`** — Tests

### `LazyMotionProvider.tsx`
- Import `LazyMotion` from `motion/react` (or `framer-motion` depending on package name)
- Import `domAnimation` synchronously for initial features
- Define async loader for `domMax`: `const loadDomMax = () => import('motion').then(mod => mod.domMax)` (adjust import path as needed for the `motion` package)
- Render `<LazyMotion features={domAnimation} strict>` wrapping `children`
- Accept `children: ReactNode` prop
- Export as named export `LazyMotionProvider`

**Note:** The `strict` prop ensures that components use `m` instead of `motion` for tree-shaking. Document this in a code comment.

### `LazyMotionProvider.test.tsx`
- Render `<LazyMotionProvider><div data-testid="child" /></LazyMotionProvider>`
- Verify the child renders
- Verify no errors are thrown during render

## Demo Reference
Not applicable (infrastructure wrapper, no visual output on its own).

## Integration Proofs
```bash
# Provider tests pass
npx vitest run --reporter=verbose src/common/animations/LazyMotionProvider.test.tsx

# Type-check
npx tsc --noEmit src/common/animations/LazyMotionProvider.tsx
```

## Acceptance Criteria
- [ ] `LazyMotionProvider` is exported as a named export
- [ ] Uses `LazyMotion` from the motion package with `domAnimation` features
- [ ] `strict` prop is enabled
- [ ] Children render correctly inside the provider
- [ ] Async `domMax` loader is defined (even if not triggered in tests)
- [ ] Tests pass: `npx vitest run src/common/animations/LazyMotionProvider.test.tsx`

## Anti-Patterns
- Do not import the full `motion` component set; use `m` components with LazyMotion
- Do not eagerly load `domMax`; it must be async
- Do not nest multiple LazyMotion providers; this is the single app-level one
- Do not add animation logic to the provider; it is a pure wrapper
