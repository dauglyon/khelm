import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreamingContent } from '../StreamingContent';

describe('StreamingContent', () => {
  it('renders markdown content', () => {
    render(
      <StreamingContent
        cardId="card-1"
        content={'# Hello\n\nWorld'}
        isStreaming={false}
        cardType="sql"
      />
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('shows blinking cursor during streaming', () => {
    render(
      <StreamingContent
        cardId="card-1"
        content="Some text"
        isStreaming={true}
        cardType="sql"
      />
    );
    expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument();
  });

  it('hides cursor when not streaming', () => {
    render(
      <StreamingContent
        cardId="card-1"
        content="Some text"
        isStreaming={false}
        cardType="sql"
      />
    );
    expect(screen.queryByTestId('streaming-cursor')).not.toBeInTheDocument();
  });

  it('renders code blocks from markdown', () => {
    const content = 'Before\n\n```python\nprint("hello")\n```\n\nAfter';
    const { container } = render(
      <StreamingContent
        cardId="card-1"
        content={content}
        isStreaming={false}
        cardType="python"
      />
    );
    expect(container.querySelector('pre code')).toBeInTheDocument();
  });

  it('handles incomplete markdown without crashing', () => {
    render(
      <StreamingContent
        cardId="card-1"
        content="**bold but not closed"
        isStreaming={true}
        cardType="sql"
      />
    );
    expect(screen.getByText('**bold but not closed')).toBeInTheDocument();
  });
});
