# Classification & Transformation Redesign

## March 22, 2026

## Classification Output Schema

The classification model outputs a pipeline of actionable card types, not a single type label:
```json
{"types": ["sql", "python"]}
{"types": ["sql"], "alternatives": [["note"]]}
```

## Card Types (7 actionable)

| Type | What it does |
|------|-------------|
| sql | Query data from NMDC/IMG/KBase. Handles NL data requests — a downstream transformation model generates the SQL. |
| python | Run Python code: analysis, plotting, statistics, transformation. Only when intent requires computation. |
| literature | Search scientific publications (DOE OSTI, PubMed, Semantic Scholar). |
| note | Persistent annotation — data observations, plans, reminders, context for collaborators. Deliberate recording. |
| data_ingest | Parse and load a file (CSV, TSV, FASTA, JSON) into the workspace. |
| task | Run a containerized bioinformatics tool (BLAST, CheckM, GTDB-Tk, etc.). |
| chat | Conversational — help, clarification, meta-questions, implicit requests for assistance. Does NOT create a card. |

## Hypothesis Is Not a Type

Hypothesis-like inputs are decomposed into what would test or record them.
"Acidobacteria correlates with soil pH" → the system proposes ["sql", "python"] (test it) with ["note"] as an alternative (record it).

## Compound Cards Are a General Mechanism

Any input can produce multiple cards when the user's intent spans multiple actions. The classifier outputs the full pipeline in execution order.

## Note vs Chat Boundary

- Note: user is depositing information for persistence. Would not surprise the user if the system just saved it silently.
- Chat: user implicitly expects a response. Vague/short input = needs clarification.
- Test: would the user be surprised if the system silently recorded this and did nothing? If yes → chat. If no → note.

## Alternatives (Rare by Design)

Alternatives appear only when the input is a claim/observation with no explicit action. All other inputs have clear signals and get a solid type pill with no dropdown.

## Three Independent Models

| Role | Purpose | Model class |
|------|---------|-------------|
| Classification (transformation preview) | Commit to pipeline types, show user what's coming | Small local model (Qwen3.5 4B), always hot in VRAM |
| Transformation (code generation) | Generate actual SQL/Python/tool configs after user submits | Larger code-specialized model, swapped in on submit |
| Chat/Error resolution | Conversational AI in card chat panels, error diagnosis, tool calls | Reasoning model with thinking mode + tool calling |

## Capability Manifest

The classification model's system prompt includes a capability manifest describing what each card type can do, what data sources exist, and what tools are available. Dynamic — updates as tools are registered and data sources are added.

## UX Mapping

| Classification result | Preview UX |
|----------------------|------------|
| Single type, no alternatives | Solid type pill |
| Multiple types (compound) | Pipeline visualization |
| Types + alternatives | Dashed pill + dropdown (rare) |
| Chat type | Redirects to chat, no card |
