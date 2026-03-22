import { useState, useCallback, useRef, useEffect } from 'react';
import { useCardStore } from '../store';
import type { NoteContent } from '../types';
import { noteContainer, noteTextarea } from './NoteBody.css';

export interface NoteBodyProps {
  content: NoteContent;
  cardId: string;
}

export function NoteBody({ content, cardId }: NoteBodyProps) {
  const [text, setText] = useState(content.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external changes
  useEffect(() => {
    setText(content.text);
  }, [content.text]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  const handleBlur = useCallback(() => {
    if (text !== content.text) {
      useCardStore.getState().updateCard(cardId, {
        content: { text } as NoteContent,
      });
    }
  }, [text, content.text, cardId]);

  return (
    <div className={noteContainer}>
      <textarea
        ref={textareaRef}
        className={noteTextarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="Write a note..."
        aria-label="Note content"
      />
    </div>
  );
}
