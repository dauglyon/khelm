# The Helm

**Type what you're thinking.**

The Helm is a scientific exploration interface — a single input surface where researchers express intent in any form and the system handles classification, transformation, and execution against real data sources. Built on DOE BER systems biology data sources (NMDC, IMG, KBase), inspired by KBERDL (KBase BER Data Lakehouse) and the BERIL (BER Integrative Layer) project at Lawrence Berkeley National Laboratory.

## Vision

Researchers should be able to think in their native mode — SQL, Python, natural language hypotheses, plain English — and have the system meet them there. The Helm classifies input, shows live transformation previews, produces named result cards that become referenceable variables, supports collaborative sessions, and composes exploratory work into publishable narratives.

## Animated Vignettes (Demo)

`index.html` contains a self-contained animated demo of five core interaction patterns:

1. **The Core Loop** — Type an entry in any form; the system classifies it, previews the transformation, and produces a named result card. Card shortnames become referenceable variables via inline pills.
2. **Error → Chat → Fix** — A query returns empty results. The card diagnoses the problem; the scientist chats to provide missing context; the AI retries with corrected parameters; the card updates in place.
3. **Data Ingest** — Drag a file onto the workspace. The system detects the type, infers the schema, creates a preview card. The ingested data is immediately queryable.
4. **Collaboration** — Multiple researchers in one session. Note cards (triggered by starting with a quote) capture context for collaborators and the AI without executing. Chat shows all participants symmetrically.
5. **Compose the Narrative** — Select and order cards into a publishable account. The workspace compresses to a card list; a narrative panel assembles entries with connective text into a shareable, reproducible artifact.

## Documentation Structure

This project follows a **spec → domains → tasks → implementation** documentation flow:

```
khelm/
├── README.md                       # This file — project overview and doc guide
├── architecture/
│   ├── README.md                   # High-level system spec, layers, tech stack, domain index
│   ├── decisions.md                # Technology decisions with rationale
│   ├── {domain}.md                 # Prescriptive domain specs (what & why)
│   └── research/
│       └── rsh-NNN-{slug}.md       # Research documents (prior art, comparisons)
├── src/
│   └── tasks/
│       └── {domain}/               # Task breakdowns per domain
│           ├── README.md           # Task table, dependency DAG, waves
│           └── NN-{slug}.md        # Individual task specs
└── .claude/
    └── skills/                     # Automation (plan-domain, preflight, implement)
```

- **Architecture docs** define *what* to build and *why* — never *how*
- **Decisions doc** captures technology choices with links to research
- **Research docs** contain prior art analysis, comparisons, and benchmarks
- **Task specs** break domains into ordered, dependency-tracked work packages with acceptance criteria
- **Implementation** follows from tasks, verified against integration proofs
