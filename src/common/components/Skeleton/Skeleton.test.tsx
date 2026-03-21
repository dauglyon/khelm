import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a text skeleton with default props', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('[aria-hidden="true"]');
    expect(el).not.toBeNull();
  });

  it('renders multiple lines when lines > 1', () => {
    const { container } = render(<Skeleton lines={3} />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper).not.toBeNull();
    const lines = wrapper!.children;
    expect(lines.length).toBe(3);
  });

  it('last line of multi-line text is shorter (80% width)', () => {
    const { container } = render(<Skeleton lines={3} />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    const lastLine = wrapper!.children[2] as HTMLElement;
    expect(lastLine.style.width).toBe('80%');
  });

  it('renders rect variant with custom width/height', () => {
    const { container } = render(
      <Skeleton variant="rect" width={200} height={50} />
    );
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('50px');
  });

  it('renders circle variant with specified diameter', () => {
    const { container } = render(<Skeleton variant="circle" width={60} />);
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(el.style.width).toBe('60px');
    expect(el.style.height).toBe('60px');
  });

  it('has aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('[aria-hidden="true"]');
    expect(el).not.toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="my-skeleton" />);
    const el = container.querySelector('[aria-hidden="true"]');
    expect(el!.className).toContain('my-skeleton');
  });

  it('circle variant has equal width and height', () => {
    const { container } = render(<Skeleton variant="circle" width={40} />);
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(el.style.width).toBe(el.style.height);
  });
});
