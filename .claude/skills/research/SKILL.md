---
name: research
description: Research prior art, standards, and ecosystem options to inform architecture decisions
allowed_tools:
  - WebSearch
  - WebFetch
  - Read
  - Write
  - Glob
  - Grep
---

# Research

Research prior art, ecosystem options, and relevant standards for a given topic. Produces a research document saved to `architecture/research/` that informs architecture decisions.

## Inputs

- **topic**: What to research (e.g., "input classification", "collaborative editing", "data lake ingestion")
- **context**: Relevant architecture doc sections and existing decisions

## Workflow

### 1. Frame the Question

Read the relevant architecture docs and existing decisions. Identify:
- What constraints exist from existing architecture decisions
- What the key trade-offs and open questions are

### 2. Research Prior Art

Use `WebSearch` and `WebFetch` to find:
- How other scientific platforms solve this (Jupyter, Galaxy, Nextflow, Observable, Terra, etc.)
- Relevant standards and specifications (W3C, RFCs, FAIR, RO-Crate, etc.)
- Ecosystem options (tools, libraries, formats) with trade-off comparison

### 3. Compare Options

Build a comparison table of viable approaches. For each option:
- What it is and who maintains it
- How it addresses the constraints from the architecture
- Pros, cons, and risks
- Maturity and ecosystem support

### 4. Save Research Document

Determine next research number by scanning `architecture/research/rsh-*.md`. Save as:

```
architecture/research/rsh-{NNN}-{slug}.md
```

Use this structure:

```markdown
# RSH-{NNN}: {Question}

**Date:** {date} | **Status:** Completed

## Question

{One clear question}

## Context

{Why this research is needed — relevant architecture sections and constraints}

## Findings

{Comparison tables, prior art summary, standards references}

## Conclusions

{Recommendation and key trade-offs}

## Sources

{URLs with access dates}
```

## Rules

- Tables over prose. Comparison tables are the primary output.
- Link to primary sources (official docs, specs, RFCs), not blog posts.
- Every claim needs a source.
- Stay focused on the question — don't research adjacent topics.
- Save the file even if findings are inconclusive.
