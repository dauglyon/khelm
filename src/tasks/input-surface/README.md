# Input Surface -- Task Breakdown

The input surface is the single entry point for all user intent in The Helm. It comprises a TipTap-based single-line editor with inline mention pills, a real-time input classifier (local Ollama primary, API fallback), a confidence-driven classification preview with type override, and a submit flow that creates cards in the workspace. State is managed locally via Zustand, not global Redux. The domain depends on design-system (tokens, primitives) and app-shell (layout slot, session context).

## Implementation Targets

| Target | Detail |
|--------|--------|
| Framework | React 18 + TypeScript, Vite 8 |
| Editor | TipTap (ProseMirror) with `@tiptap/react` |
| State | Zustand store, local to input surface |
| Styling | vanilla-extract (design tokens from design-system) |
| Testing | Vitest + MSW v2 |
| Classification | Qwen3.5-4B via Ollama (local), Gemini 2.5 Flash Lite / GPT-4.1 nano (API fallback) |

## Task Table

| ID | Summary | Files | Deps | Status | Preflight |
|----|---------|-------|------|--------|-----------|
| 01 | Input surface Zustand store | 2 | design-system | done | done |
| 02 | TipTap single-line editor | 3 | 01, design-system | pending | done |
| 03 | Mention pill node view | 2 | 02, design-system | pending | done |
| 04 | Suggestion dropdown | 3 | 03, design-system | pending | done |
| 05 | Classification service | 3 | 01 | pending | done |
| 06 | Classification preview | 3 | 05, 02, design-system | pending | done |
| 07 | Submit flow | 2 | 02, 05, 06, app-shell | pending | done |
| 08 | InputBar composition | 2 | 02, 04, 06, 07, app-shell | pending | done |

## Critical Path DAG

```
design-system ──┐
                ├──> 01 (store) ──┬──> 05 (classifier) ──┐
                │                 │                       │
                ├──> 02 (editor) ─┼──> 03 (pill) ──> 04 (dropdown)
                │                 │                       │
                │                 └──> 06 (preview) <─────┘
                │                          │
app-shell ──────┴──> 07 (submit) <─────────┘
                          │
                     08 (InputBar) <── 04 + 06 + 07
```

## Parallelism (Waves)

| Wave | Tasks | Rationale |
|------|-------|-----------|
| 1 | 01 (store), 02 (editor) | No interdependency; store is pure logic, editor is pure UI |
| 2 | 03 (pill), 05 (classifier) | Pill needs editor; classifier needs store. Independent of each other |
| 3 | 04 (dropdown), 06 (preview) | Dropdown needs pill; preview needs classifier + editor. Independent of each other |
| 4 | 07 (submit) | Needs editor + classifier + preview |
| 5 | 08 (InputBar) | Final composition of all sub-components |
