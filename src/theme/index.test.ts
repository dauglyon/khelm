import { describe, it, expect } from 'vitest';
import {
  vars,
  themeClass,
  sprinkles,
  typography,
  displayLg,
  displaySm,
  heading,
  body,
  bodySm,
  caption,
  mono,
  monoSm,
} from './index';
import type { InputType, Sprinkles } from './index';

describe('theme barrel exports', () => {
  describe('contract exports', () => {
    it('exports vars as an object with color, font, easing', () => {
      expect(vars).toHaveProperty('color');
      expect(vars).toHaveProperty('font');
      expect(vars).toHaveProperty('easing');
    });

    it('exports themeClass as a non-empty string', () => {
      expect(typeof themeClass).toBe('string');
      expect(themeClass.length).toBeGreaterThan(0);
    });

    it('InputType is usable as a type (compile-time check)', () => {
      const t: InputType = 'sql';
      expect(t).toBe('sql');
    });
  });

  describe('sprinkles exports', () => {
    it('exports sprinkles as a callable function', () => {
      expect(typeof sprinkles).toBe('function');
    });

    it('sprinkles returns a string', () => {
      const result = sprinkles({});
      expect(typeof result).toBe('string');
    });

    it('Sprinkles type is usable as a type annotation (compile-time check)', () => {
      const props: Sprinkles = { padding: 8 };
      const result = sprinkles(props);
      expect(typeof result).toBe('string');
    });
  });

  describe('typography exports', () => {
    it('exports all individual typography recipes as non-empty strings', () => {
      expect(typeof displayLg).toBe('string');
      expect(displayLg.length).toBeGreaterThan(0);

      expect(typeof displaySm).toBe('string');
      expect(displaySm.length).toBeGreaterThan(0);

      expect(typeof heading).toBe('string');
      expect(heading.length).toBeGreaterThan(0);

      expect(typeof body).toBe('string');
      expect(body.length).toBeGreaterThan(0);

      expect(typeof bodySm).toBe('string');
      expect(bodySm.length).toBeGreaterThan(0);

      expect(typeof caption).toBe('string');
      expect(caption.length).toBeGreaterThan(0);

      expect(typeof mono).toBe('string');
      expect(mono.length).toBeGreaterThan(0);

      expect(typeof monoSm).toBe('string');
      expect(monoSm.length).toBeGreaterThan(0);
    });

    it('exports typography record with all 8 keys', () => {
      expect(typeof typography).toBe('object');
      const keys = [
        'displayLg',
        'displaySm',
        'heading',
        'body',
        'bodySm',
        'caption',
        'mono',
        'monoSm',
      ] as const;
      for (const key of keys) {
        expect(typography).toHaveProperty(key);
        expect(typeof typography[key]).toBe('string');
        expect(typography[key].length).toBeGreaterThan(0);
      }
      expect(Object.keys(typography)).toHaveLength(8);
    });
  });
});
