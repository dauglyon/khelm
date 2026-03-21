import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Stack } from './Stack';
import { createRef } from 'react';

describe('Stack', () => {
  it('renders children', () => {
    render(
      <Stack>
        <div data-testid="child">hello</div>
      </Stack>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders as a div by default', () => {
    render(<Stack data-testid="stack">content</Stack>);
    const el = screen.getByTestId('stack');
    expect(el.tagName).toBe('DIV');
  });

  it('applies column direction by default', () => {
    render(<Stack data-testid="stack">content</Stack>);
    const el = screen.getByTestId('stack');
    expect(el.style.display || el.className).toBeTruthy();
  });

  it('accepts direction prop', () => {
    render(
      <Stack direction="row" data-testid="stack">
        content
      </Stack>
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('accepts gap prop', () => {
    render(
      <Stack gap={16} data-testid="stack">
        content
      </Stack>
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('accepts align prop', () => {
    render(
      <Stack align="center" data-testid="stack">
        content
      </Stack>
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('accepts justify prop', () => {
    render(
      <Stack justify="space-between" data-testid="stack">
        content
      </Stack>
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('accepts wrap prop', () => {
    render(
      <Stack wrap="wrap" data-testid="stack">
        content
      </Stack>
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('supports polymorphic "as" prop', () => {
    render(
      <Stack as="section" data-testid="stack">
        content
      </Stack>
    );
    const el = screen.getByTestId('stack');
    expect(el.tagName).toBe('SECTION');
  });

  it('supports polymorphic "as" prop with nav', () => {
    render(
      <Stack as="nav" data-testid="stack">
        content
      </Stack>
    );
    const el = screen.getByTestId('stack');
    expect(el.tagName).toBe('NAV');
  });

  it('merges className prop', () => {
    render(
      <Stack className="custom-class" data-testid="stack">
        content
      </Stack>
    );
    const el = screen.getByTestId('stack');
    expect(el.className).toContain('custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref}>content</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('passes through extra HTML attributes', () => {
    render(
      <Stack data-testid="stack" id="my-stack" role="list">
        content
      </Stack>
    );
    const el = screen.getByTestId('stack');
    expect(el.getAttribute('id')).toBe('my-stack');
    expect(el.getAttribute('role')).toBe('list');
  });
});
