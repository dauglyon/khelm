import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/theme';

const blinkKeyframes = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0 },
});

export const streamingContainer = style({
  fontFamily: vars.font.sans,
  fontSize: '15px',
  lineHeight: 1.6,
  color: vars.color.text,
  overflowY: 'auto',
  wordBreak: 'break-word',
});

export const cursor = style({
  display: 'inline-block',
  width: '2px',
  height: '1em',
  backgroundColor: 'currentColor',
  verticalAlign: 'text-bottom',
  marginLeft: '1px',
  animation: `${blinkKeyframes} 530ms step-end infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const codeBlockStyle = style({
  padding: '12px',
  borderRadius: '4px',
  backgroundColor: vars.color.bg,
  fontFamily: vars.font.mono,
  fontSize: '14px',
  lineHeight: 1.6,
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  margin: '8px 0',
});

export const paragraphStyle = style({
  marginTop: '8px',
  marginBottom: '8px',
});
