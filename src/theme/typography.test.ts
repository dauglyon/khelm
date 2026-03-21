import { describe, it, expect } from 'vitest';
import {
  displayLg,
  displaySm,
  heading,
  body,
  bodySm,
  caption,
  mono,
  monoSm,
  typography,
} from './typography.css';

const allKeys = [
  'displayLg',
  'displaySm',
  'heading',
  'body',
  'bodySm',
  'caption',
  'mono',
  'monoSm',
] as const;

describe('typography recipes', () => {
  it('displayLg is a non-empty string', () => {
    expect(typeof displayLg).toBe('string');
    expect(displayLg.length).toBeGreaterThan(0);
  });

  it('displaySm is a non-empty string', () => {
    expect(typeof displaySm).toBe('string');
    expect(displaySm.length).toBeGreaterThan(0);
  });

  it('heading is a non-empty string', () => {
    expect(typeof heading).toBe('string');
    expect(heading.length).toBeGreaterThan(0);
  });

  it('body is a non-empty string', () => {
    expect(typeof body).toBe('string');
    expect(body.length).toBeGreaterThan(0);
  });

  it('bodySm is a non-empty string', () => {
    expect(typeof bodySm).toBe('string');
    expect(bodySm.length).toBeGreaterThan(0);
  });

  it('caption is a non-empty string', () => {
    expect(typeof caption).toBe('string');
    expect(caption.length).toBeGreaterThan(0);
  });

  it('mono is a non-empty string', () => {
    expect(typeof mono).toBe('string');
    expect(mono.length).toBeGreaterThan(0);
  });

  it('monoSm is a non-empty string', () => {
    expect(typeof monoSm).toBe('string');
    expect(monoSm.length).toBeGreaterThan(0);
  });
});

describe('typography record', () => {
  it('has all 8 keys', () => {
    for (const key of allKeys) {
      expect(typography).toHaveProperty(key);
    }
    expect(Object.keys(typography)).toHaveLength(8);
  });

  it('all values are non-empty strings', () => {
    for (const key of allKeys) {
      expect(typeof typography[key]).toBe('string');
      expect(typography[key].length).toBeGreaterThan(0);
    }
  });
});
