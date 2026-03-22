import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { useInputSurfaceStore } from './store/useInputSurfaceStore';
import { InputBar } from './InputBar';
import type { SuggestionCard } from './suggestion/SuggestionDropdown';

// Mock createPortal for suggestion dropdown
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

const mockCards: SuggestionCard[] = [
  { id: '1', shortname: 'query-1', title: 'Soil query', type: 'sql' },
  { id: '2', shortname: 'note-1', title: 'Lab notes', type: 'note' },
];

describe('InputBar', () => {
  beforeEach(() => {
    useInputSurfaceStore.getState().reset();

    // Mock Ollama health check to return false (use API mode)
    server.use(
      http.get('http://localhost:11434/api/tags', () => {
        return HttpResponse.error();
      })
    );
  });

  it('renders editor and submit button', async () => {
    render(
      <InputBar
        sessionId="test-session"
        cards={mockCards}
        onCardCreated={vi.fn()}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const editorEl = document.querySelector('.ProseMirror');
    expect(editorEl).toBeTruthy();

    const submitBtn = screen.getByLabelText('Submit');
    expect(submitBtn).toBeTruthy();
  });

  it('submit button is disabled when editor is empty', async () => {
    render(
      <InputBar
        sessionId="test-session"
        onCardCreated={vi.fn()}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const submitBtn = screen.getByLabelText('Submit');
    expect(submitBtn).toBeDisabled();
  });

  it('shows spinner on submit button when isSubmitting', async () => {
    render(
      <InputBar
        sessionId="test-session"
        onCardCreated={vi.fn()}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // Set isSubmitting after mount so the sessionId effect doesn't reset it
    act(() => {
      useInputSurfaceStore.getState().setIsSubmitting(true);
    });

    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeTruthy();
  });

  it('renders classification preview', async () => {
    render(
      <InputBar
        sessionId="test-session"
        onCardCreated={vi.fn()}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // Set classification after mount so the sessionId effect doesn't reset it
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
    });

    const indicator = screen.getByTestId('type-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator.textContent).toBe('SQL');
  });

  it('submit button has accessible aria-label', async () => {
    render(
      <InputBar
        sessionId="test-session"
        onCardCreated={vi.fn()}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const submitBtn = screen.getByLabelText('Submit');
    expect(submitBtn).toBeTruthy();
    expect(submitBtn.getAttribute('type')).toBe('button');
  });

  it('accepts cards prop for suggestion dropdown', async () => {
    render(
      <InputBar
        sessionId="test-session"
        cards={mockCards}
        onCardCreated={vi.fn()}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const editorEl = document.querySelector('.ProseMirror');
    expect(editorEl).toBeTruthy();
  });
});
