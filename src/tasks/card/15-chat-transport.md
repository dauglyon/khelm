# Task 15: Chat SSE Transport

## Dependencies

- **01-card-types**: `Message`, `MessageRole`, `MessageStatus`
- **14-chat-panel-layout**: `ChatPanel` component (consumes transport output)

## Context

The chat panel uses a custom fetch + ReadableStream implementation for streaming AI responses (architecture/card.md > Inline Chat Panel > Implementation). This is NOT EventSource -- we need POST requests with auth headers, which EventSource does not support. The transport is ~150 lines of real code.

This task implements the SSE parsing, token buffering, and abort handling as a standalone module with no React dependency (pure TypeScript). React integration happens in task 17.

## Implementation Requirements

### Files to Create

1. **`src/features/cards/chatStream.ts`** (~150 lines)
2. **`src/features/cards/__tests__/chatStream.test.ts`** (~120 lines)

### Core Function

```typescript
interface ChatStreamOptions {
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
  onToolCall: (toolCall: { name: string; params: Record<string, any> }) => void;
  onComplete: (fullContent: string) => void;
  onError: (error: Error) => void;
  headers?: Record<string, string>;
}

async function streamChat(options: ChatStreamOptions): Promise<void>;
```

### Transport Implementation (per architecture spec)

| Concern | Approach |
|---------|----------|
| HTTP method | POST |
| Content-Type | `application/json` |
| Request body | `{ messages, context: cardContext }` |
| Response | `ReadableStream` with SSE-formatted lines |
| Auth | Bearer token via `headers` option (caller provides) |

### SSE Parsing

```
1. Get ReadableStream from response.body
2. Create TextDecoder({ stream: true }) for UTF-8 safety
3. Read chunks, decode to string
4. Split on '\n'
5. For each line:
   a. Skip empty lines
   b. If starts with 'data: ':
      - If 'data: [DONE]': call onComplete with accumulated content, return
      - Parse JSON: { content?: string; tool_call?: ToolCall }
      - If content: call onToken(content), append to accumulated buffer
      - If tool_call: call onToolCall(tool_call)
   c. If starts with 'event: error': parse next data line as error, call onError
6. Handle partial lines: buffer incomplete lines across chunks
```

### Abort Handling

- Accept `AbortSignal` via options
- Pass signal to `fetch(url, { signal, ... })`
- On `AbortError`: do NOT call `onError`; the caller handles abort separately
- Distinguish `AbortError` from other errors by checking `error.name === 'AbortError'`

### Error Handling

- Non-2xx response: throw with status code and response text
- Network error: catch and call `onError`
- JSON parse error in SSE data: skip malformed line, continue parsing
- Stream interruption: call `onError` with descriptive message

### Partial Line Buffering

SSE chunks may split mid-line. Maintain a line buffer:
```
buffer += decodedChunk
lines = buffer.split('\n')
buffer = lines.pop() // last element may be incomplete
process(lines)
```

## Demo Reference

**Vignette 1**: User sends "Why did this query fail?" in the chat. Transport sends POST with message array + card context. Backend streams back tokens. `onToken` fires for each token. After `data: [DONE]`, `onComplete` fires with the full response.

**Vignette 2**: User clicks Abort during streaming. `AbortController.abort()` cancels the fetch. The `AbortError` is caught silently (not reported as an error). Partial content is preserved by the caller.

## Integration Proofs

1. **Basic stream test**: Mock fetch to return a ReadableStream of SSE lines. Call `streamChat`. Assert `onToken` called for each content token. Assert `onComplete` called with full content.
2. **Abort test**: Start stream, abort signal after 2 tokens. Assert `onError` is NOT called. Assert accumulated content is partial.
3. **Tool call test**: Mock SSE with a tool_call payload. Assert `onToolCall` called with correct name and params.
4. **Error response test**: Mock fetch to return 500 status. Assert `onError` called with error containing status code.
5. **Malformed JSON test**: Include a malformed `data:` line in the stream. Assert it is skipped, subsequent valid lines still processed.
6. **Partial line test**: Send a chunk that splits mid-line. Assert the partial line is buffered and completed in the next chunk.
7. **[DONE] test**: Include `data: [DONE]` line. Assert `onComplete` called, no further processing.
8. **UTF-8 safety test**: Send multi-byte characters split across chunk boundaries. Assert they decode correctly.

## Acceptance Criteria

- [ ] Sends POST request with JSON body (messages + card context)
- [ ] Supports custom headers (for auth)
- [ ] Parses SSE `data:` lines correctly
- [ ] Handles `data: [DONE]` to signal completion
- [ ] Calls `onToken` for each content token
- [ ] Calls `onToolCall` for tool call payloads
- [ ] Calls `onComplete` with full accumulated content
- [ ] Calls `onError` for non-abort errors
- [ ] Silently handles `AbortError` (no onError call)
- [ ] Buffers partial lines across chunks
- [ ] Uses `TextDecoder({ stream: true })` for UTF-8 safety
- [ ] Skips malformed JSON data lines without crashing
- [ ] No React dependency -- pure TypeScript module
- [ ] All tests pass

## Anti-Patterns

- Do not use `EventSource` -- it only supports GET and no custom headers
- Do not use a third-party SSE library -- the parsing is simple enough for ~50 lines
- Do not put React hooks or state in this module -- it is framework-agnostic
- Do not accumulate tokens in this module for UI display -- call `onToken` and let the consumer buffer
- Do not retry on error -- retry logic is in task 16
- Do not parse the full response body at once -- stream it chunk by chunk
