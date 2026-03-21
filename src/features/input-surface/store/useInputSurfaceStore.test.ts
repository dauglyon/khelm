import { describe, it, expect, beforeEach } from 'vitest';
import { useInputSurfaceStore } from './useInputSurfaceStore';
import type { ClassificationResult } from './useInputSurfaceStore';

describe('useInputSurfaceStore', () => {
  beforeEach(() => {
    useInputSurfaceStore.getState().reset();
  });

  it('initializes with null classification', () => {
    const state = useInputSurfaceStore.getState();
    expect(state.classifiedType).toBeNull();
    expect(state.confidence).toBeNull();
    expect(state.alternatives).toEqual([]);
    expect(state.userOverrideType).toBeNull();
    expect(state.isClassifying).toBe(false);
    expect(state.isSubmitting).toBe(false);
    expect(state.classifierMode).toBe('local');
  });

  describe('setClassification', () => {
    it('populates classifiedType, confidence, and alternatives', () => {
      const result: ClassificationResult = {
        type: 'sql',
        confidence: 0.92,
        alternatives: [
          { type: 'python', confidence: 0.05 },
          { type: 'note', confidence: 0.03 },
        ],
      };

      useInputSurfaceStore.getState().setClassification(result);
      const state = useInputSurfaceStore.getState();

      expect(state.classifiedType).toBe('sql');
      expect(state.confidence).toBe(0.92);
      expect(state.alternatives).toEqual([
        { type: 'python', confidence: 0.05 },
        { type: 'note', confidence: 0.03 },
      ]);
    });

    it('clears userOverrideType when new classification arrives', () => {
      const store = useInputSurfaceStore.getState();
      store.setUserOverride('python');
      expect(useInputSurfaceStore.getState().userOverrideType).toBe('python');

      store.setClassification({
        type: 'sql',
        confidence: 0.92,
        alternatives: [],
      });

      expect(useInputSurfaceStore.getState().userOverrideType).toBeNull();
    });
  });

  describe('setUserOverride', () => {
    it('sets the user override type', () => {
      useInputSurfaceStore.getState().setUserOverride('hypothesis');
      expect(useInputSurfaceStore.getState().userOverrideType).toBe('hypothesis');
    });
  });

  describe('clearUserOverride', () => {
    it('resets userOverrideType to null', () => {
      const store = useInputSurfaceStore.getState();
      store.setUserOverride('python');
      expect(useInputSurfaceStore.getState().userOverrideType).toBe('python');

      store.clearUserOverride();
      expect(useInputSurfaceStore.getState().userOverrideType).toBeNull();
    });
  });

  describe('resolvedType', () => {
    it('returns classifiedType when no override is set', () => {
      useInputSurfaceStore.getState().setClassification({
        type: 'literature',
        confidence: 0.85,
        alternatives: [],
      });

      expect(useInputSurfaceStore.getState().resolvedType()).toBe('literature');
    });

    it('returns userOverrideType when set (takes precedence)', () => {
      const store = useInputSurfaceStore.getState();
      store.setClassification({
        type: 'literature',
        confidence: 0.85,
        alternatives: [],
      });
      store.setUserOverride('hypothesis');

      expect(useInputSurfaceStore.getState().resolvedType()).toBe('hypothesis');
    });

    it('returns null when neither classified nor overridden', () => {
      expect(useInputSurfaceStore.getState().resolvedType()).toBeNull();
    });
  });

  describe('setIsClassifying', () => {
    it('sets the classifying flag', () => {
      useInputSurfaceStore.getState().setIsClassifying(true);
      expect(useInputSurfaceStore.getState().isClassifying).toBe(true);

      useInputSurfaceStore.getState().setIsClassifying(false);
      expect(useInputSurfaceStore.getState().isClassifying).toBe(false);
    });
  });

  describe('setIsSubmitting', () => {
    it('sets the submitting flag', () => {
      useInputSurfaceStore.getState().setIsSubmitting(true);
      expect(useInputSurfaceStore.getState().isSubmitting).toBe(true);

      useInputSurfaceStore.getState().setIsSubmitting(false);
      expect(useInputSurfaceStore.getState().isSubmitting).toBe(false);
    });
  });

  describe('setClassifierMode', () => {
    it('sets the classifier mode', () => {
      useInputSurfaceStore.getState().setClassifierMode('api');
      expect(useInputSurfaceStore.getState().classifierMode).toBe('api');

      useInputSurfaceStore.getState().setClassifierMode('local');
      expect(useInputSurfaceStore.getState().classifierMode).toBe('local');
    });
  });

  describe('reset', () => {
    it('returns all fields to initial values', () => {
      const store = useInputSurfaceStore.getState();
      store.setClassification({
        type: 'sql',
        confidence: 0.92,
        alternatives: [{ type: 'python', confidence: 0.05 }],
      });
      store.setUserOverride('hypothesis');
      store.setIsClassifying(true);
      store.setIsSubmitting(true);
      store.setClassifierMode('api');

      store.reset();

      const state = useInputSurfaceStore.getState();
      expect(state.classifiedType).toBeNull();
      expect(state.confidence).toBeNull();
      expect(state.alternatives).toEqual([]);
      expect(state.userOverrideType).toBeNull();
      expect(state.isClassifying).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.classifierMode).toBe('local');
    });
  });
});
