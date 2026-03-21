import { describe, it, expect } from 'vitest';
import {
  shimmerKeyframes,
  pulseKeyframes,
  spinKeyframes,
  fadeInUpKeyframes,
  shimmer,
  pulse,
  spin,
  fadeInUp,
} from './keyframes.css';

describe('keyframe names', () => {
  it('shimmerKeyframes is a non-empty string', () => {
    expect(typeof shimmerKeyframes).toBe('string');
    expect(shimmerKeyframes.length).toBeGreaterThan(0);
  });

  it('pulseKeyframes is a non-empty string', () => {
    expect(typeof pulseKeyframes).toBe('string');
    expect(pulseKeyframes.length).toBeGreaterThan(0);
  });

  it('spinKeyframes is a non-empty string', () => {
    expect(typeof spinKeyframes).toBe('string');
    expect(spinKeyframes.length).toBeGreaterThan(0);
  });

  it('fadeInUpKeyframes is a non-empty string', () => {
    expect(typeof fadeInUpKeyframes).toBe('string');
    expect(fadeInUpKeyframes.length).toBeGreaterThan(0);
  });
});

describe('style classes', () => {
  it('shimmer is a non-empty string (CSS class)', () => {
    expect(typeof shimmer).toBe('string');
    expect(shimmer.length).toBeGreaterThan(0);
  });

  it('pulse is a non-empty string (CSS class)', () => {
    expect(typeof pulse).toBe('string');
    expect(pulse.length).toBeGreaterThan(0);
  });

  it('spin is a non-empty string (CSS class)', () => {
    expect(typeof spin).toBe('string');
    expect(spin.length).toBeGreaterThan(0);
  });

  it('fadeInUp is a non-empty string (CSS class)', () => {
    expect(typeof fadeInUp).toBe('string');
    expect(fadeInUp.length).toBeGreaterThan(0);
  });
});

describe('all exports are unique', () => {
  it('keyframe names are all different', () => {
    const names = [shimmerKeyframes, pulseKeyframes, spinKeyframes, fadeInUpKeyframes];
    expect(new Set(names).size).toBe(4);
  });

  it('style classes are all different', () => {
    const classes = [shimmer, pulse, spin, fadeInUp];
    expect(new Set(classes).size).toBe(4);
  });
});
