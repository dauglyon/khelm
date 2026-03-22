import { createTheme } from '@vanilla-extract/css';
import { vars } from './contract.css';

export const themeClass = createTheme(vars, {
  color: {
    bg: '#EEF1EB',
    surface: '#F9FAF7',
    border: '#D5DAD0',
    text: '#1A1E18',
    textMid: '#434840',
    textLight: '#6B7268',
    status: {
      thinking: '#B8660D',
      queued: '#6B7280',
      running: '#2B6CB0',
      complete: '#1A7F5A',
      error: '#C53030',
    },
    inputType: {
      sql: { fg: '#2B6CB0', bg: '#E3EDF7', border: '#B0CDE4' },
      python: { fg: '#7B4EA3', bg: '#EDE5F5', border: '#C4B0DA' },
      literature: { fg: '#1A7F5A', bg: '#E0F2EA', border: '#A8D8C4' },
      chat: { fg: '#B8660D', bg: '#FBF0E0', border: '#E4C890' },
      note: { fg: '#7A6340', bg: '#F5F0E7', border: '#D6C8AD' },
      dataIngest: { fg: '#2D8E8E', bg: '#E0F2F2', border: '#A8D6D6' },
      task: { fg: '#7A3B5E', bg: '#F2E6EE', border: '#C9A3B8' },
    },
  },
  font: {
    mono: "'JetBrains Mono', Menlo, monospace",
    sans: "'DM Sans', system-ui, sans-serif",
    serif: "'Source Serif 4', Georgia, serif",
  },
  easing: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    outQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  },
});
