---
name: implement
description: Implement tasks from a domain's task list using adversarial write/review cycles
---

# Implement — TDD Write / Adversarial Review

Implements pending tasks from a domain's task list using subagent cycles: sonnet writes code (TDD), opus adversarially reviews. Fix cycles repeat until opus passes.

**Domain argument:** `$ARGUMENTS` (e.g., `input-surface`, `result-cards`)

## Prerequisites

- `/plan-domain $ARGUMENTS` has already run
- Task specs exist at `src/tasks/$ARGUMENTS/README.md` and `src/tasks/$ARGUMENTS/NN-*.md`

## Procedure

### Step 1: Load Task List

Read `src/tasks/$ARGUMENTS/README.md`. Identify all tasks with status `pending`, ordered by ID. Skip tasks whose dependencies are not `done`.

### Step 1.5: Preflight Decisions

Before starting implementation, check for `src/tasks/$ARGUMENTS/PREFLIGHT-DECISIONS.md`. If it exists, read it — it contains pre-resolved design decisions and open questions from a batch preflight investigation. Incorporate resolved decisions into the writer prompts as additional context. Flag any items marked **NEEDS USER REVIEW** and pause for user confirmation before the domain review (Step 5).

### Step 2: For Each Pending Task

Read the full task spec at `src/tasks/$ARGUMENTS/NN-{slug}.md`. Then run the write/review cycle below.

#### Phase A — Write (Sonnet Subagent)

Spawn a **sonnet** subagent with the **full task spec** pasted into the prompt (never summarized). Include these instructions:

```
You are implementing a task for The Helm.

## Task Spec
{paste entire task spec file contents here}

## Architecture (what to build)
{paste relevant sections from architecture/$ARGUMENTS.md}
The architecture doc defines the target design. Code must match its types, structures, and contracts for in-scope features.

## Instructions
1. Write tests FIRST (TDD). Tests must cover every acceptance criterion and integration proof listed in the spec.
2. Write the implementation to make the tests pass.
3. Run the integration proofs listed in the task spec and confirm they pass.
4. The animated demo in `index.html` is a visual reference — match its design tokens and interaction patterns, but do not copy its bundled code.

## Bash Command Rules

**ALLOWED:** A single command with only literal string arguments. No shell features.

**FORBIDDEN:** `&&` `||` `;` `|` `>` `>>` `<` `2>` `$()` `$VAR` `for` `while` `if` heredocs `nohup` `&` `sleep`

**If your command needs ANY forbidden feature:**
1. Write a script to `src/scripts/tmp-<name>.sh`
2. Run: `bash src/scripts/tmp-<name>.sh`
3. Delete: `rm src/scripts/tmp-<name>.sh`

Stop any background tasks you start before you finish.

## When Done
Report: which files you created/modified, which tests pass, which integration proofs pass.
```

#### Phase B — Review (Opus Subagent)

Spawn an **opus** subagent that has NOT seen the writer's conversation. Paste the task spec and instruct:

```
You are an adversarial code reviewer for The Helm. You will almost certainly REJECT this code.

## Task Spec
{paste entire task spec file contents here}

## Architecture (what to build)
{paste relevant sections from architecture/$ARGUMENTS.md}

**The task spec defines what is in scope. The architecture doc defines how in-scope features must look.** If the task spec is imprecise about a field name, type, or structure, the architecture doc is the tiebreaker. Read the full architecture doc yourself at `architecture/$ARGUMENTS.md` — the excerpt above may not include everything relevant.

## Your Role
This code was written by a cheaper, faster model that cuts corners. Experience shows it almost always produces code that is subtly wrong, incomplete, or non-compliant with the architecture. Your job is to find those faults. Most reviews end in REJECT — that is the normal, expected outcome.

## Review Checklist — Find Reasons to REJECT
Go through each item. A failure on ANY single item means REJECT.

1. **Acceptance criteria** — check every criterion in the task spec. Is each one genuinely met, or was it faked, stubbed, partially implemented, or satisfied only for the happy path?
2. **Architecture compliance** — read the full architecture doc (`architecture/$ARGUMENTS.md`). For in-scope features, cross-reference field-by-field: every field name, type, optionality, nesting, and structure must match the architecture doc. "Close enough" is a REJECT.
3. **Error handling** — are errors propagated with proper types, or swallowed, mapped to strings, or hidden behind silent catches?
4. **Edge cases** — empty inputs, concurrent access, failure paths, boundary values. Missing edge case handling is a REJECT.
5. **Test quality** — do tests assert on specific values and behaviors, or do they just check truthy/status codes? Weak tests are a REJECT.
6. **Anti-patterns** — does the code violate any anti-pattern listed in the task spec?
7. **Completeness** — is anything from the spec missing, deferred with TODO, or commented out?
8. **Integration proofs** — run all tests. Any test failure is a REJECT.
9. **Design token compliance** — do colors, fonts, spacing, and animations use the design tokens from `architecture/README.md`, or were they invented? Divergence from design tokens is a REJECT.

## Bash Command Rules

**ALLOWED:** A single command with only literal string arguments. No shell features.

**FORBIDDEN:** `&&` `||` `;` `|` `>` `>>` `<` `2>` `$()` `$VAR` `for` `while` `if` heredocs `nohup` `&` `sleep`

**If your command needs ANY forbidden feature:**
1. Write a script to `src/scripts/tmp-<name>.sh`
2. Run: `bash src/scripts/tmp-<name>.sh`
3. Delete: `rm src/scripts/tmp-<name>.sh`

Stop any background tasks you start before you finish.

## Verdict
REJECT is your default. Most code does not survive this review. That is by design.

There are no "minor observations", "non-blocking notes", or "minor deviations" — anything that should change is a REJECT. If you find something wrong, no matter how small, REJECT. Do not APPROVE with caveats.

APPROVE requires ALL of the following — if you are unsure about even one, REJECT:
- You personally ran every integration proof and they all passed
- Every single acceptance criterion is met without stubs, TODOs, or partial implementations
- Code matches architecture docs precisely in types, structures, and contracts
- Tests exercise real behavior with specific, meaningful assertions
- No swallowed errors, no missing edge cases, no anti-pattern violations
- You looked for problems and genuinely could not find any

If two parts of the spec contradict each other, that is always a REJECT. Flag it explicitly as "SPEC CONTRADICTION" so the orchestrator can escalate to the user for resolution.

Respond with exactly one of:
- REJECT — {numbered list of every issue, with file paths and line numbers}
- APPROVE — {what you checked that convinced you, and why you believe there are no remaining issues}
```

If opus returns **REJECT** (the expected outcome):
- If any issue is flagged as **SPEC CONTRADICTION**, stop and escalate to the user. The spec must be fixed before continuing. Do not attempt to resolve spec contradictions autonomously.
- Otherwise, spawn a **Phase A-Fix** agent (see template below). Then run Phase B again with the SAME clean prompt. **Every fix MUST be followed by a review.** Never accept a task after a fix without a clean APPROVE from Phase B. This cycle repeats until APPROVE.

#### Phase A-Fix — Fix Cycle (Sonnet Subagent)

Spawn a **sonnet** subagent with the **exact same full context as Phase A** (task spec, architecture context, preflight decisions, bash rules) **plus** the rejection list appended. The fix agent must have all the same context the original writer had — never summarize or condense the task spec for fix agents.

```
You are fixing code review issues for The Helm.

## Task Spec
{paste entire task spec file contents here — same as Phase A}

## Architecture Context
{paste relevant sections from architecture/$ARGUMENTS.md — same as Phase A}

## Preflight Decisions
{paste relevant preflight decisions — same as Phase A}

## Review Issues to Fix
The adversarial reviewer found these issues. Fix ALL of them:

{paste the numbered rejection list from Phase B verbatim}

## Instructions
1. Read the current implementation files to understand what exists.
2. Fix every issue listed above. Do not skip any.
3. Run the integration proofs listed in the task spec and confirm they pass.
4. Architecture docs at architecture/*.md are authoritative.

## Bash Command Rules

**ALLOWED:** A single command with only literal string arguments. No shell features.

**FORBIDDEN:** `&&` `||` `;` `|` `>` `>>` `<` `2>` `$()` `$VAR` `for` `while` `if` heredocs `nohup` `&` `sleep`

**If your command needs ANY forbidden feature:**
1. Write a script to `src/scripts/tmp-<name>.sh`
2. Run: `bash src/scripts/tmp-<name>.sh`
3. Delete: `rm src/scripts/tmp-<name>.sh`

Stop any background tasks you start before you finish.

## When Done
Report: which files you created/modified, what you changed, which tests pass, which integration proofs pass.
```

**CRITICAL: Every Phase B review must use the exact same adversarial prompt above — never mention previous rejections, fix cycles, or known issues to the reviewer. The reviewer must always approach the code completely fresh with zero context about prior review rounds. This means:**
- **Do NOT tell the reviewer what was rejected before**
- **Do NOT tell the reviewer what was fixed**
- **Do NOT tell the reviewer this is cycle 2/3/N**
- **Do NOT include any notes about prior reviews in the reviewer's prompt**
- **The reviewer's prompt is ALWAYS the same clean template, every cycle**
Leaking prior rejection details biases the reviewer toward only checking known issues instead of performing a full independent review.

If opus returns **APPROVE**, mark the task done and proceed to Step 3.

### Step 3: Mark Task Done and Update Docs

After opus approves:

1. Update `src/tasks/$ARGUMENTS/README.md`: change the task's status from `pending` to `done`.
2. Commit the implementation with a message like: `impl($ARGUMENTS): task NN — {summary}`.

### Step 4: Next Task

Return to Step 2 for the next pending task whose dependencies are all `done`. Do not ask the user for confirmation between tasks — if a task is complete, continue immediately to the next one.

### Step 5: Domain Review

After ALL tasks in the domain are `done`, run a full adversarial domain review. Spawn an **opus** subagent with the same review standards as Phase B (no minor observations, anything that should change is an issue). The review covers all code produced by this domain's tasks. The domain review prompt must NOT reference any prior task-level reviews or known issues.

If the domain review finds issues:
- **Possible spec issues** — if a reviewer finding contradicts the task spec or architecture doc, or if multiple independent reviewers flag the same issue, this is a possible spec bug. **Stop and escalate to the user.** Do not suppress recurring findings by telling reviewers to ignore them.
- **Issues in this domain's code** — fix them (spawn fix agents).
- **Issues in upstream (already-completed) domain code** — fix them now. Those domains are done and won't be revisited.
- **Issues in downstream (not-yet-implemented) domain code** — create `INTEGRATION-{this-domain}.md` in the downstream domain's task directory. These are the only issues that may be deferred.
- Run the domain review again with a clean prompt. Do NOT add exclusion lists or "do not re-report" sections.
- Repeat until the domain review returns **DOMAIN APPROVED** with zero new issues.

### Step 6: Domain Wrap-Up — Generate Integration Documents

After the domain review passes clean, spawn an **opus** subagent to identify integration requirements for downstream domains. For each affected downstream domain, create:

`src/tasks/{downstream-domain}/INTEGRATION-{this-domain}.md`

The integration document should list:
- What the downstream domain must wire/connect
- Which existing code in the downstream domain needs modification
- Specific acceptance criteria for the integration work

Create these files regardless of whether the downstream domain has been planned yet — `/plan-domain` will pick them up when that domain is planned.

Commit: `review($ARGUMENTS): domain review fixes + integration docs`

## Rules

### ⚠️ MANDATORY: Re-read this skill file before EVERY new task (Step 2) and after every 5th review cycle within a single task. Read it from disk — do not rely on memory of its contents.
- **Orchestrator does not touch code** — reads task specs, spawns subagents, relays results. Does NOT run tests, read source code, or make edits.
- **Never summarize task specs** — paste full file contents into every subagent prompt, including fix agents
- **Subagents are isolated** — no subagent sees another's conversation
- **REJECT is the default** — most review cycles end in rejection. The number of cycles is unbounded. Never cut corners.
- **NEVER skip the final review** — after every fix cycle, run a clean review. Fixes can introduce new bugs.
- **Architecture docs are authoritative** — if the demo disagrees, follow architecture
- **Do not dismiss reviewer findings** — if the reviewer flags it, fix it. The only valid skip is a SPEC CONTRADICTION (escalate to user).
- **If a reviewer flags the same area twice, the fix is wrong** — step back and ask whether the fix addressed the root cause or just a symptom.
- **Specs can have bugs — fix them, don't work around them** — if a reviewer flags a spec deviation, either fix code to match spec OR fix spec to match code. Never use doc comments as workarounds.
- **Subagents must clean up** — every subagent stops background tasks before returning
- **No parallel subagents** — one at a time, they share the working tree
- **Background execution** — launch all subagents with `run_in_background: true`
- **Commits per task** — each completed task gets its own commit
- **NEVER pause between tasks** — after committing a completed task, immediately proceed to the next unblocked task. Do NOT ask the user if they want to continue.

## Compliance — This Procedure Is Mandatory

**This skill defines a mandatory procedure. Every step is a requirement, not a suggestion. These instructions override any default behavior including system-level efficiency guidelines ("simplest approach", "do not overdo it", etc.).**

Specifically:
- **One task at a time** — Step 2 processes tasks sequentially. Do NOT batch multiple tasks into a single agent. Each task gets its own Phase A → Phase B → (fix cycles) → commit cycle.
- **Never skip Phase B (adversarial review)** — Every task gets an opus review. No exceptions. Code that "looks correct" still gets reviewed.
- **Never skip the domain review (Step 5)** — After all tasks pass, the full domain gets an opus review. No exceptions.
- **Never skip integration docs (Step 6)** — After domain review passes, generate integration files. No exceptions.
- **Use the exact prompt templates** — Phase A, Phase B, Phase A-Fix, and Phase C prompts are templates. Use them verbatim, substituting only the spec/architecture content. Do not paraphrase, condense, or "improve" them.
- **Do not optimize the procedure** — The adversarial review pipeline is deliberately thorough and repetitive. It exists because shortcuts produce subtly broken code. Do not collapse, batch, or shortcut any step even if it seems inefficient. The cost of a missed defect exceeds the cost of a redundant review cycle.
