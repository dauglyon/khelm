# The Helm -- Post-Demo Brainstorm Notes

## March 21, 2026

-----

## Task Type (`task`)

A new card type for running containerized tools on remote compute via the KBase CDM Task Service (CTS).

**Type color:** Plum `#7A3B5E`, bg `#F2E6EE`

**New status:** `queued` in slate grey -- sits between thinking and running for jobs waiting on compute allocation at NERSC.

**Card structure:**

- Usually a **compound card** because input data typically needs format conversion before the container can run. Decomposes into `.prep` (python -- stages/formats data) and `.run` (task -- actual container execution).
- Sometimes a **simple task card** if the input already matches the container's expected format. The system decides based on schema match.

**Running state:** Status label (queued/running) + elapsed timer + expandable log link. No progress bar -- containers are opaque, CTS doesn't report percentage.

**Output:** Container produces files. Card shows a **directory tree** (filenames, sizes, types) with **ingest buttons** on each file. Scientist selectively promotes outputs into the workspace -- either on the card itself or as new cards.

**Reference data:** Tools needing reference databases handle setup in the `.prep` sub-card. DB version captured in provenance.

**Cost awareness:** For expensive tasks, a **modal warning** before submit with estimated time/resource cost. Threshold configurable.

**Discovery:** Via chat for now ("what tools work on metagenome data?"). App/skill catalog UI is future work.

**Transform bar:** Tool name + version + compute target. Container image details behind `view source`.

**Out of scope:** Chaining long-running tasks is workflow running, not a Helm concern. The workspace is the workflow -- the provenance DAG captures the chain naturally.

-----

## Ingest Clarification

We established clear rules for what becomes an ingest vs a note:

|Input                         |Result                                                                               |
|------------------------------|-------------------------------------------------------------------------------------|
|File drag-and-drop            |**ingest** -- schema detected, structured data                                        |
|DOI / accession number        |**ingest** -- resolves to source, extracts structured data (e.g. supplementary tables)|
|Recognized data ID (JGI, NCBI)|**ingest** -- fetches from known repository                                           |
|Arbitrary URL                 |**note** -- fetched, summarized, stored as session context                            |

Rule: if structured queryable data comes in → ingest. If it's just content → note.

-----

## Open Questions

- Exact slate grey value for `queued` status
- Exact border color for task type plum
- Notification system for long-running tasks (deferred -- cards update in real-time when session is open, that's enough for now)
- Container version pinning in narratives for reproducibility
