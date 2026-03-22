import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { createClassifier, checkOllamaHealth } from './classificationService';
import { SYSTEM_PROMPT, FEW_SHOT_EXAMPLES } from './classificationPrompt';

// Mock store
function createMockStore() {
  return {
    classifierMode: 'local' as 'local' | 'api',
    setClassification: vi.fn(),
    setIsClassifying: vi.fn(),
    setClassifierMode: vi.fn(),
  };
}

describe('classificationService', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createClassifier', () => {
    it('returns classify, destroy, and checkHealth functions', () => {
      const classifier = createClassifier(mockStore);
      expect(typeof classifier.classify).toBe('function');
      expect(typeof classifier.destroy).toBe('function');
      expect(typeof classifier.checkHealth).toBe('function');
      classifier.destroy();
    });

    it('debounces classification at 300ms', () => {
      server.use(
        http.post('http://localhost:11434/api/generate', () => {
          return HttpResponse.json({
            response: JSON.stringify({
              type: 'sql',
              confidence: 0.92,
              alternatives: [],
            }),
          });
        })
      );

      const classifier = createClassifier(mockStore);

      classifier.classify('SELECT * FROM table');

      // Should be classifying but no fetch yet
      expect(mockStore.setIsClassifying).toHaveBeenCalledWith(true);

      // Advance 200ms -- not yet fired
      vi.advanceTimersByTime(200);

      // Classification shouldn't have completed yet
      expect(mockStore.setClassification).not.toHaveBeenCalled();

      classifier.destroy();
    });

    it('skips classification for text shorter than 3 characters', () => {
      const classifier = createClassifier(mockStore);

      classifier.classify('ab');

      expect(mockStore.setIsClassifying).toHaveBeenCalledWith(false);
      expect(mockStore.setClassification).not.toHaveBeenCalled();

      classifier.destroy();
    });

    it('skips classification for whitespace-only text shorter than 3 chars', () => {
      const classifier = createClassifier(mockStore);

      classifier.classify('  ');

      expect(mockStore.setIsClassifying).toHaveBeenCalledWith(false);

      classifier.destroy();
    });

    it('cancels pending debounce on new call', () => {
      const classifier = createClassifier(mockStore);

      classifier.classify('SELECT');
      vi.advanceTimersByTime(100);
      classifier.classify('SELECT *');
      vi.advanceTimersByTime(100);
      classifier.classify('SELECT * FROM');

      // Only the latest classify should be pending
      // If debounce is correct, the earlier ones were cancelled
      expect(mockStore.setIsClassifying).toHaveBeenCalledWith(true);

      classifier.destroy();
    });

    it('writes classification result to store on success', async () => {
      vi.useRealTimers();

      const classificationResult = {
        type: 'sql',
        confidence: 0.92,
        alternatives: [{ type: 'python', confidence: 0.05 }],
      };

      server.use(
        http.post('http://localhost:11434/api/generate', () => {
          return HttpResponse.json({
            response: JSON.stringify(classificationResult),
          });
        })
      );

      const classifier = createClassifier(mockStore);
      classifier.classify('SELECT * FROM biosample');

      // Wait for debounce (300ms) + network
      await new Promise((r) => setTimeout(r, 500));

      expect(mockStore.setClassification).toHaveBeenCalledWith({
        type: 'sql',
        confidence: 0.92,
        alternatives: [{ type: 'python', confidence: 0.05 }],
      });

      classifier.destroy();
    });

    it('handles data_ingest type normalization', async () => {
      vi.useRealTimers();

      server.use(
        http.post('http://localhost:11434/api/generate', () => {
          return HttpResponse.json({
            response: JSON.stringify({
              type: 'data_ingest',
              confidence: 0.90,
              alternatives: [],
            }),
          });
        })
      );

      const classifier = createClassifier(mockStore);
      classifier.classify('Load the CSV from /uploads/data.csv');

      await new Promise((r) => setTimeout(r, 500));

      expect(mockStore.setClassification).toHaveBeenCalledWith({
        type: 'dataIngest',
        confidence: 0.90,
        alternatives: [],
      });

      classifier.destroy();
    });

    it('does not clear classification on error', async () => {
      vi.useRealTimers();

      server.use(
        http.post('http://localhost:11434/api/generate', () => {
          return HttpResponse.error();
        })
      );

      const classifier = createClassifier(mockStore);
      classifier.classify('SELECT * FROM table');

      await new Promise((r) => setTimeout(r, 500));

      // setClassification should NOT have been called on error
      expect(mockStore.setClassification).not.toHaveBeenCalled();

      classifier.destroy();
    });

    it('uses API fallback when classifierMode is api', async () => {
      vi.useRealTimers();

      mockStore.classifierMode = 'api';

      server.use(
        http.post('/api/classify', () => {
          return HttpResponse.json({
            type: 'literature',
            confidence: 0.88,
            alternatives: [{ type: 'chat', confidence: 0.08 }],
          });
        })
      );

      const classifier = createClassifier(mockStore);
      classifier.classify('Recent papers on CRISPR');

      await new Promise((r) => setTimeout(r, 500));

      expect(mockStore.setClassification).toHaveBeenCalledWith({
        type: 'literature',
        confidence: 0.88,
        alternatives: [{ type: 'chat', confidence: 0.08 }],
      });

      classifier.destroy();
    });

    it('destroy cancels pending debounce', () => {
      const classifier = createClassifier(mockStore);
      classifier.classify('SELECT * FROM table');

      classifier.destroy();

      // Advance past debounce -- should not trigger
      vi.advanceTimersByTime(500);

      // setClassification should NOT have been called
      expect(mockStore.setClassification).not.toHaveBeenCalled();
    });
  });

  describe('checkOllamaHealth', () => {
    it('returns true when Ollama is available', async () => {
      vi.useRealTimers();

      server.use(
        http.get('http://localhost:11434/api/tags', () => {
          return HttpResponse.json({
            models: [{ name: 'qwen3.5:4b' }],
          });
        })
      );

      const healthy = await checkOllamaHealth();
      expect(healthy).toBe(true);
    });

    it('returns false when Ollama is unreachable', async () => {
      vi.useRealTimers();

      server.use(
        http.get('http://localhost:11434/api/tags', () => {
          return HttpResponse.error();
        })
      );

      const healthy = await checkOllamaHealth();
      expect(healthy).toBe(false);
    });

    it('classifier checkHealth sets mode to local when healthy', async () => {
      vi.useRealTimers();

      server.use(
        http.get('http://localhost:11434/api/tags', () => {
          return HttpResponse.json({ models: [] });
        })
      );

      const classifier = createClassifier(mockStore);
      await classifier.checkHealth();

      expect(mockStore.setClassifierMode).toHaveBeenCalledWith('local');

      classifier.destroy();
    });

    it('classifier checkHealth sets mode to api when unhealthy', async () => {
      vi.useRealTimers();

      server.use(
        http.get('http://localhost:11434/api/tags', () => {
          return HttpResponse.error();
        })
      );

      const classifier = createClassifier(mockStore);
      await classifier.checkHealth();

      expect(mockStore.setClassifierMode).toHaveBeenCalledWith('api');

      classifier.destroy();
    });
  });

  describe('classificationPrompt', () => {
    it('system prompt includes all 6 categories', () => {
      expect(SYSTEM_PROMPT).toContain('sql');
      expect(SYSTEM_PROMPT).toContain('python');
      expect(SYSTEM_PROMPT).toContain('literature');
      expect(SYSTEM_PROMPT).toContain('chat');
      expect(SYSTEM_PROMPT).toContain('note');
      expect(SYSTEM_PROMPT).toContain('data_ingest');
    });

    it('system prompt focuses on intent classification', () => {
      expect(SYSTEM_PROMPT).toContain('what they want to DO');
      expect(SYSTEM_PROMPT).toContain('not what the input is ABOUT');
    });

    it('has 30 few-shot examples (5 per category)', () => {
      expect(FEW_SHOT_EXAMPLES.length).toBe(30);

      const byCat: Record<string, number> = {};
      for (const ex of FEW_SHOT_EXAMPLES) {
        const t = ex.output.type;
        byCat[t] = (byCat[t] || 0) + 1;
      }

      expect(byCat['sql']).toBe(5);
      expect(byCat['python']).toBe(5);
      expect(byCat['literature']).toBe(5);
      expect(byCat['chat']).toBe(5);
      expect(byCat['note']).toBe(5);
      expect(byCat['data_ingest']).toBe(5);
    });

    it('includes disambiguation rules', () => {
      expect(SYSTEM_PROMPT).toContain('Disambiguation');
      expect(SYSTEM_PROMPT).toContain('Imperative sentence + data verb');
      expect(SYSTEM_PROMPT).toContain('Conversational question');
    });
  });
});
