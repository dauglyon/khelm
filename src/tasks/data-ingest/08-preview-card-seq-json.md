# Task 08: Preview Card Body -- Sequence and JSON

## Summary

Implement preview card body components for sequence files (FASTA, FASTQ) and JSON files. Sequence cards show record counts, average lengths, quality summaries, and sample records. JSON cards show structure shape, key listings, and sample entries.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 01 (ingest-store) | in-domain | `useIngestFile` selector, `IngestFile`, `SequenceRecord`, `PreviewResult` types |
| 04 (sequence-json-parsers) | in-domain | Parsed `PreviewResult` with `sampleRecords` (sequence) or `structure` (JSON) |
| design-system | cross-domain | Card primitive, Badge, Button, theme tokens (`color.inputType.dataIngest.*`) |
| card | cross-domain | Card body rendering pattern |

## Context

Sequence and JSON files have different preview layouts than tabular files. FASTA/FASTQ show biological sequence records with headers and lengths. JSON shows the document structure. Both share the same card chrome (header, footer, type badge) but have distinct body content.

Architecture reference: `architecture/data-ingest.md` section 5 (Preview Card).

## Demo Reference (Vignette 3)

> ...creates a preview card.

For sequence files, scientists need to quickly verify they have the right data: sequence count, organism names in headers, expected lengths. For JSON, they need to see the data shape.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/PreviewCardSequence.tsx` | FASTA/FASTQ preview card body | ~130 |
| `src/features/data-ingest/PreviewCardJson.tsx` | JSON preview card body | ~120 |
| `src/features/data-ingest/PreviewCardSeqJson.test.tsx` | Tests for both components | ~250 |

### Sequence preview body (FASTA and FASTQ)

| Section | Content |
|---------|---------|
| Summary stats | Record count (from sample), average sequence length |
| Quality summary | FASTQ only: mean quality score, min/max quality (computed from SequenceRecord quality strings) |
| Sample records | First 3 records rendered as collapsible sections |

### Sample record rendering

Each `SequenceRecord` rendered as:

```
[Header]     >sequence_1 Escherichia coli 16S rRNA
[Length]     1,542 bp
[Sequence]   ATCGATCG... (first 80 chars, truncated with ellipsis)
[Quality]    IIIIIIII... (FASTQ only, first 80 chars)
```

- Sequence text rendered in monospace font (JetBrains Mono via theme)
- Records are collapsible -- header always visible, sequence/quality expand on click
- Default: first record expanded, rest collapsed

### JSON preview body

| Section | Content |
|---------|---------|
| Structure | Shape badge: "Object", "Array", or "Primitive" |
| Keys | For objects: list of top-level keys as chips |
| Array info | For arrays: element count, element type (if homogeneous) |
| Sample | For objects: key-value pairs of first 5 keys. For arrays: first 3 elements. For array-of-objects: table view (reuse tabular table) |

### JSON structure display

```typescript
// Object
{ shape: 'object', keys: ['name', 'samples', 'metadata'] }
// --> Show: "Object with 3 keys: name, samples, metadata"

// Array
{ shape: 'array', elementCount: 150 }
// --> Show: "Array with 150 elements"

// Array of objects (special case)
// --> Show table with keys as columns, first 3 elements as rows
```

### Card footer (shared with tabular)

| Element | Behavior |
|---------|----------|
| Upload button | Triggers upload (dispatches to upload manager) |
| Cancel button | Removes file from store and workspace |

## Integration Proofs

```bash
# Renders FASTA summary stats
npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx -t "renders fasta summary stats"

# Renders FASTQ with quality summary
npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx -t "renders fastq quality summary"

# Renders first 3 sequence records
npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx -t "renders first 3 sequence records"

# Sequence records are collapsible
npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx -t "sequence records collapse and expand"

# Renders JSON object structure
npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx -t "renders json object with keys"

# Renders JSON array info
npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx -t "renders json array with element count"

# JSON array-of-objects renders as table
npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx -t "json array of objects renders table"

# Upload and cancel buttons present
npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx -t "footer has upload and cancel buttons"
```

## Acceptance Criteria

- [ ] `PreviewCardSequence` handles both FASTA and FASTQ via `fileType` prop
- [ ] Summary stats show record count and average sequence length
- [ ] FASTQ-specific quality summary rendered only for FASTQ files
- [ ] First 3 records displayed with collapsible UI (first expanded by default)
- [ ] Sequence text uses monospace font from theme tokens
- [ ] Sequences truncated at 80 characters with ellipsis
- [ ] `PreviewCardJson` renders structure shape (object/array/primitive)
- [ ] Object keys displayed as chips
- [ ] Array-of-objects: rendered as table with keys as columns
- [ ] Both components read from `useIngestFile(id)` selector
- [ ] Upload and cancel buttons in footer wire to store actions
- [ ] All colors use design system tokens
- [ ] All tests pass: `npx vitest run src/features/data-ingest/PreviewCardSeqJson.test.tsx`

## Anti-Patterns

- Do NOT render full sequence text -- truncate at 80 characters
- Do NOT expand all records by default -- only the first one
- Do NOT compute statistics in the component -- compute in the parser (task 04) or derive during render from existing data
- Do NOT duplicate the tabular table component for JSON array-of-objects -- import or share the table component from task 07
- Do NOT use raw hex colors or inline styles
