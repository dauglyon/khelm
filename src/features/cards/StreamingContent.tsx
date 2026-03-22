import { useRef, useEffect, useCallback, useState } from 'react';
import type { CardType } from './types';
import {
  streamingContainer,
  cursor,
  codeBlockStyle,
  paragraphStyle,
} from './StreamingContent.css';

export interface StreamingContentProps {
  cardId: string;
  content: string;
  isStreaming: boolean;
  cardType: CardType;
  className?: string;
}

/**
 * Simple markdown-like renderer that tolerates incomplete markdown.
 * Renders headings, code blocks, and paragraphs.
 */
function renderSimpleMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const content = paragraphBuffer.join('\n');
      if (content.trim()) {
        nodes.push(
          <p key={nodes.length} className={paragraphStyle}>
            {content}
          </p>
        );
      }
      paragraphBuffer = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeBuffer.length > 0) {
      nodes.push(
        <pre key={nodes.length} className={codeBlockStyle}>
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
      codeBuffer = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushParagraph();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      nodes.push(
        <Tag key={nodes.length} style={{ margin: '8px 0' }}>
          {headingMatch[2]}
        </Tag>
      );
      continue;
    }

    paragraphBuffer.push(line);
  }

  // Flush remaining
  if (inCodeBlock) {
    flushCodeBlock();
  }
  flushParagraph();

  return nodes;
}

export function StreamingContent({
  content,
  isStreaming,
  className,
}: StreamingContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    const el = containerRef.current;
    if (el && !userScrolledUp && isStreaming) {
      el.scrollTop = el.scrollHeight;
    }
  }, [content, userScrolledUp, isStreaming]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      const isNearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
      setUserScrolledUp(!isNearBottom);
    }
  }, []);

  const handleClick = useCallback(() => {
    setUserScrolledUp(false);
  }, []);

  const classes = [streamingContainer, className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={classes}
      onScroll={handleScroll}
      onClick={handleClick}
    >
      {renderSimpleMarkdown(content)}
      {isStreaming && (
        <span className={cursor} data-testid="streaming-cursor" />
      )}
    </div>
  );
}
