import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MentionPill } from './MentionPill';
import type { NodeViewProps } from '@tiptap/react';

// Mock NodeViewWrapper since it requires TipTap context
vi.mock('@tiptap/react', () => ({
  NodeViewWrapper: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
    as?: string;
  }) => <span className={className}>{children}</span>,
  ReactNodeViewRenderer: vi.fn(),
}));

function createMockProps(attrs: { id: string; label: string }): NodeViewProps {
  return {
    node: {
      attrs,
      type: { name: 'mention' },
      isLeaf: true,
      isBlock: false,
      textContent: `@${attrs.label}`,
    },
    editor: {},
    getPos: () => 0,
    updateAttributes: vi.fn(),
    deleteNode: vi.fn(),
    selected: false,
    extension: {},
    HTMLAttributes: {},
    decorations: [],
  } as unknown as NodeViewProps;
}

describe('MentionPill', () => {
  it('renders with @ prefix and label', () => {
    const props = createMockProps({ id: 'card-1', label: 'query-1' });
    const { getByText } = render(<MentionPill {...props} />);
    expect(getByText('@query-1')).toBeTruthy();
  });

  it('renders with label for note type', () => {
    const props = createMockProps({ id: 'card-2', label: 'note-3' });
    const { getByText } = render(<MentionPill {...props} />);
    expect(getByText('@note-3')).toBeTruthy();
  });

  it('maps query prefix to SQL type colors', () => {
    const props = createMockProps({ id: 'card-1', label: 'query-1' });
    const { container } = render(<MentionPill {...props} />);
    const pill = container.querySelector('span');
    expect(pill).toBeTruthy();
    expect(pill?.className).toBeTruthy();
  });

  it('maps python prefix to Python type colors', () => {
    const props = createMockProps({ id: 'card-3', label: 'python-2' });
    const { getByText } = render(<MentionPill {...props} />);
    expect(getByText('@python-2')).toBeTruthy();
  });

  it('defaults to note colors for unknown prefix', () => {
    const props = createMockProps({ id: 'card-4', label: 'unknown-1' });
    const { getByText } = render(<MentionPill {...props} />);
    expect(getByText('@unknown-1')).toBeTruthy();
  });

  it('maps lit prefix to literature type', () => {
    const props = createMockProps({ id: 'card-5', label: 'lit-1' });
    const { getByText } = render(<MentionPill {...props} />);
    expect(getByText('@lit-1')).toBeTruthy();
  });

  it('maps data prefix to dataIngest type', () => {
    const props = createMockProps({ id: 'card-6', label: 'data-1' });
    const { getByText } = render(<MentionPill {...props} />);
    expect(getByText('@data-1')).toBeTruthy();
  });
});
