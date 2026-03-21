import { describe, it, expect } from 'vitest';
import {
  getApiBaseUrl,
  isMocksEnabled,
  getWsUrl,
  getAuthProvider,
  getOllamaUrl,
} from './env';

describe('env utilities', () => {
  it('getApiBaseUrl returns a string', () => {
    expect(typeof getApiBaseUrl()).toBe('string');
  });

  it('isMocksEnabled returns a boolean', () => {
    expect(typeof isMocksEnabled()).toBe('boolean');
  });

  it('getWsUrl returns a string', () => {
    expect(typeof getWsUrl()).toBe('string');
  });

  it('getAuthProvider returns dev or kbase', () => {
    const provider = getAuthProvider();
    expect(['dev', 'kbase']).toContain(provider);
  });

  it('getOllamaUrl returns a string', () => {
    expect(typeof getOllamaUrl()).toBe('string');
  });
});
