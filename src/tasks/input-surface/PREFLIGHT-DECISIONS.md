# Preflight Decisions — input-surface

## Resolved

### R1. Classification schema: pipeline arrays, not single type + confidence
Architecture defines `{"types": ["sql", "python"], "alternatives": [["note"]]}`. All task specs reference the old `{"type": "sql", "confidence": 0.85, "alternatives": [...]}` schema. **Resolution:** Update store (task 01), service (task 05), preview (task 06), submit (task 07), and InputBar (task 08) to use the pipeline schema. Specifically:
- Store fields: `classifiedTypes: string[] | null`, `alternatives: string[][] | null`, `userOverrideTypes: string[] | null`
- Remove `confidence: number | null` — not in the architecture schema
- `resolvedTypes` derived as `userOverrideTypes ?? classifiedTypes`
- `CardCreationPayload.types: string[]` (array, not singular)

### R2. InputType: 7 types, hypothesis removed, chat added
All specs reference 6 types including hypothesis. Actual InputType is 7: `sql`, `python`, `literature`, `chat`, `note`, `dataIngest`, `task`. Hypothesis is not a type — hypothesis-like inputs decompose into actionable types. **Resolution:** Update all type references in specs and code. Reviewers should accept 7 types.

### R3. `data_ingest` vs `dataIngest` casing
Architecture uses `data_ingest` (wire format from classifier). Theme uses `dataIngest` (camelCase). **Resolution:** Classifier normalizes wire format to camelCase before storing. This normalization already exists in `classificationService.ts`. Keep it.

### R4. All code already exists — review/fix, not greenfield
All 8 tasks have existing implementations from the batch write. Review holistically.

### R5. `task` type missing from classifier
The classifier prompt and `normalizeType` map omit `task`. **Resolution:** Add `task` to the classifier's capability manifest and normalizeType map during task 05 review.

### R6. Chat type does NOT create a card
Architecture says chat redirects to conversational UI without creating a card. **Resolution:** Add a guard in submit flow (task 07): if `resolvedTypes` is `["chat"]`, skip card creation and trigger chat UI instead. The exact chat redirect mechanism is out of scope for input-surface (handled by a future chat domain).

### R7. Use `getOllamaUrl()` and `getApiBaseUrl()` from env.ts
Integration doc requires these instead of hardcoded URLs. **Resolution:** Fix during task 05 review.

### R8. Use design-system components where integration doc requires
- MentionPill should use `Chip` component (task 03)
- SuggestionDropdown should use theme token colors, not hardcoded hex (task 04)
- Submit button should use `Button` component (task 08)
- Classification preview should use `Chip` for type pills (task 06)

### R9. Confidence-based UX replaced by alternatives UX
Old: solid pill ≥0.80, dashed 0.50-0.79, multi-pill <0.50.
New per architecture: solid pill (single type), pipeline visualization (compound), dashed pill + dropdown (alternatives, rare), chat redirect.
**Resolution:** Rewrite classification preview (task 06) to match the new UX mapping.

### R10. Paste behavior: replace newlines with spaces (not strip)
Spec says "strip", implementation replaces with spaces. **Resolution:** Keep space replacement — it preserves word boundaries. Update spec.

### R11. `extensions` prop on SingleLineEditor
Not in task 02 spec but exists for Mention injection (task 03). **Resolution:** Accept as a forward-compatibility seam. Document in task 02 review.

### R12. Document schema: `content: 'paragraph'` vs `content: 'text*'`
Spec says `text*`, implementation uses `paragraph`. **Resolution:** Keep `paragraph` — it works correctly with TipTap's Mention nodes and ensures block-level structure. Update spec.

### R13. Prompt engineering is user's domain
The classification prompt content (few-shot examples, disambiguation rules, capability manifest) is being developed by the user in parallel. Don't get caught up on prompt engineering during reviews — focus on the structural/code aspects (schema, service interface, error handling, tests). Accept placeholder prompt content.

### R14. Missing tests across all tasks
Several spec-required tests are absent (paste flattening, editor.getText with mentions, suggestion dropdown renderer, empty-state paths). Add during reviews.

### R15. Auth token in API requests
Integration doc requires auth token from authStore. **Resolution:** The fetcher already handles this (fixed in app-shell domain review). Classification service API fallback should use the fetcher, not raw fetch.

## NEEDS USER REVIEW

None — all items resolved with obvious paths.
