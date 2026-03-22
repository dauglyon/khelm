import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import type { Editor, JSONContent, Extensions } from '@tiptap/core';
import {
  editorWrapper,
  editorContainer,
  disabled as disabledClass,
} from './singleLineEditor.css';

// Single-line document: single paragraph node for compatibility with Mention inline nodes (see R12)
const SingleLineDocument = Document.extend({
  content: 'paragraph',
});

export interface SingleLineEditorProps {
  onSubmit: (text: string, json: JSONContent) => void;
  onUpdate: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  editorRef?: React.MutableRefObject<Editor | null>;
  /** Additional TipTap extensions (e.g., Mention) */
  extensions?: Extensions;
}

export function SingleLineEditor({
  onSubmit,
  onUpdate,
  placeholder = 'Ask a question, write code, or drop a file...',
  disabled: isDisabled = false,
  editorRef,
  extensions: additionalExtensions = [],
}: SingleLineEditorProps) {
  const editor = useEditor({
    extensions: [
      SingleLineDocument,
      Text,
      Paragraph,
      Placeholder.configure({ placeholder }),
      ...additionalExtensions,
    ],
    editable: !isDisabled,
    autofocus: true,
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter') {
          if (event.shiftKey) {
            // Shift+Enter is a no-op
            return true;
          }
          // Enter triggers submit
          if (editor) {
            const text = editor.getText();
            const json = editor.getJSON();
            onSubmit(text, json);
          }
          return true;
        }
        return false;
      },
      transformPastedText: (text) => {
        // Replace newlines with spaces when pasting plain text
        return text.replace(/[\n\r]/g, ' ');
      },
      transformPastedHTML: (html) => {
        // Strip block-level tags and replace with spaces, then wrap in a single <p>
        const flattened = html
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/<\/p>/gi, ' ')
          .replace(/<\/div>/gi, ' ')
          .replace(/<p[^>]*>/gi, '')
          .replace(/<div[^>]*>/gi, '');
        return `<p>${flattened}</p>`;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onUpdate(ed.getText());
    },
  });

  // Expose editor instance via ref
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
    return () => {
      if (editorRef) {
        editorRef.current = null;
      }
    };
  }, [editor, editorRef]);

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isDisabled);
    }
  }, [editor, isDisabled]);

  const wrapperClasses = [editorWrapper, isDisabled ? disabledClass : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      <EditorContent editor={editor} className={editorContainer} />
    </div>
  );
}
