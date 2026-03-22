import { createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    bg: null,
    surface: null,
    border: null,
    text: null,
    textMid: null,
    textLight: null,
    status: {
      thinking: null,
      queued: null,
      running: null,
      complete: null,
      error: null,
    },
    inputType: {
      sql: { fg: null, bg: null, border: null },
      python: { fg: null, bg: null, border: null },
      literature: { fg: null, bg: null, border: null },
      chat: { fg: null, bg: null, border: null },
      note: { fg: null, bg: null, border: null },
      dataIngest: { fg: null, bg: null, border: null },
      task: { fg: null, bg: null, border: null },
    },
  },
  font: {
    mono: null,
    sans: null,
    serif: null,
  },
  easing: {
    out: null,
    inOut: null,
    outQuart: null,
  },
});

export type InputType =
  | 'sql'
  | 'python'
  | 'literature'
  | 'chat'
  | 'note'
  | 'dataIngest'
  | 'task';
