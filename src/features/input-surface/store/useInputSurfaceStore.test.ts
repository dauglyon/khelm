import { describe, it, expect, beforeEach } from 'vitest';
import { useInputSurfaceStore } from './useInputSurfaceStore';
import type { ClassificationResult } from './useInputSurfaceStore';

describe('useInputSurfaceStore', () => {
  beforeEach(() => {
    useInputSurfaceStore.getState().reset();
  });

  it('initializes with null classification', () => {
    const state = useInputSurfaceStore.getState();
    expect(state.classifiedTypes).toBeNull();
    expect(state.alternatives).toBeNull();
    expect(state.userOverrideTypes).toBeNull();
    expect(state.isClassifying).toBe(false);
    expect(state.isSubmitting).toBe(false);
    expect(state.classifierMode).toBe('local');
  });

  describe('setClassification', () => {
    it('populates classifiedTypes and alternatives as pipeline arrays', () => {
      const result: ClassificationResult = {
        types: ['sql', 'python'],
        alternatives: [['note']],
      };

      useInputSurfaceStore.getState().setClassification(result);
      const state = useInputSurfaceStore.getState();

      expect(state.classifiedTypes).toEqual(['sql', 'python']);
      expect(state.alternatives).toEqual([['note']]);
    });

    it('stores single-element pipeline when only one type', () => {
      const result: ClassificationResult = {
        types: ['chat'],
      };

      useInputSurfaceStore.getState().setClassification(result);
      const state = useInputSurfaceStore.getState();

      expect(state.classifiedTypes).toEqual(['chat']);
      expect(state.alternatives).toBeNull();
    });

    it('sets alternatives to null when omitted', () => {
      const result: ClassificationResult = {
        types: ['sql'],
      };

      useInputSurfaceStore.getState().setClassification(result);
      const state = useInputSurfaceStore.getState();

      expect(state.classifiedTypes).toEqual(['sql']);
      expect(state.alternatives).toBeNull();
    });

    it('clears userOverrideTypes when new classification arrives', () => {
      const store = useInputSurfaceStore.getState();
      store.setUserOverrideTypes(['python']);
      expect(useInputSurfaceStore.getState().userOverrideTypes).toEqual(['python']);

      store.setClassification({
        types: ['sql'],
      });

      expect(useInputSurfaceStore.getState().userOverrideTypes).toBeNull();
    });
  });

  describe('setUserOverrideTypes', () => {
    it('sets the user override pipeline array', () => {
      useInputSurfaceStore.getState().setUserOverrideTypes(['chat']);
      expect(useInputSurfaceStore.getState().userOverrideTypes).toEqual(['chat']);
    });

    it('accepts multi-type pipeline overrides', () => {
      useInputSurfaceStore.getState().setUserOverrideTypes(['sql', 'python']);
      expect(useInputSurfaceStore.getState().userOverrideTypes).toEqual(['sql', 'python']);
    });

    it('accepts null to clear the override', () => {
      useInputSurfaceStore.getState().setUserOverrideTypes(['chat']);
      useInputSurfaceStore.getState().setUserOverrideTypes(null);
      expect(useInputSurfaceStore.getState().userOverrideTypes).toBeNull();
    });
  });

  describe('clearUserOverrideTypes', () => {
    it('resets userOverrideTypes to null', () => {
      const store = useInputSurfaceStore.getState();
      store.setUserOverrideTypes(['python']);
      expect(useInputSurfaceStore.getState().userOverrideTypes).toEqual(['python']);

      store.clearUserOverrideTypes();
      expect(useInputSurfaceStore.getState().userOverrideTypes).toBeNull();
    });
  });

  describe('resolvedTypes', () => {
    it('returns classifiedTypes pipeline when no override is set', () => {
      useInputSurfaceStore.getState().setClassification({
        types: ['literature'],
      });

      expect(useInputSurfaceStore.getState().resolvedTypes()).toEqual(['literature']);
    });

    it('returns compound pipeline when classified as multi-type', () => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql', 'python'],
      });

      expect(useInputSurfaceStore.getState().resolvedTypes()).toEqual(['sql', 'python']);
    });

    it('returns userOverrideTypes pipeline when set (takes precedence over classifier)', () => {
      const store = useInputSurfaceStore.getState();
      store.setClassification({
        types: ['literature'],
      });
      store.setUserOverrideTypes(['chat']);

      expect(useInputSurfaceStore.getState().resolvedTypes()).toEqual(['chat']);
    });

    it('returns userOverrideTypes multi-type pipeline when set', () => {
      const store = useInputSurfaceStore.getState();
      store.setClassification({
        types: ['chat'],
      });
      store.setUserOverrideTypes(['sql', 'python']);

      expect(useInputSurfaceStore.getState().resolvedTypes()).toEqual(['sql', 'python']);
    });

    it('returns null when neither classified nor overridden', () => {
      expect(useInputSurfaceStore.getState().resolvedTypes()).toBeNull();
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
        types: ['sql', 'python'],
        alternatives: [['note']],
      });
      store.setUserOverrideTypes(['chat']);
      store.setIsClassifying(true);
      store.setIsSubmitting(true);
      store.setClassifierMode('api');

      store.reset();

      const state = useInputSurfaceStore.getState();
      expect(state.classifiedTypes).toBeNull();
      expect(state.alternatives).toBeNull();
      expect(state.userOverrideTypes).toBeNull();
      expect(state.isClassifying).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.classifierMode).toBe('local');
    });
  });
});
