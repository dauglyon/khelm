import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import type { InputType } from '@/theme';
import { pillBase, pillColorVariants } from './mentionPill.css';

/** Map a label prefix to an InputType for color styling */
function getTypeFromLabel(label: string): InputType {
  const prefix = label.split('-')[0]?.toLowerCase();
  const typeMap: Record<string, InputType> = {
    query: 'sql',
    sql: 'sql',
    python: 'python',
    py: 'python',
    literature: 'literature',
    lit: 'literature',
    hypothesis: 'hypothesis',
    hyp: 'hypothesis',
    note: 'note',
    data: 'dataIngest',
    ingest: 'dataIngest',
  };
  return typeMap[prefix ?? ''] ?? 'note';
}

export function MentionPill({ node }: NodeViewProps) {
  const { label } = node.attrs as { id: string; label: string };
  const inputType = getTypeFromLabel(label);

  const classes = [pillBase, pillColorVariants[inputType]].join(' ');

  return (
    <NodeViewWrapper as="span" className={classes}>
      @{label}
    </NodeViewWrapper>
  );
}
