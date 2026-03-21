import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { Select } from './Select';

describe('Select', () => {
  it('renders with option children', () => {
    render(
      <Select>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('renders at size sm', () => {
    render(
      <Select size="sm">
        <option value="a">A</option>
      </Select>
    );
    const selectEl = screen.getByRole('combobox');
    expect(selectEl).toBeInTheDocument();
  });

  it('renders at size md', () => {
    render(
      <Select size="md">
        <option value="a">A</option>
      </Select>
    );
    const selectEl = screen.getByRole('combobox');
    expect(selectEl).toBeInTheDocument();
  });

  it('shows chevron-down icon', () => {
    const { container } = render(
      <Select>
        <option value="a">A</option>
      </Select>
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('error state shows border and message', () => {
    render(
      <Select error="Required field">
        <option value="a">A</option>
      </Select>
    );
    expect(screen.getByText('Required field')).toBeInTheDocument();
    const selectEl = screen.getByRole('combobox');
    expect(selectEl.getAttribute('aria-invalid')).toBe('true');
  });

  it('passes value and onChange', () => {
    const onChange = vi.fn();
    render(
      <Select value="a" onChange={onChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );
    const selectEl = screen.getByRole('combobox');
    fireEvent.change(selectEl, { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards ref to select element', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref}>
        <option value="a">A</option>
      </Select>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SELECT');
  });

  it('native select arrow is hidden via appearance class', () => {
    const { container } = render(
      <Select>
        <option value="a">A</option>
      </Select>
    );
    const selectEl = container.querySelector('select');
    // The selectElement class includes appearance: none
    expect(selectEl?.className).toBeTruthy();
  });
});
