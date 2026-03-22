import { describe, it, expect } from 'vitest';
import { vars } from './contract.css';
import type { InputType } from './contract.css';
import { themeClass } from './theme.css';

describe('theme contract', () => {
  it('has all expected top-level keys', () => {
    expect(vars).toHaveProperty('color');
    expect(vars).toHaveProperty('font');
    expect(vars).toHaveProperty('easing');
  });

  it('has all base color tokens', () => {
    expect(vars.color).toHaveProperty('bg');
    expect(vars.color).toHaveProperty('surface');
    expect(vars.color).toHaveProperty('border');
    expect(vars.color).toHaveProperty('text');
    expect(vars.color).toHaveProperty('textMid');
    expect(vars.color).toHaveProperty('textLight');
  });

  it('has all five status color keys', () => {
    expect(vars.color.status).toHaveProperty('thinking');
    expect(vars.color.status).toHaveProperty('queued');
    expect(vars.color.status).toHaveProperty('running');
    expect(vars.color.status).toHaveProperty('complete');
    expect(vars.color.status).toHaveProperty('error');
  });

  it('has all seven inputType keys', () => {
    expect(vars.color.inputType).toHaveProperty('sql');
    expect(vars.color.inputType).toHaveProperty('python');
    expect(vars.color.inputType).toHaveProperty('literature');
    expect(vars.color.inputType).toHaveProperty('hypothesis');
    expect(vars.color.inputType).toHaveProperty('note');
    expect(vars.color.inputType).toHaveProperty('dataIngest');
    expect(vars.color.inputType).toHaveProperty('task');
  });

  it('has fg, bg, border sub-keys for each inputType', () => {
    const inputTypes = [
      'sql',
      'python',
      'literature',
      'hypothesis',
      'note',
      'dataIngest',
      'task',
    ] as const;

    for (const type of inputTypes) {
      expect(vars.color.inputType[type]).toHaveProperty('fg');
      expect(vars.color.inputType[type]).toHaveProperty('bg');
      expect(vars.color.inputType[type]).toHaveProperty('border');
    }
  });

  it('has all font tokens', () => {
    expect(vars.font).toHaveProperty('mono');
    expect(vars.font).toHaveProperty('sans');
    expect(vars.font).toHaveProperty('serif');
  });

  it('has all easing tokens', () => {
    expect(vars.easing).toHaveProperty('out');
    expect(vars.easing).toHaveProperty('inOut');
    expect(vars.easing).toHaveProperty('outQuart');
  });

  it('contract values are CSS variable references (strings)', () => {
    expect(typeof vars.color.bg).toBe('string');
    expect(typeof vars.font.mono).toBe('string');
    expect(typeof vars.easing.out).toBe('string');
    expect(typeof vars.color.status.thinking).toBe('string');
    expect(typeof vars.color.inputType.sql.fg).toBe('string');
  });
});

describe('theme class', () => {
  it('exports themeClass as a non-empty string', () => {
    expect(typeof themeClass).toBe('string');
    expect(themeClass.length).toBeGreaterThan(0);
  });
});

describe('InputType type', () => {
  it('is assignable from all seven input type literals (compile-time check)', () => {
    // This test validates at compile time that InputType accepts all seven values.
    // If any are missing from the union, TypeScript will error.
    const types: InputType[] = [
      'sql',
      'python',
      'literature',
      'hypothesis',
      'note',
      'dataIngest',
      'task',
    ];
    expect(types).toHaveLength(7);
  });
});
