# 05 -- Classification Service

## Dependencies

| Dependency | Type | What it provides |
|------------|------|------------------|
| 01 (store) | intra-domain | `useInputSurfaceStore` for writing classification results and reading `classifierMode` |

## Context

The classification service determines user intent from the input text. It runs a debounced pipeline: text changes trigger classification after 300ms of inactivity. The primary backend is Qwen3.5-4B via Ollama; if Ollama is unreachable, it falls back to an API provider. This task implements the classifier pipeline, prompt, and health check -- not the UI preview (task 06).

Reference: `architecture/input-surface.md` section 3 (Input Classification).

## Implementation Requirements

### Files to create

1. `src/features/input-surface/classifier/classificationService.ts` -- Classification pipeline, Ollama client, API fallback
2. `src/features/input-surface/classifier/classificationPrompt.ts` -- System prompt, few-shot examples, schema
3. `src/features/input-surface/classifier/classificationService.test.ts` -- Unit tests with MSW mocks

### Classification output schema

```ts
interface ClassificationResult {
  type: InputType;
  confidence: number;
  alternatives: Array<{ type: InputType; confidence: number }>;
}
```

### Pipeline

```
text change --> debounce(300ms) --> classify(text) --> store.setClassification(result)
```

| Step | Detail |
|------|--------|
| Debounce | 300ms after last call; new call cancels pending |
| Min input | Skip classification for text < 3 characters; clear classification |
| Stale cancel | `AbortController` cancels in-flight fetch when new request starts |
| Write result | Call `store.setClassification(result)` on success |
| Error | Log warning; do not update store (keep previous classification) |

### Ollama client (local mode)

| Aspect | Specification |
|--------|---------------|
| Endpoint | `POST http://localhost:11434/api/generate` |
| Model | `qwen3.5:4b` |
| Mode | `/no_think` appended to prompt to suppress chain-of-thought |
| Output format | `format: "json"` with grammar-constrained decoding |
| Max tokens | 50 |
| Expected latency | 100-200ms |

### API fallback

| Aspect | Specification |
|--------|---------------|
| Primary | Gemini 2.5 Flash Lite via Google AI API |
| Secondary | GPT-4.1 nano via OpenAI API |
| Output format | Provider-native JSON schema mode |
| Detection | Health-check Ollama on init (`GET http://localhost:11434/api/tags`); if unreachable, set `classifierMode: 'api'` |

### Health check

```ts
async function checkOllamaHealth(): Promise<boolean>
```

Called once on app init. If Ollama responds, set mode to `'local'`. If it fails (network error or timeout after 2s), set mode to `'api'`.

### Prompt requirements

| Element | Detail |
|---------|--------|
| System context | "Classify the user's intent by what they want to DO, not what the input is ABOUT" |
| Category definitions | Action-oriented: SQL=execute query, Python=run code, Literature=search papers, Hypothesis=structure claim, Note=store annotation, Data Ingest=load file |
| Few-shot examples | 5 per category, including 2 ambiguous/tricky per category (30 total) |
| Disambiguation rules | Imperative + data verb = SQL; declarative claim = Hypothesis; "papers"/"studies" = Literature; personal/task language = Note |
| Output constraint | JSON schema; `max_tokens: 50` |

### Exported API

```ts
// The debounced classify function
function createClassifier(store: InputSurfaceStore): {
  classify: (text: string) => void;   // debounced, writes to store
  destroy: () => void;                // cleanup: cancel pending, abort in-flight
  checkHealth: () => Promise<void>;   // run Ollama health check, set mode
}
```

## Demo Reference (Vignette 1 -- The Core Loop)

As the user types "SELECT * FROM biosample WHERE ecosystem_type = 'Soil'", after 300ms pause the classifier runs and returns `{ type: "sql", confidence: 0.95, alternatives: [...] }`. This result is written to the store and drives the classification preview (task 06).

## Integration Proofs

```bash
# Classifier pipeline works end-to-end with mocked Ollama
vitest run src/features/input-surface/classifier --reporter=verbose

# Verify: classify() debounces at 300ms
# Verify: text < 3 chars skips classification
# Verify: new call cancels in-flight request (AbortController)
# Verify: successful classification writes to store
# Verify: Ollama health check sets classifierMode
# Verify: API fallback is used when classifierMode is 'api'
# Verify: prompt includes all 6 categories with few-shot examples
```

### MSW mock handlers

```ts
// Mock Ollama generate endpoint
http.post('http://localhost:11434/api/generate', () => {
  return HttpResponse.json({
    response: JSON.stringify({ type: 'sql', confidence: 0.92, alternatives: [...] })
  });
});

// Mock Ollama health check
http.get('http://localhost:11434/api/tags', () => {
  return HttpResponse.json({ models: [{ name: 'qwen3.5:4b' }] });
});
```

## Acceptance Criteria

- [ ] `createClassifier` returns `classify`, `destroy`, and `checkHealth` functions
- [ ] `classify` debounces at 300ms
- [ ] Text shorter than 3 characters clears classification and does not call the backend
- [ ] New classify call cancels any in-flight request via `AbortController`
- [ ] Successful Ollama response is parsed and written to store via `setClassification`
- [ ] Failed requests do not clear previous classification
- [ ] `checkHealth` pings Ollama and sets `classifierMode` in store
- [ ] When `classifierMode` is `'api'`, classifier calls API fallback instead of Ollama
- [ ] Prompt follows spec: action-oriented system context, 30 few-shot examples, disambiguation rules
- [ ] Classification output conforms to `ClassificationResult` schema
- [ ] `destroy` cancels pending debounce and aborts in-flight fetch
- [ ] All tests use MSW mocks, no real network calls

## Anti-Patterns

- Do not render any UI in this task. This is a pure service module.
- Do not debounce inside the editor component. Debouncing lives in this service.
- Do not store the prompt inline in the service function. Keep it in `classificationPrompt.ts`.
- Do not use `setTimeout` for debounce. Use a proper debounce utility or implement with cleanup.
- Do not make the API fallback the primary path. Local Ollama is always attempted first if health check passes.
