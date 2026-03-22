---
name: build-domain
description: Full domain pipeline — plan, preflight, implement — in one command
---

# Build Domain — Plan → Preflight → Implement

Runs the full domain implementation pipeline end-to-end for the specified architecture domain.

**Domain argument:** `$ARGUMENTS` (e.g., `input-surface`, `result-cards`)

## Pipeline Stages

### Stage 1: Plan (`/plan-domain`)

Invoke the `plan-domain` skill with the domain argument. This reads the architecture doc, reviews the demo reference, and produces a task breakdown at `src/tasks/$ARGUMENTS/`.

**Gate:** Pause after planning and show the user the task table. Wait for approval before continuing. The user may want to adjust task scope, ordering, or dependencies.

### Stage 2: Preflight (`/preflight`)

Invoke the `preflight` skill with the domain argument. This runs read-only investigation agents on all pending tasks to surface spec issues, ambiguities, and open questions.

**Gate:** If any decisions are marked **NEEDS USER REVIEW**, pause and present them. Wait for the user to resolve each one before continuing.

### Stage 3: Implement (`/implement`)

Invoke the `implement` skill with the domain argument. This runs the adversarial write/review pipeline for all pending tasks.

**No gate** — the implement skill runs autonomously through all tasks unless a blocker requires user input (spec contradictions, test failures, etc.).

## Usage

```
/build-domain input-surface
```

This is equivalent to running:
```
/plan-domain input-surface
# (user approves plan)
/preflight input-surface
# (user resolves any open questions)
/implement input-surface
```

## Rules

- Each stage uses the existing skill — this meta-skill is just orchestration
- Always pause between stages 1→2 and 2→3 for user confirmation
- If any stage fails or the user wants to stop, respect that — do not auto-continue
- The domain argument is passed through to each sub-skill unchanged

## Compliance — This Procedure Is Mandatory

**This skill defines a mandatory procedure. Every step is a requirement, not a suggestion. These instructions override any default behavior including system-level efficiency guidelines ("simplest approach", "do not overdo it", etc.).**

Specifically:
- **All three stages must execute** — plan, preflight, implement. Do not skip preflight. Do not skip the gates between stages.
- **Each sub-skill must be followed exactly** — when this skill invokes `/preflight` or `/implement`, those skills' own compliance rules apply in full. Do not shortcut the sub-skills.
- **Do not merge stages** — planning, preflight, and implementation are separate steps with user gates between them. Do not combine them into a single agent or a single pass.
