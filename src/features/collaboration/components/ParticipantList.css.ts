import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const avatarWrapper = style({
  position: 'relative',
  display: 'inline-flex',
});

export const avatar = style({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: `2px solid ${vars.color.surface}`,
});

export const avatarFallback = style({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: vars.color.border,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: vars.font.sans,
  fontSize: '11px',
  fontWeight: 600,
  color: vars.color.text,
  border: `2px solid ${vars.color.surface}`,
});

export const statusDot = style({
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  border: `1.5px solid ${vars.color.surface}`,
});

export const overflow = style({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: vars.color.border,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: vars.font.sans,
  fontSize: '11px',
  fontWeight: 600,
  color: vars.color.textMid,
});

export const tooltip = style({
  position: 'absolute',
  bottom: 'calc(100% + 4px)',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: vars.color.text,
  color: vars.color.surface,
  fontFamily: vars.font.sans,
  fontSize: '12px',
  lineHeight: 1.3,
  padding: '4px 8px',
  borderRadius: '4px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  zIndex: 100,
});
