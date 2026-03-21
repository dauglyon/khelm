import Mention from '@tiptap/extension-mention';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MentionPill } from './MentionPill';
import type { SuggestionOptions } from '@tiptap/suggestion';

export interface MentionExtensionOptions {
  suggestion?: Partial<SuggestionOptions>;
}

/**
 * Creates the configured Mention extension for the input surface editor.
 * By default uses a stub suggestion config. The real suggestion dropdown
 * is wired in task 04/08.
 */
export function createMentionExtension(options: MentionExtensionOptions = {}) {
  const stubSuggestion: Partial<SuggestionOptions> = {
    char: '@',
    items: () => [],
    render: () => ({
      onStart: () => {},
      onUpdate: () => {},
      onKeyDown: () => false,
      onExit: () => {},
    }),
    ...options.suggestion,
  };

  return Mention.configure({
    HTMLAttributes: {
      class: 'mention-pill',
    },
    suggestion: stubSuggestion as SuggestionOptions,
  }).extend({
    addNodeView() {
      return ReactNodeViewRenderer(MentionPill);
    },
  });
}
