import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';
import { SingleLineEditor } from './editor/SingleLineEditor';
import { ClassificationPreview } from './classification-preview/ClassificationPreview';
import { useSubmitFlow } from './submit/useSubmitFlow';
import type { CardCreationPayload } from './submit/useSubmitFlow';
import { createClassifier } from './classifier/classificationService';
import type { Classifier } from './classifier/classificationService';
import { createMentionExtension } from './mention/mentionExtension';
import { createSuggestionRenderer } from './suggestion/SuggestionDropdown';
import type { SuggestionCard } from './suggestion/SuggestionDropdown';
import { useInputSurfaceStore } from './store/useInputSurfaceStore';
import { Spinner } from '@/common/components';
import { inputBarWrapper, submitButton } from './inputBar.css';

export interface InputBarProps {
  sessionId: string;
  cards?: SuggestionCard[];
  onCardCreated?: (payload: CardCreationPayload) => void;
  onError?: (error: Error) => void;
}

export function InputBar({
  sessionId,
  cards = [],
  onCardCreated,
  onError,
}: InputBarProps) {
  const editorRef = useRef<Editor | null>(null);
  const classifierRef = useRef<Classifier | null>(null);
  const [editorEmpty, setEditorEmpty] = useState(true);
  const isSubmitting = useInputSurfaceStore((s) => s.isSubmitting);
  const store = useInputSurfaceStore;

  // Create classifier on mount
  useEffect(() => {
    const classifier = createClassifier(store.getState());
    classifierRef.current = classifier;

    // Run health check on mount
    classifier.checkHealth();

    return () => {
      classifier.destroy();
      classifierRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on sessionId change
  useEffect(() => {
    store.getState().reset();
    if (editorRef.current) {
      editorRef.current.commands.clearContent();
    }
    setEditorEmpty(true);
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up submit flow
  const { submit } = useSubmitFlow({
    editorRef,
    sessionId,
    onCardCreated,
    onError,
  });

  // Create mention extension with suggestion wiring
  const mentionExtension = useMemo(() => {
    const filterCards = (query: string): SuggestionCard[] => {
      const q = query.toLowerCase();
      return cards.filter(
        (card) =>
          card.shortname.toLowerCase().includes(q) ||
          card.title.toLowerCase().includes(q)
      );
    };

    const suggestionRenderer = createSuggestionRenderer(filterCards);

    return createMentionExtension({
      suggestion: {
        char: '@',
        items: suggestionRenderer.items,
        render: suggestionRenderer.render,
      },
    });
  }, [cards]);

  const handleUpdate = useCallback((text: string) => {
    setEditorEmpty(text.trim().length === 0);
    classifierRef.current?.classify(text);
  }, []);

  const handleSubmit = useCallback(
    (_text: string, _json: JSONContent) => {
      submit();
    },
    [submit]
  );

  const handleSubmitButton = useCallback(() => {
    submit();
  }, [submit]);

  return (
    <div className={inputBarWrapper}>
      <ClassificationPreview />

      <SingleLineEditor
        onSubmit={handleSubmit}
        onUpdate={handleUpdate}
        editorRef={editorRef}
        disabled={isSubmitting}
        extensions={[mentionExtension]}
      />

      <button
        type="button"
        className={submitButton}
        onClick={handleSubmitButton}
        disabled={editorEmpty || isSubmitting}
        aria-label="Submit"
      >
        {isSubmitting ? (
          <Spinner size={16} color="currentColor" />
        ) : (
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
