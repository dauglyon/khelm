# Task 07: SQL Body Renderer

## Dependencies

- **01-card-types**: `SqlContent`, `SqlResult`, `Column`, `Row`
- **06-body-registry-note**: `CardBody` registry (register SqlBody)
- **design-system**: typography tokens (`font.mono`, `mono` scale), `Badge` (for truncated indicator)

## Context

The SQL body renderer shows a code block with the SQL query followed by a scrollable result table (architecture/card.md > Body Rendering by Type > SQL). The code block uses JetBrains Mono. The result table renders column headers and rows, with a row count display and a "truncated" badge when the result is truncated.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/bodies/SqlBody.tsx`** (~120 lines)
2. **`src/features/cards/bodies/SqlBody.css.ts`** (~60 lines)
3. **`src/features/cards/__tests__/SqlBody.test.tsx`** (~90 lines)

### Component Props

```typescript
interface SqlBodyProps {
  content: SqlContent;
  result: SqlResult | null;
  status: CardStatus;
  streamingContent?: string;
}
```

### Rendering Structure

| Section | Detail |
|---------|--------|
| Query code block | `<pre><code>` with `content.query`. Font: JetBrains Mono (14px). Background: slightly darker than surface. Horizontal scroll for long lines. |
| Data source label | Small caption showing `content.dataSource` below the code block |
| Result table | HTML `<table>` with `<thead>` (column names from `result.columns`) and `<tbody>` (data from `result.rows`). Scrollable both horizontally and vertically. |
| Row count | Text below table: "{rowCount} rows" |
| Truncated badge | `Badge` or `Chip` showing "Truncated" when `result.truncated === true` |
| No result state | When `result === null` and `status` is `thinking` or `running`, show skeleton/placeholder |
| Error state | When `status === 'error'`, result section is absent (error shown by card shell) |

### Table Behavior

- Column headers sticky during vertical scroll
- Max visible height: 400px, then vertical scroll
- Cell text truncated with ellipsis at 200px max-width; full text on hover (title attribute)
- Alternating row background for readability (every other row slightly darker)

### Styles

- Code block: `padding: 12px`, `borderRadius: 4px`, `backgroundColor: color.bg`, `fontFamily: vars.font.mono`, `fontSize: 14px`, `lineHeight: 1.6`, `overflowX: auto`
- Table: `width: 100%`, `borderCollapse: collapse`
- Table header: `fontWeight: 600`, `fontSize: 13px`, `textAlign: left`, `padding: 8px 12px`, sticky top
- Table cell: `padding: 8px 12px`, `fontSize: 13px`, `borderBottom: 1px solid vars.color.border`

## Demo Reference

**Vignette 1**: SQL card shows `SELECT sample_id, organism FROM metagenomes WHERE depth > 100` in a monospace code block. Below it, a table with columns `sample_id` and `organism` and 25 rows of data. Footer shows "25 rows".

**Vignette 2**: SQL result is truncated. Same as above, but footer shows "1000 rows" with a yellow "Truncated" badge.

## Integration Proofs

1. **Render test**: Render `SqlBody` with mock content and result. Assert code block shows query text. Assert table has correct number of columns and rows.
2. **Truncated badge test**: Render with `result.truncated: true`. Assert "Truncated" badge is visible.
3. **No result test**: Render with `result: null` and `status: 'running'`. Assert placeholder/skeleton shown instead of table.
4. **Data source test**: Render with `content.dataSource: 'nmdc'`. Assert "nmdc" label appears.
5. **Row count test**: Render with `result.rowCount: 42`. Assert "42 rows" text visible.
6. **Long query scroll test**: Render with a 200-character single-line query. Assert code block has horizontal scroll (overflow-x: auto).

## Acceptance Criteria

- [ ] Query renders in JetBrains Mono code block
- [ ] Data source label displayed below code block
- [ ] Result table renders with column headers and rows
- [ ] Column headers are sticky during vertical scroll
- [ ] Row count displayed below table
- [ ] "Truncated" badge shown when `result.truncated === true`
- [ ] Placeholder shown when result is null during thinking/running
- [ ] Table scrolls horizontally and vertically
- [ ] Alternating row backgrounds for readability
- [ ] All tests pass

## Anti-Patterns

- Do not use a third-party data grid library -- plain HTML table is sufficient for v1
- Do not implement sorting or filtering -- out of scope
- Do not syntax-highlight SQL in the code block yet -- plain monospace is sufficient for this task
- Do not hardcode font values -- use `vars.font.mono` token
- Do not render the table if fewer than 1 row exists in the result
