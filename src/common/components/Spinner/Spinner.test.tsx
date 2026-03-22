import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';
import { spinnerBase, spinnerSizes } from './Spinner.css';

describe('Spinner', () => {
  it('applies spinnerBase class for animation and display', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el.className).toContain(spinnerBase);
  });

  it('different sizes produce different classNames', () => {
    const { rerender } = render(<Spinner size={16} />);
    const className16 = screen.getByRole('status').className;

    rerender(<Spinner size={24} />);
    const className24 = screen.getByRole('status').className;

    expect(className16).not.toBe(className24);
    expect(className16).toContain(spinnerSizes[16]);
    expect(className24).toContain(spinnerSizes[24]);
  });

  it('renders at size 16 with correct size class', () => {
    render(<Spinner size={16} />);
    const el = screen.getByRole('status');
    expect(el.className).toContain(spinnerSizes[16]);
  });

  it('renders at size 20 with correct size class', () => {
    render(<Spinner size={20} />);
    const el = screen.getByRole('status');
    expect(el.className).toContain(spinnerSizes[20]);
  });

  it('renders at size 24 with correct size class', () => {
    render(<Spinner size={24} />);
    const el = screen.getByRole('status');
    expect(el.className).toContain(spinnerSizes[24]);
  });

  it('has role="status" for accessibility', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label="Loading"', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('aria-label')).toBe('Loading');
  });

  it('applies custom className alongside base classes', () => {
    render(<Spinner className="my-spinner" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('my-spinner');
    expect(el.className).toContain(spinnerBase);
  });

  it('uses default color on the circle stroke', () => {
    render(<Spinner />);
    const circle = document.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle!.getAttribute('stroke')).toBeTruthy();
  });

  it('applies custom color to the circle stroke', () => {
    render(<Spinner color="#ff0000" />);
    const circle = document.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle!.getAttribute('stroke')).toBe('#ff0000');
  });

  it('does not use inline width/height on the SVG', () => {
    render(<Spinner size={16} />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('width')).toBeNull();
    expect(el.getAttribute('height')).toBeNull();
  });
});
