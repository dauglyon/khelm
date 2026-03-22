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

  it('direction prop produces different classNames for column vs row', () => {
    const { unmount } = render(
      <Stack direction="column" data-testid="stack">
        content
      </Stack>
    );
    const columnClass = screen.getByTestId('stack').className;
    unmount();

    render(
      <Stack direction="row" data-testid="stack">
        content
      </Stack>
    );
    const rowClass = screen.getByTestId('stack').className;

    expect(columnClass).not.toBe(rowClass);
  });

  it('gap prop produces different classNames for different values', () => {
    const { unmount } = render(
      <Stack gap={4} data-testid="stack">
        content
      </Stack>
    );
    const gap4Class = screen.getByTestId('stack').className;
    unmount();

    render(
      <Stack gap={16} data-testid="stack">
        content
      </Stack>
    );
    const gap16Class = screen.getByTestId('stack').className;

    expect(gap4Class).not.toBe(gap16Class);
  });

  it('wrap prop produces different classNames for true vs false', () => {
    const { unmount } = render(
      <Stack wrap={true} data-testid="stack">
        content
      </Stack>
    );
    const wrappedClass = screen.getByTestId('stack').className;
    unmount();

    render(
      <Stack wrap={false} data-testid="stack">
        content
      </Stack>
    );
    const nowrapClass = screen.getByTestId('stack').className;

    expect(wrappedClass).not.toBe(nowrapClass);
  });

  it('align prop produces different classNames for different values', () => {
    const { unmount } = render(
      <Stack align="center" data-testid="stack">
        content
      </Stack>
    );
    const centerClass = screen.getByTestId('stack').className;
    unmount();

    render(
      <Stack align="flex-start" data-testid="stack">
        content
      </Stack>
    );
    const startClass = screen.getByTestId('stack').className;

    expect(centerClass).not.toBe(startClass);
  });

  it('justify prop produces different classNames for different values', () => {
    const { unmount } = render(
      <Stack justify="center" data-testid="stack">
        content
      </Stack>
    );
    const centerClass = screen.getByTestId('stack').className;
    unmount();

    render(
      <Stack justify="space-between" data-testid="stack">
        content
      </Stack>
    );
    const spaceBetweenClass = screen.getByTestId('stack').className;

    expect(centerClass).not.toBe(spaceBetweenClass);
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
