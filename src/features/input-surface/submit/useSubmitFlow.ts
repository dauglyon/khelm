import { useCallback } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';
import { useInputSurfaceStore } from '../store/useInputSurfaceStore';
import type { InputType } from '../store/useInputSurfaceStore';

export interface CardCreationPayload {
  type: InputType;
  content: JSONContent;
  mentions: Array<{ cardId: string; label: string }>;
  sessionId: string;
}

export interface UseSubmitFlowOptions {
  editorRef: React.MutableRefObject<Editor | null>;
  sessionId: string;
  onCardCreated?: (payload: CardCreationPayload) => void;
  onError?: (error: Error) => void;
}

/**
 * Extract mention nodes from a TipTap JSON document.
 */
function extractMentions(
  json: JSONContent
): Array<{ cardId: string; label: string }> {
  const mentions: Array<{ cardId: string; label: string }> = [];

  function walk(node: JSONContent) {
    if (node.type === 'mention' && node.attrs) {
      mentions.push({
        cardId: node.attrs.id as string,
        label: node.attrs.label as string,
      });
    }
    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(json);
  return mentions;
}

export function useSubmitFlow({
  editorRef,
  sessionId,
  onCardCreated,
  onError,
}: UseSubmitFlowOptions) {
  const resolvedType = useInputSurfaceStore((s) => s.resolvedType);
  const isSubmitting = useInputSurfaceStore((s) => s.isSubmitting);
  const setIsSubmitting = useInputSurfaceStore((s) => s.setIsSubmitting);
  const reset = useInputSurfaceStore((s) => s.reset);

  const submit = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;

    // Guard: empty input
    if (editor.isEmpty) return;

    // Guard: already submitting
    if (useInputSurfaceStore.getState().isSubmitting) return;

    // Resolve type
    const type = useInputSurfaceStore.getState().resolvedType();
    if (!type) {
      // No type resolved - cannot submit
      onError?.(new Error('No input type selected. Please select a type before submitting.'));
      return;
    }

    // Extract content
    const content = editor.getJSON();
    const mentions = extractMentions(content);

    // Build payload
    const payload: CardCreationPayload = {
      type,
      content,
      mentions,
      sessionId,
    };

    setIsSubmitting(true);

    try {
      // Call the card creation callback
      onCardCreated?.(payload);

      // Clear editor and reset store on success
      editor.commands.clearContent();
      reset();
    } catch (error) {
      // On error: keep input content, report error
      setIsSubmitting(false);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [editorRef, sessionId, onCardCreated, onError, setIsSubmitting, reset, resolvedType]);

  return {
    submit,
    isSubmitting,
  };
}
