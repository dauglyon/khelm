---
name: preflight
description: Batch preflight investigation of all pending tasks in a domain before implementation
---

# Preflight — Batch Spec Investigation

Runs read-only preflight agents on all pending tasks in a domain to surface spec issues, missing types, ambiguities, and open questions before implementation begins.

**Domain argument:** `$ARGUMENTS` (e.g., `input-surface`)

## Prerequisites

- `/plan-domain $ARGUMENTS` has already run
- Task specs exist at `src/tasks/$ARGUMENTS/README.md` and `src/tasks/$ARGUMENTS/NN-*.md`

## Procedure

### Step 1: Load Task List

Read `src/tasks/$ARGUMENTS/README.md`. Identify all tasks with status `pending`.

### Step 2: Launch Parallel Preflight Agents

For each pending task, spawn a **read-only sonnet** subagent in the background. All agents run in parallel since they only read — no working tree conflicts.

**Preflight agent prompt:**
```
You are pre-flighting a task spec before implementation begins. READ-ONLY investigation only.

Read the task spec at `src/tasks/$ARGUMENTS/NN-{slug}.md` and the architecture doc at `architecture/$ARGUMENTS.md`.

## Investigation Checklist
1. **Spec vs architecture and existing code** — contradictions between the task spec, the architecture doc, or the existing codebase? Verify that names, types, and signatures the spec references actually exist and match.
2. **Integration requirements** — read any `INTEGRATION-*.md` files in `src/tasks/$ARGUMENTS/`. Does this task's spec fully account for relevant upstream integration requirements? Missing or partially covered integration requirements are findings.
3. **Missing types** — upstream deps that don't exist yet or have different signatures?
4. **Ambiguities** — decisions the writer must make?
5. **Edge cases** — tricky scenarios the spec doesn't mention?
6. **Internal spec contradictions** — do any acceptance criteria, integration proofs, or constraints contradict each other?
7. **Open questions** — anything that needs a user decision?

## Rules
- **READ-ONLY**: Use only Read, Glob, and Grep tools. Do NOT use Edit, Write, Bash.
- Keep output concise: bullet points
- Focus on findings that would cause a review REJECT if missed

## Output
- **Spec vs code mismatches**, **Integration gaps**, **Spec vs architecture conflicts**, **Missing types**, **Ambiguities**, **Internal contradictions**, **Edge cases**, **Open questions**
Or: "PREFLIGHT CLEAR — no issues found."
```

### Step 3: Collate Results

As agents complete, collate all findings into a single decision document. For each finding:
- **Obvious path** → resolve it, document the decision
- **Needs user input** → mark as **NEEDS USER REVIEW**

### Step 4: Write Decision Document

Write `src/tasks/$ARGUMENTS/PREFLIGHT-DECISIONS.md` with two sections:
1. **Resolved** — decisions taken where the path was obvious
2. **NEEDS USER REVIEW** — items requiring user confirmation

### Step 5: Update Task Table

Update `src/tasks/$ARGUMENTS/README.md` Preflight column to `done` for all preflighted tasks.

### Step 6: Present to User

Present the **NEEDS USER REVIEW** items to the user for resolution. Once resolved, update the decision document.

## Rules

- **All agents are read-only** — Read, Glob, Grep only. No Edit, Write, Bash.
- **All agents run in parallel** — they only read, no working tree conflicts.
- **Preflight is advisory** — it surfaces issues but does not block implementation.
- **Obvious decisions are resolved by the orchestrator** — only genuinely ambiguous items go to the user.
- **Decision document persists** — `/implement` reads it (Step 1.5) and incorporates decisions into writer prompts.
