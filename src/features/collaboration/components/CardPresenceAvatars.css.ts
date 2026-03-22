import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const container = style({
  display: 'flex',
  alignItems: 'center',
});

export const avatarItem = style({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginLeft: '-6px',
  border: `1.5px solid ${vars.color.surface}`,
  selectors: {
    '&:first-child': {
      marginLeft: 0,
    },
  },
});

export const avatarFallback = style({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: vars.color.border,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: vars.font.sans,
  fontSize: '9px',
  fontWeight: 600,
  color: vars.color.text,
  marginLeft: '-6px',
  border: `1.5px solid ${vars.color.surface}`,
  selectors: {
    '&:first-child': {
      marginLeft: 0,
    },
  },
});

export const overflowCount = style({
  fontFamily: vars.font.sans,
  fontSize: '10px',
  fontWeight: 600,
  color: vars.color.textMid,
  marginLeft: '2px',
});
