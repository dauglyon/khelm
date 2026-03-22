import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { TextInput } from './TextInput';
import { wrapper as wrapperBase, wrapperError } from './TextInput.css';

describe('TextInput', () => {
  it('renders with default props', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  // Fix 2: assert sm and md wrapper classNames differ
  it('renders at sm and md with different size classes', () => {
    const { container: containerSm } = render(
      <TextInput size="sm" placeholder="Small" />
    );
    const { container: containerMd } = render(
      <TextInput size="md" placeholder="Medium" />
    );
    const wrapperSm = containerSm.firstElementChild!.firstElementChild as HTMLElement;
    const wrapperMd = containerMd.firstElementChild!.firstElementChild as HTMLElement;
    expect(wrapperSm.className).not.toBe(wrapperMd.className);
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

  // Fix 4: import wrapperError and assert it's present when error=true
  it('shows error border when error={true}', () => {
    const { container } = render(
      <TextInput error={true} placeholder="Error" />
    );
    const input = screen.getByPlaceholderText('Error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const wrapperEl = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(wrapperEl.className).toContain(wrapperError);

    // Non-error wrapper should NOT contain wrapperError
    const { container: containerOk } = render(
      <TextInput placeholder="OK" />
    );
    const wrapperOk = containerOk.firstElementChild!.firstElementChild as HTMLElement;
    expect(wrapperOk.className).not.toContain(wrapperError);
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

  // Fix 3: assert wrapperBase class is present in the wrapper className
  it('focus outline appears on wrapper (class-based assertion)', () => {
    const { container } = render(<TextInput placeholder="Focus" />);
    const wrapperEl = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(wrapperEl.className).toContain(wrapperBase);
  });

  // Fix 1: disabled state styling and attribute
  it('applies disabled attribute and different className when disabled', () => {
    const { container: containerDisabled } = render(
      <TextInput disabled placeholder="Disabled" />
    );
    const { container: containerEnabled } = render(
      <TextInput placeholder="Enabled" />
    );

    const inputDisabled = screen.getByPlaceholderText('Disabled');
    expect(inputDisabled).toBeDisabled();

    const wrapperDisabledEl = containerDisabled.firstElementChild!.firstElementChild as HTMLElement;
    const wrapperEnabledEl = containerEnabled.firstElementChild!.firstElementChild as HTMLElement;
    expect(wrapperDisabledEl.className).not.toBe(wrapperEnabledEl.className);
  });

  // Fix 5: aria-describedby links input to error message
  it('links input to error message via aria-describedby when error is a string', () => {
    render(<TextInput id="my-input" error="Required field" placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    const errorEl = screen.getByText('Required field');

    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(errorEl.id).toBe(describedBy);
  });

  it('does not set aria-describedby when there is no error', () => {
    render(<TextInput id="my-input" placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });
});
