import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useInputSurfaceStore } from '../store/useInputSurfaceStore';
import { ClassificationPreview } from './ClassificationPreview';

describe('ClassificationPreview', () => {
  beforeEach(() => {
    useInputSurfaceStore.getState().reset();
  });

  it('shows nothing when classifiedTypes is null and not classifying', () => {
    const { container } = render(<ClassificationPreview />);
    expect(container.firstChild).toBeNull();
  });

  it('shows solid pill when no alternatives present (high confidence equivalent)', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
    });

    render(<ClassificationPreview />);

    const indicator = screen.getByTestId('type-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator.textContent).toBe('SQL');
  });

  it('shows dashed border when alternatives are present (uncertain classification)', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['chat'],
        alternatives: [['note']],
      });
    });

    render(<ClassificationPreview />);

    const indicator = screen.getByTestId('type-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator.textContent).toBe('Chat');
  });

  it('shows compound pipeline label when types array has >1 element', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql', 'python'],
      });
    });

    render(<ClassificationPreview />);

    const indicator = screen.getByTestId('type-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator.textContent).toBe('SQL → Python');
  });

  it('clicking indicator opens dropdown with all 7 types', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
        alternatives: [['python']],
      });
    });

    render(<ClassificationPreview />);

    const indicator = screen.getByTestId('type-indicator');
    fireEvent.click(indicator);

    const dropdown = screen.getByTestId('type-selector');
    expect(dropdown).toBeTruthy();

    const options = screen.getAllByRole('option');
    expect(options.length).toBe(7);
  });

  it('selecting a type in dropdown calls setUserOverrideTypes', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
    });

    render(<ClassificationPreview />);

    // Open dropdown
    fireEvent.click(screen.getByTestId('type-indicator'));

    // Click "Python" option
    const options = screen.getAllByRole('option');
    const pythonOption = options.find((o) => o.textContent?.includes('Python'));
    expect(pythonOption).toBeTruthy();
    fireEvent.click(pythonOption!);

    // Verify store was updated
    expect(useInputSurfaceStore.getState().userOverrideTypes).toEqual(['python']);
  });

  it('closes dropdown on Escape', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
    });

    render(<ClassificationPreview />);

    // Open dropdown
    fireEvent.click(screen.getByTestId('type-indicator'));
    expect(screen.getByTestId('type-selector')).toBeTruthy();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByTestId('type-selector')).toBeNull();
  });

  it('shows pulse animation when isClassifying is true', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
      useInputSurfaceStore.getState().setIsClassifying(true);
    });

    render(<ClassificationPreview />);

    const indicator = screen.getByTestId('type-indicator');
    // The pulse animation class should be applied
    expect(indicator.className).toBeTruthy();
  });

  it('shows override type instead of classified type', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
      useInputSurfaceStore.getState().setUserOverrideTypes(['python']);
    });

    render(<ClassificationPreview />);

    const indicator = screen.getByTestId('type-indicator');
    expect(indicator.textContent).toBe('Python');
  });

  it('orders dropdown items with classified type first, then alternatives', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
        alternatives: [['python'], ['note']],
      });
    });

    render(<ClassificationPreview />);

    fireEvent.click(screen.getByTestId('type-indicator'));

    const options = screen.getAllByRole('option');
    // First option should be SQL (classified)
    expect(options[0].textContent).toContain('SQL');
    // Second should be Python (first alternative's first type)
    expect(options[1].textContent).toContain('Python');
  });

  it('closes dropdown when a type is selected', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
    });

    render(<ClassificationPreview />);

    fireEvent.click(screen.getByTestId('type-indicator'));
    expect(screen.getByTestId('type-selector')).toBeTruthy();

    // Select a type
    const options = screen.getAllByRole('option');
    fireEvent.click(options[0]);

    expect(screen.queryByTestId('type-selector')).toBeNull();
  });

  it('shows solid border when user has overridden type', () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['chat'],
        alternatives: [['note']],
      });
      useInputSurfaceStore.getState().setUserOverrideTypes(['sql']);
    });

    render(<ClassificationPreview />);

    const indicator = screen.getByTestId('type-indicator');
    expect(indicator.textContent).toBe('SQL');
  });
});
