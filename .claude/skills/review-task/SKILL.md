---
name: review-task
description: Adversarial code review of an implemented task against its spec and architecture doc
---

# Review Task — Adversarial Code Review

Standalone adversarial review of an implemented task. Uses opus to review code against the task spec and architecture doc. Can be invoked independently of `/implement`.

**Arguments:** `$ARGUMENTS` — `{domain} {task-id}` (e.g., `input-surface 03`)

## Procedure

1. Parse arguments: domain name and task ID from `$ARGUMENTS`
2. Read the task spec at `src/tasks/{domain}/{task-id}-*.md`
3. Read the relevant architecture doc at `architecture/{domain}.md`
4. Spawn an **opus** subagent with adversarial review framing (same prompt as `/implement` Phase B)
5. Report the verdict: APPROVE or REJECT with specific issues

## When to Use

- After manually implementing a task (without `/implement`)
- To re-review a task that was previously approved
- To get a second opinion on code quality
- As a pre-commit check
