import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles';
import { vars } from './contract.css';

// Curated color subset: base 6 + status 4
// InputType colors are intentionally excluded (use styleVariants instead)
const colorValues = {
  bg: vars.color.bg,
  surface: vars.color.surface,
  border: vars.color.border,
  text: vars.color.text,
  textMid: vars.color.textMid,
  textLight: vars.color.textLight,
  statusThinking: vars.color.status.thinking,
  statusRunning: vars.color.status.running,
  statusComplete: vars.color.status.complete,
  statusError: vars.color.status.error,
};

const spacingValues = {
  0: '0px',
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px',
  48: '48px',
  64: '64px',
};

const colorProperties = defineProperties({
  properties: {
    color: colorValues,
    backgroundColor: colorValues,
    borderColor: colorValues,
  },
});

const spacingProperties = defineProperties({
  properties: {
    padding: spacingValues,
    paddingTop: spacingValues,
    paddingRight: spacingValues,
    paddingBottom: spacingValues,
    paddingLeft: spacingValues,
    margin: spacingValues,
    marginTop: spacingValues,
    marginRight: spacingValues,
    marginBottom: spacingValues,
    marginLeft: spacingValues,
    gap: spacingValues,
  },
});

const typographyProperties = defineProperties({
  properties: {
    fontFamily: {
      mono: vars.font.mono,
      sans: vars.font.sans,
      serif: vars.font.serif,
    },
    fontSize: {
      11: '11px',
      12: '12px',
      13: '13px',
      14: '14px',
      15: '15px',
      18: '18px',
      22: '22px',
      28: '28px',
    },
    fontWeight: {
      400: '400',
      500: '500',
      600: '600',
      700: '700',
    },
    lineHeight: {
      1.2: '1.2',
      1.3: '1.3',
      1.4: '1.4',
      1.5: '1.5',
      1.6: '1.6',
    },
  },
});

const layoutProperties = defineProperties({
  properties: {
    display: ['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid'],
    flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
    alignItems: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
    justifyContent: [
      'flex-start',
      'center',
      'flex-end',
      'space-between',
      'space-around',
      'space-evenly',
    ],
    flexWrap: ['nowrap', 'wrap', 'wrap-reverse'],
  },
});

const sizingProperties = defineProperties({
  properties: {
    width: {
      auto: 'auto',
      '100%': '100%',
      '50%': '50%',
      '33.333%': '33.333%',
      '25%': '25%',
    },
    height: {
      auto: 'auto',
      '100%': '100%',
      '50%': '50%',
    },
    maxWidth: {
      '100%': '100%',
      none: 'none',
    },
    minHeight: {
      auto: 'auto',
      0: '0px',
      '100%': '100%',
    },
  },
});

const borderProperties = defineProperties({
  properties: {
    borderRadius: {
      0: '0px',
      2: '2px',
      4: '4px',
      8: '8px',
      12: '12px',
      9999: '9999px',
    },
    borderWidth: {
      0: '0px',
      1: '1px',
      2: '2px',
    },
    borderStyle: ['none', 'solid', 'dashed', 'dotted'],
  },
});

export const sprinkles = createSprinkles(
  colorProperties,
  spacingProperties,
  typographyProperties,
  layoutProperties,
  sizingProperties,
  borderProperties,
);

export type Sprinkles = Parameters<typeof sprinkles>[0];
