import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';
import { skeletonBase } from './Skeleton.css';

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

  it('rect variant has default height of 100px', () => {
    const { container } = render(<Skeleton variant="rect" />);
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(el.style.height).toBe('100px');
  });

  it('circle variant has default diameter of 40px', () => {
    const { container } = render(<Skeleton variant="circle" />);
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(el.style.width).toBe('40px');
    expect(el.style.height).toBe('40px');
  });

  it('lines prop is ignored for rect variant', () => {
    const { container } = render(<Skeleton variant="rect" lines={3} />);
    const els = container.querySelectorAll('[aria-hidden="true"]');
    expect(els.length).toBe(1);
  });

  it('lines prop is ignored for circle variant', () => {
    const { container } = render(<Skeleton variant="circle" lines={3} />);
    const els = container.querySelectorAll('[aria-hidden="true"]');
    expect(els.length).toBe(1);
  });

  it('lines=0 renders nothing', () => {
    const { container } = render(<Skeleton lines={0} />);
    const el = container.querySelector('[aria-hidden="true"]');
    expect(el).toBeNull();
  });

  it('renders nothing when lines is negative', () => {
    const { container } = render(<Skeleton lines={-1} />);
    expect(container.firstChild).toBeNull();
  });

  it('default single-line text skeleton has width 100% and height 20px', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('20px');
  });

  it('non-last lines in a multi-line skeleton have 100% width', () => {
    const { container } = render(<Skeleton lines={3} />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    const children = wrapper!.children;
    // All lines except the last should be 100% wide
    for (let i = 0; i < children.length - 1; i++) {
      expect((children[i] as HTMLElement).style.width).toBe('100%');
    }
  });

  // The skeletonBase class from Skeleton.css.ts includes the shimmer animation
  // and reduced-motion overrides. This test confirms the CSS module is properly
  // linked by verifying the class is a non-empty string present on the rendered element.
  it('applies the skeletonBase CSS class (confirms CSS module linkage and shimmer)', () => {
    expect(typeof skeletonBase).toBe('string');
    expect(skeletonBase.length).toBeGreaterThan(0);
    const { container } = render(<Skeleton />);
    const el = container.querySelector('[aria-hidden="true"]');
    expect(el!.className).toContain(skeletonBase);
  });
});
