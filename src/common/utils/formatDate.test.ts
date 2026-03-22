import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeTime } from './formatDate';

describe('formatRelativeTime', () => {
  const NOW = new Date('2024-01-15T12:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats seconds threshold (< 60 seconds)', () => {
    const date = new Date(NOW - 30 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/30 seconds ago/);
  });

  it('formats minutes threshold (< 60 minutes)', () => {
    const date = new Date(NOW - 45 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/45 minutes ago/);
  });

  it('formats hours threshold (< 24 hours)', () => {
    const date = new Date(NOW - 5 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/5 hours ago/);
  });

  it('formats days threshold (< 7 days)', () => {
    const date = new Date(NOW - 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/3 days ago/);
  });

  it('formats weeks threshold (< 4 weeks)', () => {
    const date = new Date(NOW - 2 * 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/2 weeks ago/);
  });

  it('formats months threshold (< 12 months)', () => {
    const date = new Date(NOW - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/6 months ago/);
  });

  it('formats years threshold (>= 12 months)', () => {
    const date = new Date(NOW - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/2 years ago/);
  });

  it('formats "just now" for 0 seconds', () => {
    const date = new Date(NOW).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/now|0 seconds/i);
  });

  it('formats exactly 1 minute', () => {
    const date = new Date(NOW - 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/minute/);
  });

  it('formats exactly 1 hour boundary', () => {
    const date = new Date(NOW - 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/hour/);
  });

  it('formats exactly 1 day boundary', () => {
    const date = new Date(NOW - 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/day/);
  });

  it('formats exactly 1 week boundary', () => {
    const date = new Date(NOW - 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(date);
    expect(result).toMatch(/week/);
  });

  it('returns a string for any valid date', () => {
    const date = new Date(NOW - 1000).toISOString();
    expect(typeof formatRelativeTime(date)).toBe('string');
  });
});
