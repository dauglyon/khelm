import { useState, useCallback, useRef, useEffect } from 'react';
import { useCardStore } from '../store';
import type { NoteContent } from '../types';
import {
  noteContainer,
  noteTextarea,
  noteReadOnly,
  noteEmpty,
} from './NoteBody.css';

export interface NoteBodyProps {
  content: NoteContent;
  cardId: string;
  isEditable?: boolean;
}

const DEBOUNCE_MS = 1000;

export function NoteBody({
  content,
  cardId,
  isEditable = true,
}: NoteBodyProps) {
  const [text, setText] = useState(content.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const saveChanges = useCallback(
    (value: string) => {
      if (value !== content.text) {
        useCardStore.getState().updateCard(cardId, {
          content: { text: value } as NoteContent,
        });
      }
    },
    [content.text, cardId]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setText(value);

      // Debounced auto-save after 1s of inactivity
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        saveChanges(value);
      }, DEBOUNCE_MS);
    },
    [saveChanges]
  );

  const handleBlur = useCallback(() => {
    // Save immediately on blur, cancel pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    saveChanges(text);
  }, [text, saveChanges]);

  // Read-only view
  if (!isEditable) {
    if (!content.text) {
      return (
        <div className={noteContainer}>
          <p className={noteEmpty}>No content</p>
        </div>
      );
    }
    return (
      <div className={noteContainer}>
        <p className={noteReadOnly}>{content.text}</p>
      </div>
    );
  }

  return (
    <div className={noteContainer}>
      <textarea
        ref={textareaRef}
        className={noteTextarea}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Write a note..."
        aria-label="Note content"
      />
    </div>
  );
}
