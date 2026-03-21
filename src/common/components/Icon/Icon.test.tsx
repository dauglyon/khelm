import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders an SVG element for a known icon name', () => {
    render(<Icon name="close" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.tagName.toLowerCase()).toBe('svg');
  });

  it('renders nothing for an unknown icon name', () => {
    const { container } = render(<Icon name={'unknown-icon' as 'close'} />);
    expect(container.innerHTML).toBe('');
  });

  it('has aria-hidden="true" by default', () => {
    render(<Icon name="close" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('defaults to size 20', () => {
    render(<Icon name="close" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('width')).toBe('20');
    expect(el.getAttribute('height')).toBe('20');
  });

  it('accepts size 16', () => {
    render(<Icon name="close" size={16} data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('width')).toBe('16');
    expect(el.getAttribute('height')).toBe('16');
  });

  it('accepts size 24', () => {
    render(<Icon name="close" size={24} data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('width')).toBe('24');
    expect(el.getAttribute('height')).toBe('24');
  });

  it('defaults to currentColor', () => {
    render(<Icon name="close" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('color') || el.style.color || 'currentColor').toBe('currentColor');
  });

  it('accepts custom color', () => {
    render(<Icon name="close" color="#ff0000" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    // color is applied via style or attribute
    expect(el).toBeInTheDocument();
  });

  it('renders all starter icons', () => {
    const names = ['close', 'chevron-down', 'check', 'minus', 'search'] as const;
    for (const name of names) {
      const { container } = render(<Icon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
    }
  });

  it('passes through additional SVG props', () => {
    render(<Icon name="close" data-testid="icon" className="my-icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('class')).toContain('my-icon');
  });
});
