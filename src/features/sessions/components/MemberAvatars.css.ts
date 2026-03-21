import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const avatarGroup = style({
  display: 'flex',
  alignItems: 'center',
});

export const avatar = style({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 600,
  color: vars.color.surface,
  border: `2px solid ${vars.color.surface}`,
  marginLeft: '-6px',
  selectors: {
    '&:first-child': {
      marginLeft: 0,
    },
  },
  fontFamily: vars.font.sans,
});

export const overflowBadge = style({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  fontWeight: 600,
  color: vars.color.textMid,
  backgroundColor: vars.color.border,
  border: `2px solid ${vars.color.surface}`,
  marginLeft: '-6px',
  fontFamily: vars.font.sans,
});
