# Architecture

This document is the entry point for The Helm's system specification. It describes the high-level vision, the conceptual layers, and indexes the domain specs that prescribe what to build.

## System Overview

The Helm is a unified research workspace where scientists interact through a single input surface. The system receives free-form input (SQL, Python, natural language, conversational questions), classifies it, transforms it into executable form, runs it against real data sources, and returns structured results as named cards. Cards accumulate into a session workspace that supports collaboration, error recovery, data ingestion, and narrative composition.

## Conceptual Layers

```
┌─────────────────────────────────────────────────┐
│                  Narrative Layer                 │  Composition, publishing, reproducibility
├─────────────────────────────────────────────────┤
│               Collaboration Layer               │  Multi-user sessions, presence, notes
├─────────────────────────────────────────────────┤
│                 Workspace Layer                  │  Cards, references, session state
├─────────────────────────────────────────────────┤
│            Classification & Transform           │  Input typing, preview, code generation
├─────────────────────────────────────────────────┤
│                 Execution Layer                  │  Query dispatch, data ingest, AI chat
├─────────────────────────────────────────────────┤
│                   Data Layer                     │  NMDC, IMG, KBase, user-ingested tables
└─────────────────────────────────────────────────┘
```

## Tech Stack

Decided via research (RSH-001 through RSH-013). Full rationale in [decisions.md](decisions.md).

| Layer | Choice | Key Detail |
|-------|--------|------------|
| Build | Vite 8 | Rolldown, 10-30x faster than CRA |
| Styling | vanilla-extract | Zero-runtime, type-safe design tokens |
| State | Zustand + TanStack Query | External setState for streaming, selector isolation |
| Masonry | @tanstack/react-virtual | Custom masonry via lanes API, virtualized for 100s of cards |
| Animation | Motion (Framer Motion) | Layout FLIP, AnimatePresence, Typewriter; CSS keyframes for shimmer |
| Input | TipTap (ProseMirror) | Mention pills, Suggestion API, single-line mode |
| Classification | Qwen3.5-4B (Ollama) | Local intent classification, API fallback |
| Collaboration | Socket.IO | Server-authoritative, card-level pessimistic locking |
| Chat UI | Custom | fetch + ReadableStream + Zustand, ~150 lines |
| Card DnD | dnd-kit | Sortable grid, keyboard accessible |
| File Drop | react-dropzone | OS file drops, headless hook |
| File Upload | tus.io + Uppy | Resumable uploads for multi-GB scientific files |
| API Stubs | Orval + MSW v2 | OpenAPI → types + hooks + mocks in one pass |
| Testing | Vitest + Playwright + MSW | Happy DOM, SSE mocking, 4-shard CI |

## Domain Index

| Domain | Spec | Description | Status |
|--------|------|-------------|--------|
| design-system | [spec](design-system.md) | Theme, tokens, shared primitives (buttons, inputs, icons, layout) | planned |
| app-shell | [spec](app-shell.md) | Vite setup, routing, layout skeleton, toolbar, session management | planned |
| input-surface | [spec](input-surface.md) | TipTap editor, mention pills, classification, submit flow | planned |
| workspace | [spec](workspace.md) | Masonry grid, virtualization, card container, session state, cross-card refs | planned |
| card | [spec](card.md) | Card model, rendering, status lifecycle, streaming content, inline chat | planned |
| collaboration | [spec](collaboration.md) | Socket.IO, presence, card locking, multi-user sync | planned |
| data-ingest | [spec](data-ingest.md) | File drop, type detection, schema preview, tus upload | planned |
| narrative | [spec](narrative.md) | Card selection, drag reorder, composition panel, artifact preview | planned |

**Dependency order:** design-system → app-shell → input-surface + workspace → card → collaboration + data-ingest + narrative

## Design Tokens

Extracted from the animated demo — these are the authoritative visual constants:

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| bg | `#EEF1EB` | App background |
| surface | `#F9FAF7` | Card/input surfaces |
| border | `#D5DAD0` | Default borders |
| text | `#1A1E18` | Primary text |
| textMid | `#434840` | Secondary text |
| textLight | `#6B7268` | Tertiary text |

### Input Type Colors

| Type | Foreground | Background | Border |
|------|-----------|-----------|--------|
| SQL | `#2B6CB0` | `#E3EDF7` | `#B0CDE4` |
| Python | `#7B4EA3` | `#EDE5F5` | `#C4B0DA` |
| Literature | `#1A7F5A` | `#E0F2EA` | `#A8D8C4` |
| Note | `#7A6340` | `#F5F0E7` | `#D6C8AD` |
| Data Ingest | `#2D8E8E` | `#E0F2F2` | `#A8D6D6` |
| Task | `#7A3B5E` | `#F2E6EE` | `#C9A3B8` |
| Chat | `#B8660D` | `#FBF0E0` | `#E4C890` |

### Status Colors

| Status | Value |
|--------|-------|
| thinking | `#B8660D` |
| running | `#2B6CB0` |
| complete | `#1A7F5A` |
| queued | `#6B7280` |
| error | `#C53030` |

### Typography

| Role | Font | Fallback |
|------|------|----------|
| Mono | JetBrains Mono | Menlo, monospace |
| Sans | DM Sans | system-ui, sans-serif |
| Serif | Source Serif 4 | Georgia, serif |

### Easing

| Name | Value |
|------|-------|
| out | `cubic-bezier(0.16, 1, 0.3, 1)` |
| inOut | `cubic-bezier(0.4, 0, 0.2, 1)` |
| outQuart | `cubic-bezier(0.25, 1, 0.5, 1)` |
