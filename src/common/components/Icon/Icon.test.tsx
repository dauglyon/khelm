import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders an SVG element for a known icon name', () => {
    const { container } = render(<Icon name="close" data-testid="icon" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('renders nothing for an unknown icon name', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<Icon name="unknown-icon" />);
    expect(container.innerHTML).toBe('');
    warnSpy.mockRestore();
  });

  it('calls console.warn for unknown icon names', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Icon name="unknown-icon" />);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown-icon'));
    warnSpy.mockRestore();
  });

  it('has aria-hidden="true" by default', () => {
    render(<Icon name="close" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('defaults to size 20', () => {
    const { rerender } = render(<Icon name="close" data-testid="icon" />);
    const wrapper20 = screen.getByTestId('icon');
    const class20 = wrapper20.className;

    rerender(<Icon name="close" size={16} data-testid="icon" />);
    const class16 = screen.getByTestId('icon').className;

    rerender(<Icon name="close" size={24} data-testid="icon" />);
    const class24 = screen.getByTestId('icon').className;

    // Each size variant must produce a distinct class name
    expect(class20).not.toBe(class16);
    expect(class20).not.toBe(class24);
    expect(class16).not.toBe(class24);
  });

  it('accepts size 16', () => {
    render(<Icon name="close" size={16} data-testid="icon" />);
    const wrapper16 = screen.getByTestId('icon');
    render(<Icon name="close" size={20} data-testid="icon2" />);
    const wrapper20 = screen.getByTestId('icon2');
    expect(wrapper16.className).not.toBe(wrapper20.className);
  });

  it('accepts size 24', () => {
    render(<Icon name="close" size={24} data-testid="icon" />);
    const wrapper24 = screen.getByTestId('icon');
    render(<Icon name="close" size={20} data-testid="icon2" />);
    const wrapper20 = screen.getByTestId('icon2');
    expect(wrapper24.className).not.toBe(wrapper20.className);
  });

  it('defaults to currentColor', () => {
    render(<Icon name="close" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    // jsdom lowercases 'currentColor' to 'currentcolor'
    expect(el.style.color.toLowerCase()).toBe('currentcolor');
  });

  it('accepts custom color', () => {
    render(<Icon name="close" color="#ff0000" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    // jsdom/happy-dom may keep hex or normalize to rgb() — accept either form
    expect(el.style.color).toMatch(/#ff0000|rgb\(255,\s*0,\s*0\)/i);
  });

  it('renders all starter icons', () => {
    const names = ['close', 'chevron-down', 'check', 'minus', 'search'] as const;
    for (const name of names) {
      const { container } = render(<Icon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
    }
  });

  it('passes through additional class name', () => {
    render(<Icon name="close" data-testid="icon" className="my-icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('class')).toContain('my-icon');
  });

  it('sets role="img" and removes aria-hidden when aria-label is provided', () => {
    render(<Icon name="close" aria-label="Close" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.getAttribute('aria-label')).toBe('Close');
    expect(el.getAttribute('aria-hidden')).toBeNull();
    expect(el.getAttribute('role')).toBe('img');
  });
});
