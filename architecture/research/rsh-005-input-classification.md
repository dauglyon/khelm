# RSH-005: Input Classification for Domain-Heavy Scientific Text

**Date:** 2026-03-21 | **Status:** Completed (web-verified 2026-03-21)

> **Verification Status:** Pricing, model availability, and deprecation dates were verified
> against provider documentation on 2026-03-21. See the Sources section for full citations
> with access dates. Key changes from initial draft: added newer model options (Gemini 2.5
> Flash, GPT-4.1 mini/nano, Claude Haiku 4.5, DeepSeek V3), noted deprecation timelines for
> Gemini 2.0 Flash (shutdown June 1, 2026), Claude 3 Haiku (retired), and GPT-4o-mini
> (retired from ChatGPT, Azure sunset Feb 2026). Updated structured output status: all three
> major providers now support JSON schema-constrained output.

## Question

What is the best approach to classify free-form scientist input into one of six types
(SQL, Python, Literature, Hypothesis, Note, Data Ingest) given that inputs are heavy with
biology/metagenomics domain language that creates systematic ambiguity between categories?

## Context

The Helm receives free-form input through a single input surface. The Classification &
Transform layer must assign each input a type before downstream processing. The six types
each have distinct visual treatment (color-coded cards) and distinct execution paths:

| Type | Downstream Path | Example |
|------|----------------|---------|
| SQL | Parse, validate, execute against NMDC/IMG/KBase data | `SELECT * FROM biosample WHERE ecosystem_type = 'Soil'` |
| Python | Sandbox execution, notebook-style | `import pandas as pd; df.groupby('phylum').count()` |
| Literature | Search DOE OSTI, PubMed, Semantic Scholar | "Recent papers on CRISPR-Cas9 in methanotrophs" |
| Hypothesis | Structure as testable claim, suggest analyses | "Acidobacteria abundance correlates with soil pH below 5.5" |
| Note | Store as free-text annotation on session | "Remember to check the QC flags on JGI run 3045" |
| Data Ingest | Parse file reference, validate schema, load | "Load the CSV from /uploads/soil_samples_2024.csv" |

**The hard problem:** Domain language creates systematic ambiguity. A scientist typing
"Find metagenomes from NMDC with high Pseudomonas abundance" could be:
- **SQL** -- the user wants a query executed against the NMDC database
- **Literature** -- the user wants papers about Pseudomonas in metagenomes
- **Hypothesis** -- the user is asserting a pattern to be tested
- **Note** -- the user is recording a task reminder

Classification must be fast (< 500ms perceived), accurate (> 95% on unambiguous inputs),
and graceful on ambiguous inputs (surface confidence, allow user correction).

## Findings

### 1. API-Based LLM Classification

Using a hosted LLM API to classify each input with a carefully crafted prompt.

#### Model Comparison

| Model | Input Cost | Output Cost | Typical Latency (short text) | Context Window | Status |
|-------|------------|-------------|------------------------------|----------------|--------|
| **Gemini 2.5 Flash Lite** | $0.10/MTok | $0.40/MTok | 150-400ms | 1M | Active; shutdown July 22, 2026 |
| **GPT-4.1 nano** | $0.05/MTok | $0.20/MTok | 150-400ms | 1M | Active |
| **GPT-4.1 mini** | $0.20/MTok | $0.80/MTok | 200-500ms | 1M | Active |
| GPT-4o-mini | $0.15/MTok | $0.60/MTok | 200-500ms | 128K | API active; retired from ChatGPT Feb 2026 |
| **Gemini 2.5 Flash** | $0.30/MTok | $2.50/MTok | 200-400ms | 1M | Active; shutdown June 17, 2026 |
| Claude 3.5 Haiku | $0.80/MTok | $4.00/MTok | 200-400ms | 200K | Active |
| **Claude Haiku 4.5** | $1.00/MTok | $5.00/MTok | 200-400ms | 200K | Active (current Anthropic budget tier) |
| Gemini 2.0 Flash | $0.10/MTok | $0.40/MTok | 150-400ms | 1M | **Deprecated; shutdown June 1, 2026** |
| Gemini 1.5 Flash | $0.075/MTok | $0.30/MTok | 100-300ms | 1M | Deprecated |
| Claude 3 Haiku | $0.25/MTok | $1.25/MTok | 150-300ms | 200K | **Retired** (as of Feb 2026) |
| **DeepSeek V3** | $0.014/MTok | $0.028/MTok | 300-600ms | 164K | Active (cheapest option; hosted in China) |

Pricing verified 2026-03-21 against provider documentation. Sorted by cost-effectiveness
for short classification calls. New entrants since initial draft shown in **bold**.

**Key changes since early 2025:** GPT-4.1 nano ($0.05/$0.20 per MTok) and DeepSeek V3
($0.014/$0.028 per MTok) offer dramatically lower costs than anything previously available.
Gemini 2.5 Flash Lite is the direct successor to Gemini 2.0 Flash at the same price point.
Claude Haiku 4.5 replaces Claude 3 Haiku as Anthropic's budget model but at 4x the price.

#### Cost Per Classification

A typical input is ~50 tokens. System prompt with category definitions and few-shot
examples is ~500 tokens. Output (category + confidence) is ~20 tokens.

| Model | Input Tokens | Output Tokens | Cost per Call | Cost per 10K Calls |
|-------|-------------|---------------|---------------|---------------------|
| DeepSeek V3 | ~550 | ~20 | $0.0000083 | $0.08 |
| GPT-4.1 nano | ~550 | ~20 | $0.000032 | $0.32 |
| Gemini 2.5 Flash Lite | ~550 | ~20 | $0.000063 | $0.63 |
| GPT-4o-mini | ~550 | ~20 | $0.000094 | $0.94 |
| GPT-4.1 mini | ~550 | ~20 | $0.000126 | $1.26 |
| Gemini 2.5 Flash | ~550 | ~20 | $0.000215 | $2.15 |
| Claude 3.5 Haiku | ~550 | ~20 | $0.000520 | $5.20 |
| Claude Haiku 4.5 | ~550 | ~20 | $0.000650 | $6.50 |

All options are economically trivial at research-platform scale (thousands of
classifications/day, not millions). Even the most expensive option (Claude Haiku 4.5)
costs under $7 per 10K calls.

#### Accuracy on Domain-Heavy Text

No published benchmark exists for this exact 6-class task on biology/metagenomics text.
However, relevant findings from the literature:

- **LLMs as zero-shot classifiers** consistently achieve 85-95% accuracy on multi-class
  text classification tasks when given clear category definitions and examples.
  Chae & Davidson (2025) systematically compared 10 models across four training regimes
  (zero-shot, few-shot, fine-tuning, instruction-tuning) and found that large instruction-
  tuned models offer strong zero-shot performance, though fine-tuned smaller models remain
  competitive. A 2025 multi-LLM evaluation of zero-shot content classification across 8
  commercial LLMs (GPT-4o, GPT-4o Mini, Claude 3.5 Haiku, Gemini 2.0 Flash, DeepSeek,
  Grok) showed macro-F1 scores of 0.86-0.87 for the best performers (Zyska et al., 2025).
- **Intent classification specifically:** Parikh et al. (ACL Industry 2023) explored
  zero-shot and few-shot intent classification, finding that LLM prompting with intent
  descriptions achieved >85% top-5 accuracy, and parameter-efficient fine-tuning (T-few
  on Flan-T5) yielded the best results even with one sample per intent.
- **Domain-specific vocabulary** is not a barrier for LLMs trained on broad corpora.
  Claude, GPT-4o-mini, and Gemini Flash all have strong coverage of biology and
  metagenomics terminology from their training data (PubMed, bioRxiv, GenBank records).
- **Structured output** (JSON mode / tool-use mode) eliminates parsing errors and allows
  the model to return both a classification and a confidence score. As of early 2026,
  all three major providers support schema-constrained structured output: OpenAI via
  `response_format: {type: "json_schema"}` (GA since Aug 2024), Google Gemini via
  `responseSchema` with JSON Schema support (GA for all 2.5+ models), and Anthropic
  via `output_config.format` with JSON schema (GA for Haiku 4.5, Sonnet 4.5, Opus 4.5
  as of Feb 2026). All three support Pydantic/Zod schema definitions.
- **Few-shot examples** in the system prompt are the single highest-impact technique for
  this kind of classification, particularly for disambiguating the hard cases.

#### Latency Optimization

For a classification call (~570 tokens total), latency is dominated by:
1. **Network round-trip** to the API provider (~50-100ms)
2. **Time to first token** (model load / queue time, ~50-200ms)
3. **Token generation** (~20 tokens at 100+ tok/s = <200ms)

Practical techniques to stay under 500ms:
- **Streaming:** Return the classification label as soon as the first token arrives;
  don't wait for the full JSON response to start showing the type indicator.
- **Speculative classification:** Start classifying as the user types (debounced),
  so the result is ready before they press Enter.
- **Constrained output:** Use `max_tokens=50` and structured output modes to minimize
  generation time.
- **Regional endpoints:** Deploy in same region as the frontend's API server.

### 2. Domain-Adapted Models (SciBERT, PubMedBERT, BioGPT)

Fine-tuning a domain-specific transformer model for the classification task.

#### Model Overview

| Model | Base | Params | Domain Pretraining Corpus | Maintainer | Status (as of Mar 2026) |
|-------|------|--------|--------------------------|------------|------------------------|
| SciBERT | BERT-base | 110M | 1.14M Semantic Scholar papers (CS + biomedical) | Allen AI | Available on HuggingFace; repo not actively developed (last major update 2019) |
| PubMedBERT / BiomedBERT | BERT-base | 110M | PubMed abstracts + PMC full-text (biomedical only) | Microsoft Research | Rebranded to `microsoft/BiomedNLP-BiomedBERT-*`; updated May 2025; actively maintained |
| BioGPT | GPT-2 | 347M | 15M PubMed abstracts | Microsoft Research | Available on HuggingFace; repo receives issues but no major updates since 2023 |
| BiomedBERT-large | DeBERTa | 184M | PubMed + PMC + clinical notes | Microsoft Research | Available via `microsoft/BiomedNLP-BiomedBERT-large-uncased-abstract` |
| BioBERT | BERT-base | 110M | PubMed abstracts + PMC | DMIS Lab, Korea Univ | Available on HuggingFace; stable but not actively developed |

Note: PubMedBERT has been rebranded by Microsoft as "BiomedBERT" under the `microsoft/BiomedNLP-*`
namespace on HuggingFace. The old `microsoft/BiomedNLP-PubMedBERT-*` model IDs redirect to the new
names. Use `transformers>=4.22` for the updated model names.

#### Fine-Tuning Requirements

To fine-tune any of these for 6-class classification:

| Requirement | Detail |
|-------------|--------|
| Training data | 500-2,000 labeled examples (minimum viable); 5,000+ for robust performance |
| Labeling effort | Domain expert must label examples -- estimated 20-40 hours for 2,000 examples |
| Compute | Fine-tuning: 1-2 GPU-hours on a single A100 / T4 |
| Hosting | Inference server (e.g., HuggingFace Inference Endpoints, self-hosted with ONNX/TorchServe) |
| Inference latency | 10-50ms per classification (on GPU); 50-200ms (on CPU) |
| Inference cost | $0.50-2.00/hr for a GPU endpoint; effectively $0 marginal per call |

#### Accuracy Expectations

Fine-tuned BERT-class models on text classification tasks typically achieve:
- **93-97% accuracy** with 2,000+ clean labeled examples on well-separated classes
- **88-93% accuracy** on ambiguous multi-class tasks with overlapping categories
- PubMedBERT and SciBERT outperform general BERT by 2-5 percentage points on biomedical
  text classification tasks (Gu et al., 2021; Beltagy et al., 2019)

#### Critical Limitation: This Problem is Not Standard Text Classification

The Helm's classification task is **not** classifying text by topic (which is what SciBERT
etc. excel at). It is classifying **user intent** -- what the user wants the system to do
with their input. The same biological content ("Pseudomonas abundance in soil metagenomes")
appears across all six categories. The distinguishing signals are:

- **Syntactic cues:** Code syntax (`SELECT`, `import`, `=`, parentheses)
- **Intent markers:** "Find papers about...", "I think that...", "Load the file..."
- **Conversational context:** What the user did previously in the session

Domain-adapted models help with understanding the *content* but do not inherently help
with classifying *intent*. A general-purpose LLM with a good prompt may actually
outperform a domain-adapted BERT on this task because:

1. LLMs understand instructions and intent natively (instruction-tuning)
2. LLMs can reason about ambiguity and express confidence
3. LLMs can incorporate few-shot examples without retraining
4. LLMs handle novel phrasings gracefully (zero-shot generalization)

### 3. Hybrid Approach: Rules + LLM Fallback

Use deterministic rules for obvious cases, fall back to an LLM for ambiguous ones.

#### Rule Layer (Fast Path)

| Signal | Detected Type | Confidence | Detection Method |
|--------|--------------|------------|------------------|
| Starts with `SELECT`, `INSERT`, `WITH`, `CREATE` (case-insensitive) | SQL | 0.99 | Regex |
| Contains SQL keywords + table-like names (`FROM biosample WHERE`) | SQL | 0.90 | Regex + keyword density |
| Starts with `import`, `from X import`, `def `, `class `, or contains `:=`, `print(` | Python | 0.99 | Regex |
| Indented code block with Python syntax | Python | 0.95 | Regex + heuristic |
| References a file path with data extension (`.csv`, `.tsv`, `.fastq`, `.fasta`, `.json`) | Data Ingest | 0.90 | Regex |
| Contains "load", "import", "upload", "ingest" + file reference | Data Ingest | 0.85 | Keyword + regex |
| Starts with "Note:", "TODO:", "Remember", "Don't forget" | Note | 0.90 | Keyword prefix |
| Very short input (< 10 words) with no code signals, no question mark | Note | 0.70 | Length heuristic |

**Estimated rule coverage:** 40-60% of inputs can be classified with high confidence
by rules alone. The remaining 40-60% -- particularly natural-language queries about
biology -- require the LLM.

#### Architecture

```
Input
  │
  ├─── Rule Engine (< 1ms) ───── High confidence? ──── Yes ──→ Return type
  │                                      │
  │                                      No
  │                                      │
  └─── LLM Classifier (200-400ms) ──────┘──→ Return type + confidence
```

#### Advantages

- **Latency:** Code inputs and obvious file references are classified instantly
- **Cost:** 40-60% of classifications avoid an API call
- **Determinism:** Rules produce identical results every time (testable, debuggable)
- **Reliability:** No API dependency for straightforward cases

#### Disadvantages

- **Maintenance burden:** Rules must be kept in sync with evolving input patterns
- **Edge cases:** Rule boundaries create cliff effects (e.g., `select` as an English word)
- **Two systems to test:** Both the rule engine and the LLM need test coverage
- **Marginal savings:** At $0.50-5.00 per 10K calls, the cost savings are negligible

### 4. Embeddings + Similarity Approach

Embed each input and classify by similarity to labeled exemplars.

#### How It Works

1. Pre-compute embeddings for a labeled set of example inputs (50-100 per category)
2. At classification time, embed the new input
3. Find the k nearest neighbors in embedding space
4. Classify by majority vote (or distance-weighted vote)

#### Embedding Model Options

| Model | Dimensions | Domain | Latency | Cost |
|-------|-----------|--------|---------|------|
| OpenAI text-embedding-3-small | 1536 | General | 50-100ms | $0.02/MTok |
| OpenAI text-embedding-3-large | 3072 | General | 50-150ms | $0.13/MTok |
| Voyage-3 | 1024 | General | 50-100ms | $0.06/MTok |
| SPECTER2 (Allen AI) | 768 | Scientific papers | Local: 10-30ms | Free (self-hosted) |
| PubMedBERT / BiomedBERT embeddings | 768 | Biomedical | Local: 10-30ms | Free (self-hosted) |
| Gemini text-embedding-004 | 768 | General | 50-100ms | $0.004/MTok |

Pricing verified 2026-03-21. Embedding costs are negligible compared to LLM classification costs.

#### Analysis

**Why this is appealing:**
- Low latency (especially with local models or pre-computed indices)
- No prompt engineering needed
- Easy to add new examples without retraining
- Naturally produces a confidence score (distance to nearest exemplar)

**Why this fails for The Helm's problem:**
- **Embeddings capture semantic similarity, not intent.** "Find metagenomes from NMDC with
  high Pseudomonas abundance" and "Papers on Pseudomonas abundance in NMDC metagenomes"
  will have nearly identical embeddings despite being different intent categories.
- The six categories are **not** semantically separated -- they are **pragmatically**
  separated. The same topic appears in all categories; the difference is what the user
  wants done with it.
- Embeddings would work well for distinguishing "biology text" from "cooking text" but
  poorly for distinguishing "biology query" from "biology hypothesis" from "biology
  literature search."
- **Empirical expectation:** 70-80% accuracy, with systematic confusion between
  Literature, Hypothesis, and SQL (natural-language query) categories.

Embeddings could work as a **supplementary signal** (e.g., combined with rule-based
features in a small classifier), but not as the primary classification mechanism.

---

## Ambiguity Analysis

The core challenge illustrated with real domain examples:

### Ambiguity Matrix

| Input Example | SQL | Python | Literature | Hypothesis | Note | Data Ingest | Why It's Hard |
|--------------|-----|--------|-----------|------------|------|-------------|---------------|
| "Find metagenomes from NMDC with high Pseudomonas abundance" | **0.45** | 0.0 | 0.25 | 0.20 | 0.10 | 0.0 | "Find" is both a query verb and a search verb. No syntactic code signals. |
| "Pseudomonas dominates in low-pH soils across NMDC datasets" | 0.10 | 0.0 | 0.20 | **0.55** | 0.15 | 0.0 | Assertive statement could be a hypothesis to test or a fact from literature to look up. |
| "What's known about CRISPR-Cas9 efficiency in methanotrophs?" | 0.05 | 0.0 | **0.75** | 0.10 | 0.10 | 0.0 | Question format + "what's known" strongly signals literature, but could be a hypothesis prompt. |
| "Compare MAG quality scores between JGI and NMDC pipelines" | **0.35** | 0.20 | 0.15 | 0.10 | 0.10 | 0.10 | "Compare" could mean: run a SQL query, write Python analysis, find papers, or load data to compare. |
| "soil_metagenomes_2024.csv" | 0.0 | 0.0 | 0.0 | 0.0 | 0.10 | **0.90** | Bare filename is almost certainly Data Ingest, but could be a note. |
| "SELECT sample_id, ecosystem FROM biosample WHERE lat > 45" | **0.99** | 0.0 | 0.0 | 0.0 | 0.01 | 0.0 | Unambiguous SQL syntax. |
| "import nmdc; df = nmdc.get_biosamples(ecosystem='Soil')" | 0.0 | **0.99** | 0.0 | 0.0 | 0.01 | 0.0 | Unambiguous Python syntax. |
| "Check if Shannon diversity correlates with sample depth" | 0.15 | 0.15 | 0.10 | **0.40** | 0.20 | 0.0 | "Check if X correlates with Y" is a testable hypothesis, but user might want a query or code. |
| "Need to revisit the contamination flags on run 3045" | 0.0 | 0.0 | 0.0 | 0.0 | **0.85** | 0.15 | Personal task reminder, but "revisit" could mean re-run analysis. |
| "Load the GOLD ecosystem classification tree" | 0.10 | 0.05 | 0.05 | 0.0 | 0.05 | **0.75** | "Load" signals data ingest, but GOLD ecosystem tree could also be a query target. |

### Observations from the Ambiguity Matrix

1. **Code inputs (SQL, Python) are easy.** Syntactic signals are unambiguous 95%+ of the
   time. Rules alone handle these.

2. **Data Ingest is mostly easy.** File references and "load/import/upload" verbs are
   strong signals. Rules handle 80%+ of cases.

3. **The hard zone is the Literature-Hypothesis-NLQuery triangle.** Natural-language
   statements about biology can be any of these. This is where the LLM earns its keep.

4. **Note is the low-confidence catch-all.** Short, informal inputs with no clear intent
   signals default to Note, but this is often wrong.

5. **Confidence scores are essential.** When classification confidence is below ~0.70,
   the system should surface the top 2-3 options and let the user confirm.

### What Disambiguates in the Hard Zone

An LLM can pick up on subtle pragmatic signals that rules and embeddings miss:

| Signal | Points Toward | Example |
|--------|--------------|---------|
| Question syntax ("What...", "How...", "Are there...") | Literature | "What enzymes degrade lignin in anaerobic conditions?" |
| Imperative + data verb ("Find", "Get", "Show", "List", "Count") | SQL (NL query) | "Show all biosamples from wetland ecosystems" |
| Assertive claim with qualifier ("I think", "probably", "might") | Hypothesis | "I think nitrogen fixation rates drop above 30C" |
| Assertive claim without qualifier (declarative) | Hypothesis or Literature | "Acidobacteria dominate in low-pH soils" |
| Past tense research framing ("has been shown", "studies indicate") | Literature | "Studies indicate ANME archaea are key methane oxidizers" |
| Personal/task language ("remember", "don't forget", "TODO") | Note | "TODO: re-check QC on batch 47" |
| Conditional/testable structure ("if X then Y", "X correlates with Y") | Hypothesis | "If pH < 5, then fungal:bacterial ratio increases" |
| File paths, URLs, dataset identifiers | Data Ingest | "https://data.nmdc.org/downloads/study_123.zip" |

An instruction-tuned LLM recognizes these pragmatic patterns natively. This is exactly
the kind of task instruction-tuning was designed for.

---

## Approach Comparison

| Criterion | API LLM (Haiku/4o-mini/Flash) | Fine-Tuned Domain BERT | Hybrid (Rules + LLM) | Embeddings + kNN |
|-----------|------------------------------|----------------------|---------------------|-----------------|
| **Accuracy (unambiguous)** | 95-98% | 95-97% | 98-99% (rules) | 85-90% |
| **Accuracy (ambiguous)** | 85-92% | 80-88% | 85-92% (LLM fallback) | 65-75% |
| **Latency (p50)** | 200-400ms | 20-50ms (GPU) | 1ms (rule hit) / 200-400ms (LLM) | 50-100ms |
| **Latency (p99)** | 500-1500ms | 50-100ms (GPU) | 500-1500ms | 100-200ms |
| **Cost per 10K calls** | $0.50-5.00 | ~$0 marginal (hosting: $50-100/mo) | $0.25-3.00 | $0.04-1.30 (API) or ~$0 (local) |
| **Setup effort** | Hours (prompt engineering) | Weeks (label data, fine-tune, deploy) | Days (rules + prompt) | Days (label exemplars, build index) |
| **Handles new categories** | Add to prompt (minutes) | Relabel + retrain (days) | Update rules + prompt (hours) | Add exemplars (minutes) |
| **Confidence scoring** | Native (ask for it) | Softmax logits (calibration needed) | Native from LLM | Distance-based (natural) |
| **Handles ambiguity gracefully** | Yes -- can explain reasoning | No -- outputs hard labels | Yes (LLM path) | Poorly |
| **Domain bio term coverage** | Excellent (broad training) | Excellent (domain pretraining) | Excellent (LLM path) | Depends on model |
| **Intent vs. topic distinction** | Strong (instruction-tuned) | Weak (trained on topic classification) | Strong (LLM path) | Very weak |
| **Infrastructure dependency** | External API (Anthropic/OpenAI/Google) | Self-hosted or managed endpoint | External API + local rules | External API or self-hosted |
| **Offline/degraded mode** | Fails without API | Works offline | Rules work offline; LLM fails | Works with local models |

---

## The "Reasonably Smart Model with a Good Prompt" Evaluation

The user's intuition is that a reasonably smart LLM with a well-crafted prompt is likely
the right answer. Here is an honest evaluation of that position.

### Why This Intuition Is Correct

1. **This is an intent classification problem, not a topic classification problem.**
   The six categories share the same domain vocabulary. What differs is *what the user
   wants the system to do*. Instruction-tuned LLMs are explicitly trained to understand
   user intent -- this is their core capability.

2. **The category set is small and well-defined.** Six categories with clear definitions
   is well within the reliable classification capacity of even the cheapest API LLMs.
   The prompt can include complete definitions and 3-5 examples per category (~500 tokens
   total) without meaningful cost impact.

3. **Domain vocabulary is not the bottleneck.** The fear that biology jargon will confuse
   the classifier is unfounded for modern LLMs. Claude, GPT-4o-mini, and Gemini Flash have
   all been trained on massive corpora that include PubMed, bioRxiv, and GenBank. They know
   what "metagenome", "Pseudomonas", "MAG", and "Shannon diversity" mean.

4. **The hard cases require reasoning, not pattern matching.** Distinguishing "Find
   metagenomes with high Pseudomonas abundance" (SQL/query intent) from "Pseudomonas
   dominates in low-pH soils" (hypothesis) requires understanding pragmatic intent. LLMs
   do this well. BERT-class models and embeddings do not.

5. **Iteration speed matters for a research platform.** When the team discovers a new
   ambiguity pattern, updating a prompt takes minutes. Retraining a model takes days.
   At the early stage of The Helm, rapid iteration on classification behavior is critical.

6. **Confidence + user correction is the right UX pattern.** An LLM can naturally output
   a confidence score and top-2 alternatives. When confidence is low, the UI shows a
   type-selection affordance. This gracefully handles the irreducible ambiguity in the
   problem.

### Where This Intuition Has Risks

1. **Latency variance.** API calls have a long tail. The p99 latency for a classification
   call can be 1-2 seconds during provider congestion. Mitigation: speculative
   classification as the user types; timeouts with graceful fallback.

2. **API availability.** External API dependency means classification fails if the
   provider is down. Mitigation: the hybrid approach (rules for obvious cases) provides
   degraded-mode operation. Code inputs, file references, and obvious notes still work.

3. **Prompt brittleness.** A poorly constructed prompt can produce inconsistent results.
   Mitigation: structured output (JSON mode / function calling), systematic prompt testing
   with a labeled evaluation set, and version-controlled prompts.

4. **Cost at extreme scale.** At 1M+ classifications/day, API costs become non-trivial
   ($50-500/day depending on model). This is not a concern for The Helm's expected usage
   (research platform, hundreds to low thousands of users), but worth noting for planning.

### Verdict

**The intuition is correct.** A "reasonably smart model with a good prompt" is the right
starting architecture for The Helm's input classification. Specifically:

- The problem is intent classification with shared domain vocabulary across categories
- LLMs are uniquely suited to this because of instruction-tuning
- The cost is negligible at research-platform scale
- The latency is manageable with speculative classification
- The iteration speed advantage over fine-tuned models is significant at this stage

The hybrid approach (rules for syntactically obvious cases + LLM for everything else) is a
worthwhile enhancement but is an **optimization**, not a necessity. Start with pure LLM
classification, measure the actual latency and accuracy, then add rules for the cases where
they demonstrably help.

---

## Recommended Architecture

### Phase 1: Ship It (Week 1-2)

```
Input ──→ LLM Classifier ──→ { type, confidence, alternatives[] }
               │
               ├── Model: Gemini 2.5 Flash Lite (cheapest, fastest) or GPT-4.1 nano (cheapest overall)
               │          or Claude 3.5 Haiku / Haiku 4.5 (best reasoning)
               ├── Prompt: Category definitions + 5 examples each + confidence instructions
               ├── Output: JSON with type, confidence (0-1), top 3 alternatives
               └── Structured output mode (JSON schema -- all major providers now support this natively)
```

**Model selection note (updated 2026-03-21):** Gemini 2.0 Flash, originally recommended,
is deprecated and shuts down June 1, 2026. Its direct successor is **Gemini 2.5 Flash Lite**
at the same price ($0.10/$0.40 per MTok). **GPT-4.1 nano** ($0.05/$0.20 per MTok) is the
cheapest option from a major US-based provider. **DeepSeek V3** is dramatically cheaper still
($0.014/$0.028 per MTok) but is hosted in China, which may have data-residency implications
for a US research platform.

- **If confidence >= 0.80:** Show classified type immediately
- **If confidence 0.50-0.79:** Show classified type with subtle "change type" affordance
- **If confidence < 0.50:** Show top 2-3 options, let user pick

Build a **classification evaluation set** from day one:
- 200+ labeled examples covering all six categories
- Include at least 50 deliberately ambiguous examples
- Run evals on every prompt change
- Log all user corrections (when they change the auto-classified type) as training signal

### Phase 2: Optimize (Month 2-3)

- Add rule-based fast path for SQL syntax, Python syntax, file references, and
  explicit note markers
- Implement speculative classification (classify on debounced keystrokes)
- Use logged user corrections to improve the few-shot examples in the prompt
- A/B test between model providers (Gemini 2.5 Flash Lite vs GPT-4.1 nano vs Claude Haiku)

### Phase 3: Evaluate Whether to Evolve (Month 6+)

With thousands of logged classifications and user corrections:
- Analyze: Are there systematic misclassification patterns the LLM can't fix with
  prompt changes?
- If yes: Consider fine-tuning a small model on The Helm's actual data
- If no: Keep the LLM approach -- it's working and easy to maintain

**Do not pre-invest in fine-tuning.** The data to do it well does not exist yet. The
LLM approach generates the labeled data (through user corrections) that would make
fine-tuning viable later if needed.

### Prompt Design Sketch

The classification prompt should include:

1. **System context:** "You are classifying scientist input for a research data platform.
   The same biological terminology appears across all categories -- classify by what the
   user wants to DO, not what the input is ABOUT."

2. **Category definitions:** Precise definitions emphasizing the *action* each category
   triggers (execute query, search literature, structure hypothesis, etc.)

3. **Few-shot examples:** 5 per category, including at least 2 "tricky" examples per
   category that could be confused with adjacent categories

4. **Disambiguation instructions:** Explicit rules for the hard cases:
   - Imperative + data verb = SQL unless asking about literature explicitly
   - Declarative claim about biology = Hypothesis unless referencing "studies", "papers",
     "research"
   - Short personal text without technical content = Note

5. **Output format:** JSON with `type`, `confidence`, `alternatives` (top 2-3 with scores),
   and a one-line `reasoning` field (for debugging, not shown to user)

---

## Conclusions

1. **Use an API LLM for classification.** This is an intent-classification problem where
   instruction-tuned LLMs have a structural advantage. The cost is negligible, the latency
   is acceptable, and the iteration speed is unmatched.

2. **Start with Gemini 2.5 Flash Lite, GPT-4.1 nano, or Claude 3.5 Haiku.** Gemini 2.5
   Flash Lite and GPT-4.1 nano offer the best cost/latency ratios ($0.05-0.10/MTok input).
   Claude 3.5 Haiku offers arguably better reasoning on ambiguous cases at higher cost.
   Run A/B tests with the eval set to decide. Note: Gemini 2.0 Flash (previously
   recommended) is deprecated and shuts down June 1, 2026 -- do not build on it.

3. **Do not invest in fine-tuning domain models (SciBERT, PubMedBERT) at this stage.**
   These models excel at topic classification, not intent classification. They would
   require weeks of labeling and training effort to achieve results that a prompted LLM
   matches out of the box. Revisit after 6+ months of logged classification data.

4. **Do not rely on embeddings + similarity as the primary approach.** Embeddings capture
   semantic content, not pragmatic intent. They will systematically confuse the
   Literature/Hypothesis/SQL-NLQuery triangle.

5. **Add a rule-based fast path as a Phase 2 optimization.** Rules for SQL syntax, Python
   syntax, and file references are trivially correct and avoid unnecessary API calls. But
   this is an optimization, not a prerequisite.

6. **Build the evaluation set from day one.** Classification quality is only as good as
   the ability to measure it. Log user corrections as implicit labels.

7. **Surface confidence to the user.** The irreducible ambiguity in domain-heavy scientific
   text means ~15-25% of inputs will have genuine classification uncertainty. The right UX
   is to show the best guess with an easy correction affordance, not to pretend certainty.

## Sources

### Provider Documentation (pricing and model availability verified 2026-03-21)

- [Anthropic Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) -- Claude 3.5 Haiku ($0.80/$4.00), Haiku 4.5 ($1.00/$5.00). Accessed 2026-03-21.
- [Anthropic model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations) -- Claude 3 Haiku retired Feb 2026. Accessed 2026-03-21.
- [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) -- JSON schema support GA for Haiku 4.5, Sonnet 4.5, Opus 4.5 as of Feb 2026. Accessed 2026-03-21.
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) -- GPT-4o-mini ($0.15/$0.60), GPT-4.1 mini ($0.20/$0.80), GPT-4.1 nano ($0.05/$0.20). Accessed 2026-03-21.
- [OpenAI model deprecations](https://developers.openai.com/api/docs/deprecations) -- GPT-4o-mini retired from ChatGPT Feb 2026; API still active. Azure retirement Feb 27, 2026. Accessed 2026-03-21.
- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) -- JSON schema support via `response_format`. Accessed 2026-03-21.
- [Google Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) -- Gemini 2.5 Flash ($0.30/$2.50), 2.5 Flash Lite ($0.10/$0.40), 2.0 Flash ($0.10/$0.40), 1.5 Flash ($0.075/$0.30). Accessed 2026-03-21.
- [Google Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations) -- Gemini 2.0 Flash shutdown June 1, 2026; Gemini 2.5 Flash shutdown June 17, 2026; Gemini 2.5 Flash Lite shutdown July 22, 2026. Accessed 2026-03-21.
- [Google Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output) -- JSON Schema support for all 2.5+ models. Accessed 2026-03-21.
- [DeepSeek API pricing](https://api-docs.deepseek.com/quick_start/pricing) -- DeepSeek V3 ($0.014/$0.028). Accessed 2026-03-21.

### Latency Benchmarks

- [Artificial Analysis LLM Leaderboard](https://artificialanalysis.ai/leaderboards/models) -- TTFT, throughput, and latency comparisons across providers. Accessed 2026-03-21.
- [Aidocmaker 2025 LLM Latency Benchmarks](https://www.aidocmaker.com/blog/2025-aidocmaker-com-llm-model-latency-benchmarks) -- Gemini Flash ~6.25s for 500-word summary; GPT-4o-mini ~12.25s; Claude 3.5 Haiku ~13-14s. Accessed 2026-03-21.
- [Gemini 2.5 Flash performance (pricepertoken.com)](https://pricepertoken.com/pricing-page/model/google-gemini-2.5-flash) -- 218 tok/s, 0.43s TTFT. Accessed 2026-03-21.

### Classification & Intent Recognition Research

- Parikh, S., et al. (2023). Exploring Zero and Few-shot Techniques for Intent Classification. ACL Industry Track. https://aclanthology.org/2023.acl-industry.71/ -- LLM prompting with intent descriptions achieves >85% top-5 accuracy; parameter-efficient fine-tuning yields best results with minimal data.
- Chae, Y. & Davidson, T. (2025). Large Language Models for Text Classification: From Zero-Shot Learning to Instruction-Tuning. *Sociological Methods & Research*. https://journals.sagepub.com/doi/10.1177/00491241251325243 -- Systematic comparison of 10 models across 4 training regimes; large instruction-tuned models strong zero-shot; fine-tuned small models competitive.
- Zyska, M., et al. (2025). Zero-Shot Classification with Commercial LLMs. *Electronics* 14(20):4101. https://www.mdpi.com/2079-9292/14/20/4101 -- 8 commercial LLMs evaluated on zero-shot classification; macro-F1 0.86-0.87 for top performers (DeepSeek, Grok, Gemini 2.0 Flash).
- Wei, J., et al. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. NeurIPS. https://arxiv.org/abs/2201.11903
- Brown, T., et al. (2020). Language Models are Few-Shot Learners. NeurIPS. https://arxiv.org/abs/2005.14165

### Domain Models

- Beltagy, I., Lo, K., & Cohan, A. (2019). SciBERT: A Pretrained Language Model for Scientific Text. EMNLP. https://arxiv.org/abs/1903.10676 -- [GitHub](https://github.com/allenai/scibert); [HuggingFace](https://huggingface.co/allenai/scibert_scivocab_uncased). Repo stable but not actively developed.
- Gu, Y., et al. (2021). Domain-Specific Language Model Pretraining for Biomedical Natural Language Processing. ACM THCI. https://arxiv.org/abs/2007.15779 -- PubMedBERT, now rebranded as BiomedBERT under `microsoft/BiomedNLP-*`. [HuggingFace](https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext). Updated May 2025.
- Luo, R., et al. (2022). BioGPT: Generative Pre-trained Transformer for Biomedical Text Generation and Mining. *Briefings in Bioinformatics*. https://arxiv.org/abs/2210.10341 -- [GitHub](https://github.com/microsoft/BioGPT); [HuggingFace](https://huggingface.co/microsoft/biogpt). Available but not actively developed.

### Embedding Models

- [OpenAI text-embedding documentation](https://platform.openai.com/docs/guides/embeddings) -- text-embedding-3-small/large pricing. Accessed 2026-03-21.
- [Voyage AI embeddings](https://docs.voyageai.com/) -- Voyage-3 pricing. Accessed 2026-03-21.
- [Allen AI SPECTER2](https://github.com/allenai/specter2) -- Scientific paper embeddings. Accessed 2026-03-21.

### Model Comparison Resources

- [LLM API Pricing Comparison (TLDL, March 2026)](https://www.tldl.io/resources/llm-api-pricing-2026) -- Cross-provider pricing table. Accessed 2026-03-21.
- [Choosing an LLM in 2026 (Dev.to)](https://dev.to/superorange0707/choosing-an-llm-in-2026-the-practical-comparison-table-specs-cost-latency-compatibility-354g) -- Specs, cost, latency comparison. Accessed 2026-03-21.
- [Low-Cost LLM Comparison (IntuitionLabs)](https://intuitionlabs.ai/articles/low-cost-llm-comparison) -- Budget model performance comparison. Accessed 2026-03-21.
