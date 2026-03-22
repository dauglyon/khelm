import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInputSurfaceStore } from '../store/useInputSurfaceStore';
import { useSubmitFlow } from './useSubmitFlow';

function createMockEditor(options?: { isEmpty?: boolean }) {
  return {
    isEmpty: options?.isEmpty ?? false,
    getJSON: () => ({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'SELECT * FROM ' },
            {
              type: 'mention',
              attrs: { id: 'card-1', label: 'query-1' },
            },
          ],
        },
      ],
    }),
    getText: () => 'SELECT * FROM @query-1',
    commands: {
      clearContent: vi.fn(),
    },
  };
}

describe('useSubmitFlow', () => {
  beforeEach(() => {
    useInputSurfaceStore.getState().reset();
  });

  it('returns submit function and isSubmitting state', () => {
    const editorRef = { current: createMockEditor() as never };
    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
      })
    );

    expect(typeof result.current.submit).toBe('function');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('does not submit when editor is empty', async () => {
    const editorRef = { current: createMockEditor({ isEmpty: true }) as never };
    const onCardCreated = vi.fn();

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated,
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(onCardCreated).not.toHaveBeenCalled();
  });

  it('does not submit when resolvedTypes is null', async () => {
    const editorRef = { current: createMockEditor() as never };
    const onCardCreated = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated,
        onError,
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(onCardCreated).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('submits with correct payload including mentions', async () => {
    // Set up classification
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
    });

    const mockEditor = createMockEditor();
    const editorRef = { current: mockEditor as never };
    const onCardCreated = vi.fn();

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated,
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(onCardCreated).toHaveBeenCalledWith({
      types: ['sql'],
      content: expect.objectContaining({ type: 'doc' }),
      mentions: [{ cardId: 'card-1', label: 'query-1' }],
      sessionId: 'test-session',
    });
  });

  it('submits with compound pipeline types', async () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql', 'python'],
      });
    });

    const mockEditor = createMockEditor();
    const editorRef = { current: mockEditor as never };
    const onCardCreated = vi.fn();

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated,
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(onCardCreated).toHaveBeenCalledWith(
      expect.objectContaining({ types: ['sql', 'python'] })
    );
  });

  it('clears editor after successful submit', async () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
    });

    const mockEditor = createMockEditor();
    const editorRef = { current: mockEditor as never };

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(mockEditor.commands.clearContent).toHaveBeenCalled();
  });

  it('resets store after successful submit', async () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
        alternatives: [['python']],
      });
    });

    const editorRef = { current: createMockEditor() as never };

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    const state = useInputSurfaceStore.getState();
    expect(state.classifiedTypes).toBeNull();
    expect(state.alternatives).toBeNull();
    expect(state.isSubmitting).toBe(false);
  });

  it('reads resolvedTypes from store (respects user override)', async () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
      useInputSurfaceStore.getState().setUserOverrideTypes(['python']);
    });

    const editorRef = { current: createMockEditor() as never };
    const onCardCreated = vi.fn();

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated,
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(onCardCreated).toHaveBeenCalledWith(
      expect.objectContaining({ types: ['python'] })
    );
  });

  it('prevents double submit via isSubmitting guard', async () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['sql'],
      });
      useInputSurfaceStore.getState().setIsSubmitting(true);
    });

    const editorRef = { current: createMockEditor() as never };
    const onCardCreated = vi.fn();

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated,
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(onCardCreated).not.toHaveBeenCalled();
  });

  it('does not submit when editorRef is null', async () => {
    const editorRef = { current: null };
    const onCardCreated = vi.fn();

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef: editorRef as never,
        sessionId: 'test-session',
        onCardCreated,
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(onCardCreated).not.toHaveBeenCalled();
  });

  it('extracts mentions from nested JSON', async () => {
    act(() => {
      useInputSurfaceStore.getState().setClassification({
        types: ['note'],
      });
    });

    const mockEditor = {
      isEmpty: false,
      getJSON: () => ({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Check ' },
              { type: 'mention', attrs: { id: 'c1', label: 'query-1' } },
              { type: 'text', text: ' and ' },
              { type: 'mention', attrs: { id: 'c2', label: 'note-2' } },
            ],
          },
        ],
      }),
      commands: { clearContent: vi.fn() },
    };

    const editorRef = { current: mockEditor as never };
    const onCardCreated = vi.fn();

    const { result } = renderHook(() =>
      useSubmitFlow({
        editorRef,
        sessionId: 'test-session',
        onCardCreated,
      })
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(onCardCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        mentions: [
          { cardId: 'c1', label: 'query-1' },
          { cardId: 'c2', label: 'note-2' },
        ],
      })
    );
  });
});
