import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/theme';
import type { InputType } from '@/theme';

export const cardBase = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '8px',
  padding: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'box-shadow 150ms, border-color 150ms',
  // Reserve space for accent bar
  paddingTop: '19px',
});

export const selectedStyle = style({
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderColor: vars.color.textLight,
});

export const accentBar = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '3px',
  borderRadius: '8px 8px 0 0',
});

const inputTypes: InputType[] = [
  'sql',
  'python',
  'literature',
  'hypothesis',
  'note',
  'dataIngest',
  'task',
];

export const accentColorVariants = styleVariants(
  Object.fromEntries(
    inputTypes.map((type) => [
      type,
      {
        backgroundColor: vars.color.inputType[type].border,
      },
    ])
  ) satisfies Record<InputType, { backgroundColor: string }>
);
