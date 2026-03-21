---
name: plan-domain
description: Read an architecture domain doc and produce a task breakdown for implementation
---

# Plan Domain — Architecture Doc → Task Breakdown

Read the specified architecture domain doc and produce a prioritized task breakdown with individual task specs.

**Domain argument:** `$ARGUMENTS` (e.g., `input-surface`, `result-cards`, `collaboration`)

## Procedure

### Step 1: Read Architecture Context

1. Read `architecture/$ARGUMENTS.md` — the domain specification
2. Read `architecture/README.md` — cross-cutting context (layers diagram, domain index, design tokens)
3. Read any `src/tasks/$ARGUMENTS/INTEGRATION-*.md` files — integration requirements from already-completed upstream domains. Each file describes work that THIS domain must do to properly wire in the upstream domain's code. These requirements MUST be incorporated as tasks or acceptance criteria in the generated breakdown.

### Step 2: Review Demo Reference

Review the animated demo in `index.html` for visual and interaction patterns relevant to this domain. The demo is the visual reference — note interaction flows, animations, and UI patterns but do not copy its bundled implementation.

### Step 3: Identify Implementation Targets

Determine what packages/modules this domain maps to. Reference the technology decisions in `architecture/README.md`:

- What source directories and modules will be created or modified
- What external dependencies are needed (services, APIs, databases, etc.)

### Step 4: Generate Task Breakdown

Create `src/tasks/$ARGUMENTS/README.md` with:

```markdown
# {Domain Name} — Task Breakdown

## Domain Overview
{1 paragraph: what this domain does, from the architecture doc}

## Implementation Targets
| Target | Path | Dependencies |
|--------|------|-------------|
| {package/module} | src/{path}/ | {other modules it depends on} |

## Task Table
| ID | Summary | Deps | Status | Preflight |
|----|---------|------|--------|-----------|
| 00 | {first task} | none | pending | — |
| 01 | {second task} | 00 | pending | — |

## Critical Path
{ASCII diagram of task dependency DAG}

## Parallelism Opportunities
{Which tasks can run concurrently, organized into waves}
```

### Step 5: Generate Individual Task Specs

For each task, create `src/tasks/$ARGUMENTS/NN-{slug}.md`:

```markdown
# Task NN: {Summary}

## Dependencies
{List task IDs that must complete first}

## Context
{Relevant architecture doc section — quote or summarize}

## Implementation Requirements
- {Specific types, components, functions to create}
- {Module structure}
- {Error handling approach}

## Demo Reference
- What the demo shows for this feature (interaction patterns, visual design)
- Which vignette(s) are relevant

## Integration Proofs
- {Specific test commands that verify real behavior}
- {User scenarios — not just happy path: errors, empty states, edge cases}
- "Page renders" is NOT a proof — each test must complete a user scenario and assert on a meaningful outcome

## Acceptance Criteria
- [ ] {Concrete, verifiable criterion}
- [ ] {Another criterion}

## Anti-Patterns
- Do NOT {specific thing to avoid}
```

### Step 6: Commit

After all task spec files are written, commit them:
`plan($ARGUMENTS): task breakdown for {domain name}`

## Rules

- Tasks are small: 1-3 files, <500 lines each
- Each task compiles and tests independently
- Cross-domain dependencies are explicit (don't assume other domains are implemented)
- Every task has integration proofs (not just "it compiles")
- Architecture doc is authoritative for behavior and structure — if the demo disagrees, follow the architecture doc
- The demo is authoritative for visual design — tokens, colors, typography, animations
