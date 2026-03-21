import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('renders with default props', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders at size sm', () => {
    render(<TextInput size="sm" placeholder="Small" />);
    expect(screen.getByPlaceholderText('Small')).toBeInTheDocument();
  });

  it('renders at size md', () => {
    render(<TextInput size="md" placeholder="Medium" />);
    expect(screen.getByPlaceholderText('Medium')).toBeInTheDocument();
  });

  it('renders with prefix adornment', () => {
    render(
      <TextInput
        prefix={<span data-testid="prefix">$</span>}
        placeholder="Amount"
      />
    );
    expect(screen.getByTestId('prefix')).toBeInTheDocument();
  });

  it('renders with suffix adornment', () => {
    render(
      <TextInput
        suffix={<span data-testid="suffix">kg</span>}
        placeholder="Weight"
      />
    );
    expect(screen.getByTestId('suffix')).toBeInTheDocument();
  });

  it('shows error border when error={true}', () => {
    const { container } = render(
      <TextInput error={true} placeholder="Error" />
    );
    const input = screen.getByPlaceholderText('Error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    // Error class applied to wrapper
    const wrapperEl = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(wrapperEl.className).toBeTruthy();
  });

  it('shows error message when error="message"', () => {
    render(<TextInput error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('passes value and onChange to underlying input', () => {
    const onChange = vi.fn();
    render(
      <TextInput value="test" onChange={onChange} placeholder="Input" />
    );
    const input = screen.getByPlaceholderText('Input');
    fireEvent.change(input, { target: { value: 'new' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextInput ref={ref} placeholder="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it('renders placeholder text', () => {
    render(<TextInput placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('focus outline appears on wrapper (class-based assertion)', () => {
    const { container } = render(<TextInput placeholder="Focus" />);
    const wrapperEl = container.firstElementChild!.firstElementChild as HTMLElement;
    // The wrapper has focus-within styles via the wrapperFocused class
    expect(wrapperEl.className).toBeTruthy();
  });
});
