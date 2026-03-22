import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/theme';
import type { InputType } from '@/theme';

export const chipBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '9999px',
  border: '1px solid',
  fontFamily: vars.font.sans,
});

export const chipSizeVariants = styleVariants({
  sm: {
    height: '20px',
    padding: '0 6px',
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  md: {
    height: '26px',
    padding: '0 10px',
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
});

const inputTypes: InputType[] = [
  'sql',
  'python',
  'literature',
  'chat',
  'note',
  'dataIngest',
  'task',
];

export const chipColorVariants = styleVariants(
  Object.fromEntries(
    inputTypes.map((type) => [
      type,
      {
        color: vars.color.inputType[type].fg,
        backgroundColor: vars.color.inputType[type].bg,
        borderColor: vars.color.inputType[type].border,
      },
    ])
  ) as Record<InputType, { color: string; backgroundColor: string; borderColor: string }>
);

export const closeButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  padding: 0,
  marginLeft: '4px',
  color: 'inherit',
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  ':hover': {
    opacity: 0.7,
  },
  ':focus-visible': {
    outline: `2px solid ${vars.color.text}`,
    outlineOffset: '2px',
  },
});
