# Task 07: Preview Card Body -- Tabular

## Summary

Implement the preview card body component for tabular file types (CSV, TSV, Excel). Renders a schema table with column names, inferred types as editable dropdowns, and sample values, followed by a data sample table showing the first N rows.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 01 (ingest-store) | in-domain | `useIngestFile` selector, `IngestFile` type, `Column`, `ColumnType` |
| 05 (schema-inference) | in-domain | Columns with `inferredType` populated |
| design-system | cross-domain | Card primitive, Select component, Badge, theme tokens (`color.inputType.dataIngest.*`) |
| card | cross-domain | Card body rendering pattern, card container integration |

## Context

The preview card appears on the workspace immediately after schema preview completes. For tabular files, it shows a two-section layout: a schema preview table (column name, inferred type, sample values) and a data sample table. Users can override inferred types via dropdowns before uploading.

Architecture reference: `architecture/data-ingest.md` section 5 (Preview Card).

## Demo Reference (Vignette 3)

> ...creates a preview card. The ingested data is immediately queryable.

The preview card is the user's first look at their data. Column types must be clear and editable. Sample data must be immediately visible.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/PreviewCardTabular.tsx` | Tabular preview card body | ~180 |
| `src/features/data-ingest/PreviewCardTabular.css.ts` | vanilla-extract styles | ~60 |
| `src/features/data-ingest/PreviewCardTabular.test.tsx` | Component tests | ~200 |

### Component structure

```
PreviewCardTabular
  SchemaTable
    SchemaRow[] (column name, type dropdown, sample values)
  SampleDataTable
    TableHeader (column names)
    TableRows (first N rows of data)
  CardFooter
    UploadButton
    CancelButton
```

### Schema table

| Column | Content |
|--------|---------|
| Name | Column name from parser output |
| Type | Editable `<Select>` dropdown with all `ColumnType` options; pre-selected to inferred type |
| Sample | First 3 non-null values from sample data, comma-separated |

### Type dropdown options

| Value | Label |
|-------|-------|
| `integer` | Integer |
| `float` | Float |
| `boolean` | Boolean |
| `date` | Date |
| `categorical` | Categorical |
| `string` | String |

### Type override behavior

When a user changes a column type:
1. Update the column's type in the ingest store via `updateFile(id, { schema: updatedColumns })`
2. No re-inference -- the user's choice is final
3. Visual: the dropdown reflects the new selection immediately

### Data sample table

- Renders first 10 rows from `sampleRows`
- Column headers match the schema table column names
- Cell values displayed as strings; long values truncated with ellipsis
- Horizontal scroll if columns exceed card width

### Card footer

| Element | Behavior |
|---------|----------|
| Upload button | Triggers upload (dispatches to task 09 upload manager) |
| Cancel button | Removes the file from the ingest store and the card from the workspace |

### Card appearance (from architecture)

| Element | Detail |
|---------|--------|
| Card type color | Foreground `#2D8E8E`, Background `#E0F2F2`, Border `#A8D6D6` (via `color.inputType.dataIngest` tokens) |
| Header | File name, detected type badge (e.g., "CSV"), file size |
| Error state | Parse errors shown inline with suggestions |

## Integration Proofs

```bash
# Renders schema table with column names and types
npx vitest run src/features/data-ingest/PreviewCardTabular.test.tsx -t "renders schema table with columns"

# Type dropdown allows override
npx vitest run src/features/data-ingest/PreviewCardTabular.test.tsx -t "type dropdown updates column type"

# Renders sample data table
npx vitest run src/features/data-ingest/PreviewCardTabular.test.tsx -t "renders sample data rows"

# Shows parse errors inline
npx vitest run src/features/data-ingest/PreviewCardTabular.test.tsx -t "shows parse errors"

# Upload button triggers upload action
npx vitest run src/features/data-ingest/PreviewCardTabular.test.tsx -t "upload button triggers upload"

# Cancel button removes file
npx vitest run src/features/data-ingest/PreviewCardTabular.test.tsx -t "cancel button removes file"
```

## Acceptance Criteria

- [ ] Component reads from `useIngestFile(id)` selector -- re-renders only when that file changes
- [ ] Schema table renders one row per column with name, type dropdown, and sample values
- [ ] Type dropdown is pre-populated with the inferred type and allows override to any `ColumnType`
- [ ] Type override persists to ingest store via `updateFile`
- [ ] Data sample table renders first 10 rows with horizontal scroll
- [ ] Long cell values truncated with ellipsis (CSS `text-overflow: ellipsis`)
- [ ] Card header shows file name, type badge, and human-readable file size
- [ ] Parse errors displayed inline below schema table
- [ ] Upload button present in footer (click handler wires to upload manager)
- [ ] Cancel button removes file from store and workspace
- [ ] All colors use design system tokens (`color.inputType.dataIngest.*`)
- [ ] All tests pass: `npx vitest run src/features/data-ingest/PreviewCardTabular.test.tsx`

## Anti-Patterns

- Do NOT fetch data from the file again -- all data comes from the `PreviewResult` in the store
- Do NOT render more than 10 sample rows -- the preview is a summary
- Do NOT inline CSS -- use vanilla-extract styles
- Do NOT put upload logic in this component -- the button dispatches an action; upload manager (task 09) handles the rest
- Do NOT use raw hex colors -- reference theme tokens
