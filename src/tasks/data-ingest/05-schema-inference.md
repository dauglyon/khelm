# Task 05: Schema Inference Engine

## Summary

Implement a column type inference engine that analyzes sample data from tabular previews (CSV, TSV, Excel) and assigns per-column type annotations. The engine checks types in priority order with a 90% confidence threshold.

## Dependencies

| Dependency | Type | What is needed |
|------------|------|---------------|
| 01 (ingest-store) | in-domain | `Column`, `ColumnType` types |
| 03 (tabular-parsers) | in-domain | `PreviewResult` with `columns` and `sampleRows` |

## Context

Schema inference runs on the sample rows produced by the tabular parsers. It annotates each column with an inferred type (integer, float, boolean, date, categorical, string) based on sampling heuristics. Users can override inferred types in the preview card (task 07), but inference provides sensible defaults.

Architecture reference: `architecture/data-ingest.md` section 4 (Schema Inference).

## Demo Reference (Vignette 3)

> ...infers the schema...

The inferred schema appears in the preview card as type badges next to each column name. Users see "integer", "float", "date", etc. and can change them via dropdown.

## Implementation Requirements

### Files

| File | Purpose | Est. lines |
|------|---------|-----------|
| `src/features/data-ingest/schemaInference.ts` | Inference engine | ~150 |
| `src/features/data-ingest/schemaInference.test.ts` | Unit tests with diverse column data | ~250 |

### Function signature

```typescript
function inferColumnTypes(columns: Column[], sampleRows: Record<string, unknown>[]): Column[]
```

Takes columns with placeholder types and sample data, returns columns with `inferredType` populated.

### Type detection rules (from architecture)

Check in this order -- first match at threshold wins:

| Priority | Type | Detection rule |
|----------|------|---------------|
| 1 | `integer` | All non-null values pass `Number.isInteger(parseFloat(v))` AND `parseFloat(v).toString() === v.trim()` |
| 2 | `float` | All non-null values pass `isFinite(parseFloat(v))` but fail integer check |
| 3 | `boolean` | All non-null values are in `{true, false, yes, no, 0, 1, t, f, y, n}` (case-insensitive) |
| 4 | `date` | >90% of non-null values parse via ISO 8601 regex or `Date.parse()` returning valid date |
| 5 | `categorical` | Unique value count / non-null row count < 0.1 AND base type is string |
| 6 | `string` | Default fallback |

### Inference rules

| Rule | Detail |
|------|--------|
| Sample size | All rows from the 64KB preview (up to 100 rows) |
| Null handling | Empty strings, `NA`, `N/A`, `null`, `NaN`, `-` treated as null; excluded from type checks |
| Confidence threshold | Column gets a non-string type only if >=90% of non-null values match |
| Mixed types | If no type reaches 90%, fall back to `string` |

### Null value set

```typescript
const NULL_VALUES = new Set(['', 'NA', 'N/A', 'null', 'NaN', '-']);
```

Case-insensitive matching for these values.

### Edge cases

- Column with all null values: type is `string`
- Column with 1 non-null value: apply type checks but note low confidence
- Column with values like `1.0`, `2.0`: should be `float`, not `integer` (fails the `.toString()` check)
- Column with `0` and `1` only: could be `integer` or `boolean`; integer wins by priority
- Date-like strings with inconsistent formats: trust `Date.parse()` but only if it returns a valid date in a reasonable range (year 1900-2100)
- Empty column (all rows null for that column): type is `string`

## Integration Proofs

```bash
# Infers integer column
npx vitest run src/features/data-ingest/schemaInference.test.ts -t "infers integer for whole number column"

# Infers float column
npx vitest run src/features/data-ingest/schemaInference.test.ts -t "infers float for decimal number column"

# Infers boolean column
npx vitest run src/features/data-ingest/schemaInference.test.ts -t "infers boolean for yes/no column"

# Infers date column
npx vitest run src/features/data-ingest/schemaInference.test.ts -t "infers date for ISO date column"

# Infers categorical column
npx vitest run src/features/data-ingest/schemaInference.test.ts -t "infers categorical for low-cardinality string column"

# Falls back to string for mixed types
npx vitest run src/features/data-ingest/schemaInference.test.ts -t "falls back to string for mixed types"

# Handles null values correctly
npx vitest run src/features/data-ingest/schemaInference.test.ts -t "excludes null values from type checks"

# Respects 90% confidence threshold
npx vitest run src/features/data-ingest/schemaInference.test.ts -t "requires 90 percent confidence"
```

## Acceptance Criteria

- [ ] `inferColumnTypes` is a pure function, no side effects
- [ ] Checks types in priority order: integer > float > boolean > date > categorical > string
- [ ] 90% confidence threshold: column must have >=90% non-null values matching a type to receive that type
- [ ] Null values (`''`, `NA`, `N/A`, `null`, `NaN`, `-`) excluded from type checks (case-insensitive)
- [ ] Integer check: `Number.isInteger(parseFloat(v))` AND `parseFloat(v).toString() === v.trim()`
- [ ] Float check: `isFinite(parseFloat(v))` but fails integer check
- [ ] Boolean check: value in `{true, false, yes, no, 0, 1, t, f, y, n}` (case-insensitive)
- [ ] Date check: ISO 8601 regex or `Date.parse()` returns valid date
- [ ] Categorical check: unique values / non-null count < 0.1 AND type would otherwise be string
- [ ] Default fallback is `string`
- [ ] Returns new `Column[]` with `inferredType` populated (does not mutate input)
- [ ] All tests pass: `npx vitest run src/features/data-ingest/schemaInference.test.ts`

## Anti-Patterns

- Do NOT mutate the input columns array -- return a new array
- Do NOT use regex-only date detection -- `Date.parse` is needed for format flexibility, but validate the result is in a sane range
- Do NOT hardcode column indices -- work with column names from the `Column` objects
- Do NOT skip the confidence threshold -- every type check must respect the 90% rule
- Do NOT treat `0`/`1` as boolean when they are integers -- integer has higher priority
