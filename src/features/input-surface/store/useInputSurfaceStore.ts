import { create } from 'zustand';
import type { InputType } from '@/theme';

export type { InputType };

export interface ClassificationResult {
  types: string[];
  alternatives?: string[][];
}

export interface InputSurfaceState {
  classifiedTypes: string[] | null;
  alternatives: string[][] | null;
  userOverrideTypes: string[] | null;
  isClassifying: boolean;
  isSubmitting: boolean;
  classifierMode: 'local' | 'api';
}

export interface InputSurfaceActions {
  setClassification: (result: ClassificationResult) => void;
  setUserOverrideTypes: (types: string[] | null) => void;
  clearUserOverrideTypes: () => void;
  setIsClassifying: (flag: boolean) => void;
  setIsSubmitting: (flag: boolean) => void;
  setClassifierMode: (mode: 'local' | 'api') => void;
  reset: () => void;
  resolvedTypes: () => string[] | null;
}

export type InputSurfaceStore = InputSurfaceState & InputSurfaceActions;

const initialState: InputSurfaceState = {
  classifiedTypes: null,
  alternatives: null,
  userOverrideTypes: null,
  isClassifying: false,
  isSubmitting: false,
  classifierMode: 'local',
};

export const useInputSurfaceStore = create<InputSurfaceStore>()((set, get) => ({
  ...initialState,

  setClassification: (result: ClassificationResult) =>
    set({
      classifiedTypes: result.types,
      alternatives: result.alternatives ?? null,
      userOverrideTypes: null,
    }),

  setUserOverrideTypes: (types: string[] | null) =>
    set({ userOverrideTypes: types }),

  clearUserOverrideTypes: () =>
    set({ userOverrideTypes: null }),

  setIsClassifying: (flag: boolean) =>
    set({ isClassifying: flag }),

  setIsSubmitting: (flag: boolean) =>
    set({ isSubmitting: flag }),

  setClassifierMode: (mode: 'local' | 'api') =>
    set({ classifierMode: mode }),

  reset: () => set(initialState),

  resolvedTypes: () => {
    const state = get();
    return state.userOverrideTypes ?? state.classifiedTypes;
  },
}));
