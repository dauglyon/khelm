import { style, globalStyle } from '@vanilla-extract/css';

export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

// Global reduced motion overrides
globalStyle('@media (prefers-reduced-motion: reduce)', {
  // Targets are set via individual component styles
});
