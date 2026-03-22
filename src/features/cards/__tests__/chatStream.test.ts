import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamChat } from '../chatStream';
import type { ChatStreamOptions } from '../chatStream';

function createMockSSEStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const text = lines.join('\n') + '\n';
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

function createDefaultOptions(
  overrides: Partial<ChatStreamOptions> = {}
): ChatStreamOptions {
  return {
    url: '/api/chat',
    messages: [],
    cardContext: {
      cardId: 'card-1',
      cardType: 'sql',
      content: { query: 'SELECT 1', dataSource: 'test' },
      result: null,
      error: null,
    },
    signal: new AbortController().signal,
    onToken: vi.fn(),
    onToolCall: vi.fn(),
    onComplete: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

describe('streamChat', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses SSE tokens and calls onToken', async () => {
    const onToken = vi.fn();
    const onComplete = vi.fn();

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        createMockSSEStream([
          'data: {"content":"Hello"}',
          'data: {"content":" world"}',
          'data: [DONE]',
        ]),
        { status: 200 }
      )
    );

    await streamChat(createDefaultOptions({ onToken, onComplete }));

    expect(onToken).toHaveBeenCalledTimes(2);
    expect(onToken).toHaveBeenCalledWith('Hello');
    expect(onToken).toHaveBeenCalledWith(' world');
    expect(onComplete).toHaveBeenCalledWith('Hello world');
  });

  it('handles tool calls', async () => {
    const onToolCall = vi.fn();

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        createMockSSEStream([
          'data: {"tool_call":{"name":"retry_query","params":{"query":"SELECT 2"}}}',
          'data: [DONE]',
        ]),
        { status: 200 }
      )
    );

    await streamChat(createDefaultOptions({ onToolCall }));

    expect(onToolCall).toHaveBeenCalledWith({
      name: 'retry_query',
      params: { query: 'SELECT 2' },
    });
  });

  it('calls onError for non-2xx status', async () => {
    const onError = vi.fn();

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Internal Server Error', { status: 500 })
    );

    await streamChat(createDefaultOptions({ onError }));

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toContain('500');
  });

  it('does not call onError for AbortError', async () => {
    const onError = vi.fn();
    const controller = new AbortController();

    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      controller.abort();
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    });

    await streamChat(createDefaultOptions({ onError, signal: controller.signal }));

    expect(onError).not.toHaveBeenCalled();
  });

  it('skips malformed JSON lines', async () => {
    const onToken = vi.fn();
    const onComplete = vi.fn();

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        createMockSSEStream([
          'data: {"content":"hello"}',
          'data: {malformed',
          'data: {"content":" world"}',
          'data: [DONE]',
        ]),
        { status: 200 }
      )
    );

    await streamChat(createDefaultOptions({ onToken, onComplete }));

    expect(onToken).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledWith('hello world');
  });

  it('handles [DONE] signal', async () => {
    const onComplete = vi.fn();

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        createMockSSEStream([
          'data: {"content":"test"}',
          'data: [DONE]',
        ]),
        { status: 200 }
      )
    );

    await streamChat(createDefaultOptions({ onComplete }));

    expect(onComplete).toHaveBeenCalledWith('test');
  });

  it('sends POST with correct headers and body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(createMockSSEStream(['data: [DONE]']), { status: 200 })
    );

    await streamChat(
      createDefaultOptions({
        headers: { Authorization: 'Bearer token123' },
      })
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        }),
      })
    );
  });
});
