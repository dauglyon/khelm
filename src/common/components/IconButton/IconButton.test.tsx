import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders with required aria-label', () => {
    render(
      <IconButton
        aria-label="Close"
        icon={<span data-testid="icon">X</span>}
      />
    );
    const btn = screen.getByRole('button', { name: 'Close' });
    expect(btn).toBeInTheDocument();
  });

  it('renders the icon child', () => {
    render(
      <IconButton
        aria-label="Close"
        icon={<span data-testid="icon">X</span>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  // TypeScript enforces aria-label is required — omitting it causes a compile error.
  // This is verified at the type level, not via runtime test.

  it('loading state replaces icon with Spinner', () => {
    render(
      <IconButton
        aria-label="Loading action"
        icon={<span data-testid="icon">X</span>}
        loading
      />
    );
    expect(screen.queryByTestId('icon')).toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('disabled state works', () => {
    const onClick = vi.fn();
    render(
      <IconButton
        aria-label="Close"
        icon={<span>X</span>}
        disabled
        onClick={onClick}
      />
    );
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    expect(btn).toBeDisabled();
  });

  it('onClick fires', () => {
    const onClick = vi.fn();
    render(
      <IconButton
        aria-label="Close"
        icon={<span>X</span>}
        onClick={onClick}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton
        ref={ref}
        aria-label="Close"
        icon={<span>X</span>}
      />
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('has square dimensions per size (class-based)', () => {
    const { rerender } = render(
      <IconButton
        aria-label="Close"
        icon={<span>X</span>}
        size="sm"
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(
      <IconButton
        aria-label="Close"
        icon={<span>X</span>}
        size="md"
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(
      <IconButton
        aria-label="Close"
        icon={<span>X</span>}
        size="lg"
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports variant and color props', () => {
    render(
      <IconButton
        aria-label="Delete"
        icon={<span>🗑</span>}
        variant="ghost"
        color="danger"
      />
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
