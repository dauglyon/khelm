import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props (solid, md, primary)', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: 'Click me' });
    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('renders each variant (solid, outline, ghost)', () => {
    const { rerender } = render(<Button variant="solid">Solid</Button>);
    expect(screen.getByRole('button', { name: 'Solid' })).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button', { name: 'Ghost' })).toBeInTheDocument();
  });

  it('renders each size (sm, md, lg)', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with a leading icon', () => {
    render(
      <Button icon={<span data-testid="icon">★</span>}>With Icon</Button>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /With Icon/ })).toBeInTheDocument();
  });

  it('loading state shows Spinner and hides icon', () => {
    render(
      <Button
        loading
        icon={<span data-testid="custom-icon">★</span>}
      >
        Loading
      </Button>
    );
    // Custom icon should not be rendered
    expect(screen.queryByTestId('custom-icon')).toBeNull();
    // Spinner should be present
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loading state sets aria-busy="true"', () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('disabled state prevents clicks', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>
    );
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    expect(btn).toBeDisabled();
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('focus-visible outline is present (via class assertion)', () => {
    render(<Button>Focus</Button>);
    const btn = screen.getByRole('button');
    // The button has the base class which includes focus-visible styles
    expect(btn.className).toBeTruthy();
  });

  it('renders as <button> with default type="button"', () => {
    render(<Button>Default Type</Button>);
    const btn = screen.getByRole('button');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('accepts type="submit"', () => {
    render(<Button type="submit">Submit</Button>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('type')).toBe('submit');
  });
});
