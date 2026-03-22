import type { InputSurfaceStore, ClassificationResult } from '../store/useInputSurfaceStore';
import { buildClassificationPrompt, buildApiPrompt } from './classificationPrompt';

// Re-export for convenience
export type { ClassificationResult };

/** Map from wire format (data_ingest) to store format (dataIngest) */
function normalizeType(type: string): ClassificationResult['type'] | null {
  const map: Record<string, ClassificationResult['type']> = {
    sql: 'sql',
    python: 'python',
    literature: 'literature',
    chat: 'chat',
    note: 'note',
    data_ingest: 'dataIngest',
    dataIngest: 'dataIngest',
    dataingest: 'dataIngest',
  };
  return map[type.toLowerCase()] ?? null;
}

/** Validate and parse a classification response */
function parseClassificationResponse(raw: string): ClassificationResult | null {
  try {
    const parsed = JSON.parse(raw);
    const type = normalizeType(parsed.type);
    if (!type) return null;

    const confidence = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0;

    const alternatives = Array.isArray(parsed.alternatives)
      ? parsed.alternatives
          .map((alt: { type: string; confidence: number }) => {
            const altType = normalizeType(alt.type);
            if (!altType) return null;
            return {
              type: altType,
              confidence: typeof alt.confidence === 'number'
                ? Math.max(0, Math.min(1, alt.confidence))
                : 0,
            };
          })
          .filter(Boolean) as ClassificationResult['alternatives']
      : [];

    return { type, confidence, alternatives };
  } catch {
    return null;
  }
}

/** Call Ollama local model */
async function classifyWithOllama(
  text: string,
  signal: AbortSignal
): Promise<ClassificationResult | null> {
  const prompt = buildClassificationPrompt(text);

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3.5:4b',
      prompt,
      format: 'json',
      stream: false,
      options: { num_predict: 50 },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}`);
  }

  const data = await response.json();
  return parseClassificationResponse(data.response);
}

/** Call API fallback */
async function classifyWithApi(
  text: string,
  signal: AbortSignal
): Promise<ClassificationResult | null> {
  const prompt = buildApiPrompt(text);

  // API fallback endpoint (mock-compatible)
  const response = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, prompt }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API classifier returned ${response.status}`);
  }

  const data = await response.json();
  // API response may be the classification directly or nested
  const raw = typeof data.response === 'string' ? data.response : JSON.stringify(data);
  return parseClassificationResponse(raw);
}

/** Check if Ollama is available */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch('http://localhost:11434/api/tags', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export interface Classifier {
  classify: (text: string) => void;
  destroy: () => void;
  checkHealth: () => Promise<void>;
}

/**
 * Creates a classifier instance that debounces input and writes results to the store.
 */
export function createClassifier(
  store: Pick<InputSurfaceStore, 'setClassification' | 'setIsClassifying' | 'setClassifierMode' | 'classifierMode'>
): Classifier {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let abortController: AbortController | null = null;

  function classify(text: string): void {
    // Cancel pending debounce
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    // Cancel in-flight request
    if (abortController) {
      abortController.abort();
      abortController = null;
    }

    // Min input check
    if (text.trim().length < 3) {
      store.setIsClassifying(false);
      return;
    }

    store.setIsClassifying(true);

    debounceTimer = setTimeout(async () => {
      abortController = new AbortController();
      const signal = abortController.signal;

      try {
        let result: ClassificationResult | null = null;

        if (store.classifierMode === 'local') {
          result = await classifyWithOllama(text, signal);
        } else {
          result = await classifyWithApi(text, signal);
        }

        if (result && !signal.aborted) {
          store.setClassification(result);
        }
      } catch (error: unknown) {
        // Don't update store on abort or error (keep previous classification)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.warn('Classification failed:', error);
      } finally {
        if (!abortController?.signal.aborted) {
          store.setIsClassifying(false);
        }
      }
    }, 300);
  }

  function destroy(): void {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  }

  async function checkHealth(): Promise<void> {
    const isHealthy = await checkOllamaHealth();
    store.setClassifierMode(isHealthy ? 'local' : 'api');
  }

  return { classify, destroy, checkHealth };
}
