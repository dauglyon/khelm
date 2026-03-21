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
      const statusColors = ['statusThinking', 'statusRunning', 'statusComplete', 'statusError'] as const;
      for (const c of statusColors) {
        const result = sprinkles({ color: c });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
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
