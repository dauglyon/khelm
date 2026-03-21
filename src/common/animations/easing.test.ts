import { describe, it, expect } from 'vitest';
import { easingCSS, easingMotion } from './easing';

const allKeys = ['out', 'inOut', 'outQuart'] as const;

describe('easingCSS', () => {
  it('has all 3 keys', () => {
    for (const key of allKeys) {
      expect(easingCSS).toHaveProperty(key);
    }
    expect(Object.keys(easingCSS)).toHaveLength(3);
  });

  it('CSS strings contain cubic-bezier', () => {
    for (const key of allKeys) {
      expect(easingCSS[key]).toContain('cubic-bezier');
    }
  });
});

describe('easingMotion', () => {
  it('has all 3 keys', () => {
    for (const key of allKeys) {
      expect(easingMotion).toHaveProperty(key);
    }
    expect(Object.keys(easingMotion)).toHaveLength(3);
  });

  it('motion arrays have 4 numeric elements', () => {
    for (const key of allKeys) {
      const arr = easingMotion[key];
      expect(arr).toHaveLength(4);
      for (const val of arr) {
        expect(typeof val).toBe('number');
      }
    }
  });
});

describe('values correspond between formats', () => {
  it('out CSS and motion values match', () => {
    const [a, b, c, d] = easingMotion.out;
    expect(easingCSS.out).toBe(`cubic-bezier(${a}, ${b}, ${c}, ${d})`);
  });

  it('inOut CSS and motion values match', () => {
    const [a, b, c, d] = easingMotion.inOut;
    expect(easingCSS.inOut).toBe(`cubic-bezier(${a}, ${b}, ${c}, ${d})`);
  });

  it('outQuart CSS and motion values match', () => {
    const [a, b, c, d] = easingMotion.outQuart;
    expect(easingCSS.outQuart).toBe(`cubic-bezier(${a}, ${b}, ${c}, ${d})`);
  });
});
