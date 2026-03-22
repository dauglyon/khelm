import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const noteContainer = style({
  padding: '0 16px 16px',
});

export const noteTextarea = style({
  width: '100%',
  minHeight: '80px',
  border: 'none',
  backgroundColor: 'transparent',
  resize: 'vertical',
  fontFamily: vars.font.sans,
  fontSize: '15px',
  fontWeight: 400,
  lineHeight: 1.5,
  color: vars.color.text,
  outline: 'none',
  padding: 0,
  margin: 0,
  '::placeholder': {
    color: vars.color.textLight,
  },
  ':focus': {
    outline: `2px solid ${vars.color.status.running}`,
    outlineOffset: '2px',
    borderRadius: '2px',
  },
});
