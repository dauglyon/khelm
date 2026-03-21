import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import type { Editor, JSONContent } from '@tiptap/core';
import { SingleLineEditor } from './SingleLineEditor';

describe('SingleLineEditor', () => {
  let onSubmit: (...args: unknown[]) => void;
  let onUpdate: (...args: unknown[]) => void;

  beforeEach(() => {
    onSubmit = vi.fn<(...args: unknown[]) => void>();
    onUpdate = vi.fn<(...args: unknown[]) => void>();
  });

  it('renders the editor', () => {
    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
      />
    );

    const editorEl = document.querySelector('.ProseMirror');
    expect(editorEl).toBeTruthy();
  });

  it('exposes editor instance via editorRef', async () => {
    const ref = { current: null as Editor | null };

    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
        editorRef={ref}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(ref.current).toBeTruthy();
    expect(ref.current?.getText).toBeDefined();
  });

  it('calls onUpdate when content changes', async () => {
    const ref = { current: null as Editor | null };

    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
        editorRef={ref}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const editor = ref.current;
    expect(editor).toBeTruthy();

    await act(async () => {
      editor!.commands.insertContent('hello world');
    });

    expect(onUpdate).toHaveBeenCalledWith('hello world');
  });

  it('calls onSubmit on Enter key with text and JSON', async () => {
    const ref = { current: null as Editor | null };

    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
        editorRef={ref}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const editor = ref.current!;
    await act(async () => {
      editor.commands.insertContent('SELECT * FROM table');
    });

    const proseMirrorEl = document.querySelector('.ProseMirror') as HTMLElement;
    await act(async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      proseMirrorEl.dispatchEvent(event);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      'SELECT * FROM table',
      expect.objectContaining({ type: 'doc' })
    );
  });

  it('does not insert newline on Enter', async () => {
    const ref = { current: null as Editor | null };

    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
        editorRef={ref}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const editor = ref.current!;
    await act(async () => {
      editor.commands.insertContent('line one');
    });

    await act(async () => {
      editor.commands.enter();
    });

    const text = editor.getText();
    expect(text).not.toContain('\n');
  });

  it('treats Shift+Enter as no-op', async () => {
    const ref = { current: null as Editor | null };

    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
        editorRef={ref}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const editor = ref.current!;
    await act(async () => {
      editor.commands.insertContent('some text');
    });

    const proseMirrorEl = document.querySelector('.ProseMirror') as HTMLElement;
    await act(async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: true,
        bubbles: true,
      });
      proseMirrorEl.dispatchEvent(event);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(editor.getText()).not.toContain('\n');
  });

  it('can be cleared via editorRef', async () => {
    const ref = { current: null as Editor | null };

    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
        editorRef={ref}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const editor = ref.current!;
    await act(async () => {
      editor.commands.insertContent('some text');
    });

    expect(editor.getText()).toBe('some text');

    await act(async () => {
      editor.commands.clearContent();
    });

    expect(editor.getText()).toBe('');
  });

  it('renders with a placeholder', () => {
    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
        placeholder="Type something..."
      />
    );

    const editorEl = document.querySelector('.ProseMirror');
    expect(editorEl).toBeTruthy();
  });

  it('applies disabled state', async () => {
    const ref = { current: null as Editor | null };

    render(
      <SingleLineEditor
        onSubmit={onSubmit as (text: string, json: JSONContent) => void}
        onUpdate={onUpdate as (text: string) => void}
        editorRef={ref}
        disabled={true}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const editor = ref.current;
    expect(editor?.isEditable).toBe(false);
  });
});
