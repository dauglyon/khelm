import { style, styleVariants, keyframes } from '@vanilla-extract/css';
import { vars } from '@/theme';

const pulseKeyframes = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const previewContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
});

export const typePillBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 10px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: vars.font.sans,
  lineHeight: '20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  borderWidth: '1.5px',
  transition: `all 150ms ${vars.easing.inOut}`,
  userSelect: 'none',
});

export const solidBorder = style({
  borderStyle: 'solid',
});

export const dashedBorder = style({
  borderStyle: 'dashed',
});

export const pulseAnimation = style({
  animation: `${pulseKeyframes} 1.5s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const pillColorVariants = styleVariants({
  sql: {
    color: vars.color.inputType.sql.fg,
    backgroundColor: vars.color.inputType.sql.bg,
    borderColor: vars.color.inputType.sql.border,
  },
  python: {
    color: vars.color.inputType.python.fg,
    backgroundColor: vars.color.inputType.python.bg,
    borderColor: vars.color.inputType.python.border,
  },
  literature: {
    color: vars.color.inputType.literature.fg,
    backgroundColor: vars.color.inputType.literature.bg,
    borderColor: vars.color.inputType.literature.border,
  },
  hypothesis: {
    color: vars.color.inputType.hypothesis.fg,
    backgroundColor: vars.color.inputType.hypothesis.bg,
    borderColor: vars.color.inputType.hypothesis.border,
  },
  note: {
    color: vars.color.inputType.note.fg,
    backgroundColor: vars.color.inputType.note.bg,
    borderColor: vars.color.inputType.note.border,
  },
  dataIngest: {
    color: vars.color.inputType.dataIngest.fg,
    backgroundColor: vars.color.inputType.dataIngest.bg,
    borderColor: vars.color.inputType.dataIngest.border,
  },
});

export const lowConfidencePill = style({
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  opacity: 0.8,
});

export const dropdownOverlay = style({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  marginBottom: '4px',
  zIndex: 1000,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  padding: '4px',
  minWidth: '160px',
});

export const dropdownItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  cursor: 'pointer',
  borderRadius: '6px',
  fontSize: '13px',
  fontFamily: vars.font.sans,
  color: vars.color.text,
  transition: 'background 100ms ease',
  selectors: {
    '&:hover': {
      background: vars.color.bg,
    },
  },
});

export const dropdownColorDot = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  flexShrink: 0,
});
