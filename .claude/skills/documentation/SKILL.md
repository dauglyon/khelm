---
name: documentation
description: Update architecture documentation after design changes, new decisions, or implementation discoveries
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
---

# Architecture Documentation

Comprehensively update the architecture documentation in `architecture/` when design changes, new decisions, or implementation discoveries require it.

## Inputs

- **change**: What changed (new decision, implementation discovery, design revision, new domain)
- **scope**: Which domain docs are affected (or "unknown" — the skill will determine)

## Architecture Structure

The documentation follows a progressive disclosure model:

| Tier | Files | Loaded | Purpose |
|------|-------|--------|---------|
| **1 — Entry point** | `architecture/README.md` | Always | Layers diagram, domain index, design tokens |
| **2 — Domain docs** | `architecture/<domain>.md` | On-demand per task | Prescriptive specs per domain |
| **3 — Reference** | `architecture/research/rsh-*.md` | On explicit need | Historical research, rationale |

## Workflow

### 1. Identify affected files

Read `architecture/README.md` to understand the current structure. Then determine which domain docs are affected by the change:

- If the change touches a single domain: read that domain doc
- If cross-cutting (e.g., design token change): grep across all domain docs for the affected term
- If adding a new domain: check if it fits in an existing doc or needs a new file

### 2. Read current state

Read each affected domain doc fully. Also read:
- `architecture/README.md` (always — check if layers diagram or design tokens need updating)
- Any referenced research docs if understanding rationale is needed

### 3. Make updates

Apply the change to every affected file. Follow these rules strictly:

**Content rules:**
- Tables over prose — use comparison/specification tables, not paragraphs
- Focus on WHAT to build, not WHY (rationale goes in research docs)
- Each domain doc is self-contained — an implementer should not need to read other domain docs to understand it
- Cross-references between domain docs: use filename only (e.g., "see `collaboration.md`"), not deep links

**Progressive disclosure rules:**
- README.md stays under 150 lines — it is the Tier 1 entry point
- Domain docs stay under 300 lines each (stretch to 400 only for genuinely complex domains)
- If a domain doc is growing past 300 lines, split it or move detail to a references/ subdirectory
- Never duplicate diagrams or tables across files — each appears in exactly one canonical location
- The domain index in README.md must have a 1-line description per domain doc

### 4. Verify consistency

After making changes, verify:

1. **Domain index**: If a domain doc's scope changed, update its description in README.md
2. **Design tokens**: If visual constants changed, update the design tokens section in README.md
3. **Cross-references**: Grep for the changed term across all `architecture/*.md` files to find stale references
4. **No duplication**: Confirm the changed content appears in exactly one canonical location
5. **Line counts**: Check that no file exceeds its budget

## Adding a New Domain Doc

If the change requires a new domain doc:

1. Create `architecture/<descriptive-slug>.md`
2. Add a row to the domain index in README.md
3. Keep the doc under 300 lines

## Rules

- Always read before writing — understand the current state of every file you modify
- One change, one pass — update ALL affected files in a single workflow, don't leave partial updates
- Test your grep — after updating, grep for the old term to confirm no stale references remain
