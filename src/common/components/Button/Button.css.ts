import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const buttonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  borderRadius: '6px',
  border: '1px solid transparent',
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: vars.font.sans,
  transition: 'background-color 150ms, border-color 150ms, box-shadow 150ms',
  outline: 'none',
  ':focus-visible': {
    outline: `2px solid ${vars.color.text}`,
    outlineOffset: '2px',
  },
});

export const sizeVariants = styleVariants({
  sm: {
    height: '28px',
    padding: '0 10px',
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  md: {
    height: '36px',
    padding: '0 14px',
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  lg: {
    height: '44px',
    padding: '0 18px',
    fontSize: '15px',
    fontWeight: 500,
    lineHeight: 1.5,
  },
});

export const colorVariantStyles = styleVariants({
  'solid-primary': {
    backgroundColor: vars.color.text,
    color: vars.color.surface,
    borderColor: vars.color.text,
    ':hover': {
      backgroundColor: vars.color.textMid,
      borderColor: vars.color.textMid,
    },
  },
  'solid-danger': {
    backgroundColor: vars.color.status.error,
    color: vars.color.surface,
    borderColor: vars.color.status.error,
    ':hover': {
      opacity: 0.9,
    },
  },
  'solid-neutral': {
    backgroundColor: vars.color.textMid,
    color: vars.color.surface,
    borderColor: vars.color.textMid,
    ':hover': {
      backgroundColor: vars.color.textLight,
      borderColor: vars.color.textLight,
    },
  },
  'outline-primary': {
    backgroundColor: 'transparent',
    color: vars.color.text,
    borderColor: vars.color.text,
    ':hover': {
      backgroundColor: vars.color.bg,
    },
  },
  'outline-danger': {
    backgroundColor: 'transparent',
    color: vars.color.status.error,
    borderColor: vars.color.status.error,
    ':hover': {
      // Pragmatic exception: no tint token exists for danger hover. Raw rgba derived from vars.color.status.error (#C53030).
      backgroundColor: 'rgba(197, 48, 48, 0.05)',
    },
  },
  'outline-neutral': {
    backgroundColor: 'transparent',
    color: vars.color.textMid,
    borderColor: vars.color.border,
    ':hover': {
      backgroundColor: vars.color.bg,
    },
  },
  'ghost-primary': {
    backgroundColor: 'transparent',
    color: vars.color.text,
    borderColor: 'transparent',
    ':hover': {
      backgroundColor: vars.color.bg,
    },
  },
  'ghost-danger': {
    backgroundColor: 'transparent',
    color: vars.color.status.error,
    borderColor: 'transparent',
    ':hover': {
      // Pragmatic exception: no tint token exists for danger hover. Raw rgba derived from vars.color.status.error (#C53030).
      backgroundColor: 'rgba(197, 48, 48, 0.05)',
    },
  },
  'ghost-neutral': {
    backgroundColor: 'transparent',
    color: vars.color.textMid,
    borderColor: 'transparent',
    ':hover': {
      backgroundColor: vars.color.bg,
    },
  },
});

export const disabledStyle = style({
  opacity: 0.5,
  pointerEvents: 'none',
});

export const iconSlot = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
});
