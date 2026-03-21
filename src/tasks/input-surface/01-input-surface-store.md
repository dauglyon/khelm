# 01 -- Input Surface Zustand Store

## Dependencies

| Dependency | Type | What it provides |
|------------|------|------------------|
| design-system | cross-domain | Input type color tokens (for type validation) |

## Context

The input surface manages its own state via Zustand, not global Redux. This store holds classification results, user overrides, and submission status. It is consumed by the editor, classification preview, and submit flow.

Reference: `architecture/input-surface.md` section 7 (State).

## Implementation Requirements

### Files to create

1. `src/features/input-surface/store/useInputSurfaceStore.ts` -- Zustand store definition
2. `src/features/input-surface/store/useInputSurfaceStore.test.ts` -- Unit tests

### Store shape

```ts
interface InputSurfaceState {
  classifiedType: InputType | null;
  confidence: number | null;
  alternatives: Array<{ type: InputType; confidence: number }>;
  userOverrideType: InputType | null;
  isClassifying: boolean;
  isSubmitting: boolean;
  classifierMode: 'local' | 'api';
}
```

Where `InputType` is `'sql' | 'python' | 'literature' | 'hypothesis' | 'note' | 'data_ingest'`.

### Actions to define

| Action | Behavior |
|--------|----------|
| `setClassification(result)` | Sets `classifiedType`, `confidence`, `alternatives`; clears `userOverrideType` |
| `setUserOverride(type)` | Sets `userOverrideType` |
| `clearUserOverride()` | Resets `userOverrideType` to null |
| `setIsClassifying(flag)` | Sets loading state |
| `setIsSubmitting(flag)` | Sets submission state |
| `setClassifierMode(mode)` | Sets `'local'` or `'api'` |
| `reset()` | Resets all fields to initial state |
| `resolvedType` | Derived: returns `userOverrideType ?? classifiedType` |

### Key constraints

- `resolvedType` is a derived getter (not stored), computed as `userOverrideType ?? classifiedType`.
- `setClassification` must clear `userOverrideType` so stale overrides do not persist across reclassifications.
- Export the `InputType` union type for use by other input-surface modules.

## Demo Reference (Vignette 1 -- The Core Loop)

The store is the backbone of the input-to-card loop. When the user types, the classifier writes to the store. The preview reads from the store. On submit, the resolved type is read from the store and included in the card creation payload.

## Integration Proofs

```bash
# Store initializes with null classification
vitest run src/features/input-surface/store --reporter=verbose

# Verify: setClassification populates all three fields
# Verify: setUserOverride takes precedence in resolvedType
# Verify: setClassification clears userOverrideType
# Verify: reset() returns to initial state
```

## Acceptance Criteria

- [ ] Zustand store exports `useInputSurfaceStore` hook
- [ ] `InputType` union type is exported
- [ ] `resolvedType` returns `userOverrideType` when set, otherwise `classifiedType`
- [ ] `setClassification` clears any prior `userOverrideType`
- [ ] `reset()` returns all fields to initial values
- [ ] All actions are tested individually
- [ ] Store does not depend on React rendering (pure Zustand, testable outside components)

## Anti-Patterns

- Do not put editor content (TipTap JSON) in this store. The editor instance is the source of truth for content.
- Do not use Redux or RTK. The input surface uses Zustand per architecture spec.
- Do not make `resolvedType` a stored field that needs manual sync. Derive it.
