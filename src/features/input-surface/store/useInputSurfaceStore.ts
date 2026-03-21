import { create } from 'zustand';
import type { InputType } from '@/theme';

export type { InputType };

export interface ClassificationResult {
  type: InputType;
  confidence: number;
  alternatives: Array<{ type: InputType; confidence: number }>;
}

export interface InputSurfaceState {
  classifiedType: InputType | null;
  confidence: number | null;
  alternatives: Array<{ type: InputType; confidence: number }>;
  userOverrideType: InputType | null;
  isClassifying: boolean;
  isSubmitting: boolean;
  classifierMode: 'local' | 'api';
}

export interface InputSurfaceActions {
  setClassification: (result: ClassificationResult) => void;
  setUserOverride: (type: InputType) => void;
  clearUserOverride: () => void;
  setIsClassifying: (flag: boolean) => void;
  setIsSubmitting: (flag: boolean) => void;
  setClassifierMode: (mode: 'local' | 'api') => void;
  reset: () => void;
  resolvedType: () => InputType | null;
}

export type InputSurfaceStore = InputSurfaceState & InputSurfaceActions;

const initialState: InputSurfaceState = {
  classifiedType: null,
  confidence: null,
  alternatives: [],
  userOverrideType: null,
  isClassifying: false,
  isSubmitting: false,
  classifierMode: 'local',
};

export const useInputSurfaceStore = create<InputSurfaceStore>()((set, get) => ({
  ...initialState,

  setClassification: (result: ClassificationResult) =>
    set({
      classifiedType: result.type,
      confidence: result.confidence,
      alternatives: result.alternatives,
      userOverrideType: null,
    }),

  setUserOverride: (type: InputType) =>
    set({ userOverrideType: type }),

  clearUserOverride: () =>
    set({ userOverrideType: null }),

  setIsClassifying: (flag: boolean) =>
    set({ isClassifying: flag }),

  setIsSubmitting: (flag: boolean) =>
    set({ isSubmitting: flag }),

  setClassifierMode: (mode: 'local' | 'api') =>
    set({ classifierMode: mode }),

  reset: () => set(initialState),

  resolvedType: () => {
    const state = get();
    return state.userOverrideType ?? state.classifiedType;
  },
}));
