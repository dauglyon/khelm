import { describe, it, expect } from 'vitest';
import { sprinkles } from './sprinkles.css';
import type { Sprinkles } from './sprinkles.css';

describe('sprinkles', () => {
  it('is callable and returns a string', () => {
    const result = sprinkles({});
    expect(typeof result).toBe('string');
  });

  // Color properties
  describe('color properties', () => {
    it('accepts base color tokens for color', () => {
      const result = sprinkles({ color: 'text' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts base color tokens for backgroundColor', () => {
      const result = sprinkles({ backgroundColor: 'surface' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts base color tokens for borderColor', () => {
      const result = sprinkles({ borderColor: 'border' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts all base color token keys', () => {
      const baseColors = ['bg', 'surface', 'border', 'text', 'textMid', 'textLight'] as const;
      for (const c of baseColors) {
        const result = sprinkles({ color: c });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts status color token keys', () => {
      const statusColors = ['statusThinking', 'statusQueued', 'statusRunning', 'statusComplete', 'statusError'] as const;
      for (const c of statusColors) {
        const result = sprinkles({ color: c });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('produces distinct class names for different color values', () => {
      const a = sprinkles({ color: 'text' });
      const b = sprinkles({ color: 'textMid' });
      const c = sprinkles({ color: 'bg' });
      expect(a).not.toBe(b);
      expect(b).not.toBe(c);
      expect(a).not.toBe(c);
    });
  });

  // Spacing properties
  describe('spacing properties', () => {
    it('accepts spacing scale values for padding', () => {
      const spacingValues = [0, 4, 8, 12, 16, 20, 24, 32, 48, 64] as const;
      for (const v of spacingValues) {
        const result = sprinkles({ padding: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts spacing scale values for margin', () => {
      const result = sprinkles({ margin: 16 });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts spacing scale values for gap', () => {
      const result = sprinkles({ gap: 8 });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('produces distinct class names for different padding values', () => {
      expect(sprinkles({ padding: 4 })).not.toBe(sprinkles({ padding: 8 }));
      expect(sprinkles({ padding: 8 })).not.toBe(sprinkles({ padding: 16 }));
      expect(sprinkles({ padding: 0 })).not.toBe(sprinkles({ padding: 64 }));
    });

    it('accepts individual padding properties', () => {
      const result = sprinkles({
        paddingTop: 4,
        paddingRight: 8,
        paddingBottom: 12,
        paddingLeft: 16,
      });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts individual margin properties', () => {
      const result = sprinkles({
        marginTop: 4,
        marginRight: 8,
        marginBottom: 12,
        marginLeft: 16,
      });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // Typography properties
  describe('typography properties', () => {
    it('accepts fontFamily mapped to font tokens', () => {
      const families = ['mono', 'sans', 'serif'] as const;
      for (const f of families) {
        const result = sprinkles({ fontFamily: f });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts fontSize values', () => {
      const sizes = [11, 12, 13, 14, 15, 18, 22, 28] as const;
      for (const s of sizes) {
        const result = sprinkles({ fontSize: s });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts fontWeight values', () => {
      const weights = [400, 500, 600, 700] as const;
      for (const w of weights) {
        const result = sprinkles({ fontWeight: w });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts lineHeight values', () => {
      const heights = [1.2, 1.3, 1.4, 1.5, 1.6] as const;
      for (const h of heights) {
        const result = sprinkles({ lineHeight: h });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  // Layout properties
  describe('layout properties', () => {
    it('accepts display values', () => {
      const result = sprinkles({ display: 'flex' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts flexDirection values', () => {
      const result = sprinkles({ flexDirection: 'column' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts alignItems values', () => {
      const result = sprinkles({ alignItems: 'center' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts justifyContent values', () => {
      const result = sprinkles({ justifyContent: 'space-between' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts flexWrap values', () => {
      const result = sprinkles({ flexWrap: 'wrap' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts all display values', () => {
      const displayValues = ['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid'] as const;
      for (const v of displayValues) {
        const result = sprinkles({ display: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts all flexDirection values', () => {
      const values = ['row', 'row-reverse', 'column', 'column-reverse'] as const;
      for (const v of values) {
        const result = sprinkles({ flexDirection: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts all alignItems values', () => {
      const values = ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] as const;
      for (const v of values) {
        const result = sprinkles({ alignItems: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts all justifyContent values', () => {
      const values = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] as const;
      for (const v of values) {
        const result = sprinkles({ justifyContent: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts all flexWrap values', () => {
      const values = ['nowrap', 'wrap', 'wrap-reverse'] as const;
      for (const v of values) {
        const result = sprinkles({ flexWrap: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('produces distinct class names for different display values', () => {
      expect(sprinkles({ display: 'flex' })).not.toBe(sprinkles({ display: 'block' }));
      expect(sprinkles({ display: 'none' })).not.toBe(sprinkles({ display: 'grid' }));
    });
  });

  // Sizing properties
  describe('sizing properties', () => {
    it('accepts width values', () => {
      const result = sprinkles({ width: '100%' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts height auto', () => {
      const result = sprinkles({ height: 'auto' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts maxWidth values', () => {
      const result = sprinkles({ maxWidth: '100%' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts minHeight values', () => {
      const result = sprinkles({ minHeight: 'auto' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts all width values', () => {
      const values = ['auto', '100%', '75%', '50%', '33.333%', '25%'] as const;
      for (const v of values) {
        const result = sprinkles({ width: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts all height values', () => {
      const values = ['auto', '100%', '75%', '50%', '25%'] as const;
      for (const v of values) {
        const result = sprinkles({ height: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts all maxWidth values', () => {
      const values = ['100%', '75%', '50%', '25%', 'none', '640px', '768px', '1024px', '1280px'] as const;
      for (const v of values) {
        const result = sprinkles({ maxWidth: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts all minHeight values', () => {
      const values = ['auto', 0, '100%', '100vh'] as const;
      for (const v of values) {
        const result = sprinkles({ minHeight: v });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('produces distinct class names for different width values', () => {
      expect(sprinkles({ width: '100%' })).not.toBe(sprinkles({ width: '50%' }));
      expect(sprinkles({ width: '25%' })).not.toBe(sprinkles({ width: '75%' }));
    });

    it('produces distinct class names for different maxWidth values', () => {
      expect(sprinkles({ maxWidth: '640px' })).not.toBe(sprinkles({ maxWidth: '1280px' }));
      expect(sprinkles({ maxWidth: '100%' })).not.toBe(sprinkles({ maxWidth: 'none' }));
    });
  });

  // Border properties
  describe('border properties', () => {
    it('accepts borderRadius values', () => {
      const radii = [0, 2, 4, 8, 12, 9999] as const;
      for (const r of radii) {
        const result = sprinkles({ borderRadius: r });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts borderWidth values', () => {
      const widths = [0, 1, 2] as const;
      for (const w of widths) {
        const result = sprinkles({ borderWidth: w });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('accepts borderStyle values', () => {
      const result = sprinkles({ borderStyle: 'solid' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // Type export
  describe('Sprinkles type', () => {
    it('can be used as a type annotation (compile-time check)', () => {
      const props: Sprinkles = {
        color: 'text',
        backgroundColor: 'bg',
        padding: 16,
        display: 'flex',
        fontFamily: 'sans',
        borderRadius: 4,
      };
      const result = sprinkles(props);
      expect(typeof result).toBe('string');
    });
  });

  // Combined usage
  describe('combined usage', () => {
    it('accepts multiple property groups at once', () => {
      const result = sprinkles({
        color: 'text',
        backgroundColor: 'surface',
        padding: 16,
        gap: 8,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'border',
        width: '100%',
      });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
