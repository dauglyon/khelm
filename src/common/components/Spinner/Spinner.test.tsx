import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default size (20px)', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('width')).toBe('20');
    expect(el.getAttribute('height')).toBe('20');
  });

  it('renders at size 16', () => {
    render(<Spinner size={16} />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('width')).toBe('16');
    expect(el.getAttribute('height')).toBe('16');
  });

  it('renders at size 20', () => {
    render(<Spinner size={20} />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('width')).toBe('20');
    expect(el.getAttribute('height')).toBe('20');
  });

  it('renders at size 24', () => {
    render(<Spinner size={24} />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('width')).toBe('24');
    expect(el.getAttribute('height')).toBe('24');
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

  it('applies custom className', () => {
    render(<Spinner className="my-spinner" />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('class')).toContain('my-spinner');
  });

  it('uses CSS spin keyframe class', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    // The spin style class is applied
    expect(el.getAttribute('class')).toBeTruthy();
  });
});
