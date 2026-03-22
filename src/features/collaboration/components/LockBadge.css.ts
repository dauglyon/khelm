import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const badgeContainer = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const badgeAvatar = style({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  objectFit: 'cover',
});

export const badgeFallback = style({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: vars.color.border,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: vars.font.sans,
  fontSize: '10px',
  fontWeight: 600,
  color: vars.color.text,
});

export const aiIcon = style({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#6B46C1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: vars.font.sans,
  fontSize: '11px',
  fontWeight: 700,
  color: '#FFFFFF',
});

export const badgeTooltip = style({
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
