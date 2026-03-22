import { http, HttpResponse } from 'msw';

/**
 * Helper to create a mock SSE ReadableStream response.
 */
export function createMockSSEResponse(tokens: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const token of tokens) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: token })}\n\n`)
        );
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

export const cardHandlers = [
  http.post('/api/cards/:id/execute', () => {
    return new HttpResponse(
      createMockSSEResponse(['Result ', 'token ', 'stream']),
      {
        headers: { 'Content-Type': 'text/event-stream' },
      }
    );
  }),

  http.post('/api/cards/:id/chat', () => {
    return new HttpResponse(
      createMockSSEResponse(['Chat ', 'response ', 'here']),
      {
        headers: { 'Content-Type': 'text/event-stream' },
      }
    );
  }),

  http.post('/api/cards/chat', () => {
    return new HttpResponse(
      createMockSSEResponse(['Chat ', 'response ', 'here']),
      {
        headers: { 'Content-Type': 'text/event-stream' },
      }
    );
  }),

  http.post('/api/cards', () => {
    return HttpResponse.json({
      id: crypto.randomUUID(),
      shortname: 'New Card',
      type: 'sql',
      status: 'thinking',
    });
  }),

  http.patch('/api/cards/:id', () => {
    return HttpResponse.json({ updated: true });
  }),

  http.delete('/api/cards/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
