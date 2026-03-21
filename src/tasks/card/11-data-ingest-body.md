# Task 11: Data Ingest Body Renderer

## Dependencies

- **01-card-types**: `DataIngestContent`, `DataIngestResult`, `SchemaField`, `Row`
- **06-body-registry-note**: `CardBody` registry (register DataIngestBody)
- **design-system**: typography tokens, `Skeleton` (progress placeholder)

## Context

The Data Ingest body renderer shows a two-section layout (architecture/card.md > Body Rendering by Type > Data Ingest): a schema preview (field name, inferred type, sample values) as a compact table, followed by a data sample table showing the first N rows. During `running` status, an upload progress bar is shown.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/bodies/DataIngestBody.tsx`** (~140 lines)
2. **`src/features/cards/bodies/DataIngestBody.css.ts`** (~70 lines)
3. **`src/features/cards/__tests__/DataIngestBody.test.tsx`** (~90 lines)

### Component Props

```typescript
interface DataIngestBodyProps {
  content: DataIngestContent;
  result: DataIngestResult | null;
  status: CardStatus;
  uploadProgress?: number; // 0-100, provided during upload
}
```

### SchemaField Type

```typescript
interface SchemaField {
  name: string;
  inferredType: string;   // e.g., 'string', 'number', 'date', 'boolean'
  sampleValues: string[]; // 2-3 sample values for preview
  nullable: boolean;
}
```

### Rendering Structure

| Section | Detail |
|---------|--------|
| File info header | Shows `content.fileName`, formatted `content.fileSize` (e.g., "2.4 MB"), `content.mimeType` |
| Progress bar | During `status === 'running'`: a horizontal progress bar showing `uploadProgress%`. Animated fill. |
| Schema preview table | Compact table: columns are "Field", "Type", "Nullable", "Sample Values". One row per `SchemaField`. |
| Sample data table | Standard table showing `result.sampleRows` with column headers derived from schema field names. Max 10 rows. |
| Total rows count | "Total: {totalRows} rows" below the sample table |
| Upload ID | Small muted text showing `result.uploadId` (for debugging/reference) |
| No result | When `result === null` and status is thinking, show skeleton; when running, show progress bar |

### Progress Bar

- Container: full width, `height: 6px`, `borderRadius: 3px`, `backgroundColor: vars.color.border`
- Fill: `height: 100%`, `borderRadius: 3px`, `backgroundColor: vars.color.inputType.dataIngest.fg`
- Width: `{uploadProgress}%`
- Transition: `width 200ms ease-out`

### Schema Preview Table

```
┌─────────────┬──────────┬──────────┬─────────────────────┐
│ Field       │ Type     │ Nullable │ Sample Values       │
├─────────────┼──────────┼──────────┼─────────────────────┤
│ sample_id   │ string   │ no       │ SMP001, SMP002      │
│ depth_m     │ number   │ no       │ 10.5, 23.1          │
│ collected   │ date     │ yes      │ 2024-01-15, null    │
└─────────────┴──────────┴──────────┴─────────────────────┘
```

### File Size Formatting

Format bytes into human-readable: B, KB, MB, GB. Use 1 decimal place for MB and above.

### Styles

- File info: `display: flex`, `gap: 12px`, `alignItems: center`, `fontSize: bodySm`, `color: vars.color.textMid`
- Schema table: compact styling, smaller font (`fontSize: 13px`), `borderCollapse: collapse`
- Schema type column: `fontFamily: vars.font.mono`, `fontSize: monoSm`
- Sample values: `color: vars.color.textLight`, comma-separated
- Section divider: `borderTop: 1px solid vars.color.border`, `margin: 12px 0`

## Demo Reference

**Vignette 1**: Data Ingest card shows "metagenome_samples.csv (2.4 MB, text/csv)" at the top. Below, a schema preview table shows 5 fields with inferred types. Below that, a sample data table shows 5 rows. Footer: "Total: 15,234 rows".

**Vignette 2**: Upload in progress. File info shows at top. A progress bar at 67% fills across the card. Schema and sample tables are not yet visible (replaced by skeleton).

## Integration Proofs

1. **Render test**: Render with complete result. Assert file info, schema table, and sample table all visible.
2. **Progress bar test**: Render with `status: 'running'`, `uploadProgress: 45`. Assert progress bar at 45%.
3. **Schema table test**: Render with 3 schema fields. Assert 3 rows in schema table with correct field names and types.
4. **Sample rows test**: Render with 5 sample rows. Assert 5 data rows visible.
5. **File size formatting test**: Render with `fileSize: 2500000`. Assert "2.4 MB" displayed.
6. **Total rows test**: Render with `totalRows: 15234`. Assert "Total: 15,234 rows" visible.
7. **No result test**: Render with `result: null`, `status: 'thinking'`. Assert skeleton shown.

## Acceptance Criteria

- [ ] File info (name, size, mime type) displayed at top
- [ ] File size formatted human-readable (KB, MB, GB)
- [ ] Progress bar shown during running status with correct percentage
- [ ] Schema preview table renders with field name, type, nullable, sample values
- [ ] Sample data table renders with column headers and rows
- [ ] Total row count displayed
- [ ] Skeleton placeholder shown when result is null
- [ ] Progress bar animates fill smoothly
- [ ] All styles use design tokens
- [ ] All tests pass

## Anti-Patterns

- Do not implement file upload logic -- this is a renderer; upload is in the data-ingest domain
- Do not parse files in this component -- schema and sample data come from `result`
- Do not show sample data table if `sampleRows` is empty
- Do not hardcode type colors -- use `vars.color.inputType.dataIngest.*` tokens
- Do not use a third-party progress bar component -- a simple styled div is sufficient
