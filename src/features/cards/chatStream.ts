/**
 * Chat SSE transport using fetch + ReadableStream.
 * Pure TypeScript, no React dependency.
 */

import type { Message, CardType, CardContent, CardResult } from './types';

export interface ChatStreamOptions {
  url: string;
  messages: Message[];
  cardContext: {
    cardId: string;
    cardType: CardType;
    content: CardContent;
    result: CardResult | null;
    error: { code: string; message: string } | null;
  };
  signal: AbortSignal;
  onToken: (token: string) => void;
  onToolCall: (toolCall: { name: string; params: Record<string, unknown> }) => void;
  onComplete: (fullContent: string) => void;
  onError: (error: Error) => void;
  headers?: Record<string, string>;
}

export async function streamChat(options: ChatStreamOptions): Promise<void> {
  const {
    url,
    messages,
    cardContext,
    signal,
    onToken,
    onToolCall,
    onComplete,
    onError,
    headers = {},
  } = options;

  let accumulated = '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ messages, context: cardContext }),
      signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const body = response.body;
    if (!body) {
      throw new Error('Response body is null');
    }

    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let lineBuffer = '';

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Stream ended without [DONE] -- treat as complete
        onComplete(accumulated);
        return;
      }

      const chunk = decoder.decode(value, { stream: true });
      lineBuffer += chunk;

      const lines = lineBuffer.split('\n');
      // Last element may be incomplete; keep it in buffer
      lineBuffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);

          if (data === '[DONE]') {
            onComplete(accumulated);
            return;
          }

          try {
            const parsed = JSON.parse(data) as {
              content?: string;
              tool_call?: { name: string; params: Record<string, unknown> };
            };

            if (parsed.content) {
              accumulated += parsed.content;
              onToken(parsed.content);
            }

            if (parsed.tool_call) {
              onToolCall(parsed.tool_call);
            }
          } catch {
            // Malformed JSON -- skip this line
            continue;
          }
        } else if (trimmed.startsWith('event: error')) {
          // Next data line should contain error details
          // We handle this by continuing to the next line
          continue;
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      // Abort is not an error -- caller handles it
      return;
    }
    if (err instanceof Error) {
      onError(err);
    } else {
      onError(new Error(String(err)));
    }
  }
}
