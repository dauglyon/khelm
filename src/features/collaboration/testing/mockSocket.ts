/**
 * Mock Socket.IO client for unit tests.
 * Implements the Socket.IO client interface used by collaboration code.
 */

type Handler = (...args: unknown[]) => void;

interface EmittedEvent {
  event: string;
  args: unknown[];
}

export interface MockSocket {
  // Standard Socket.IO client methods
  on(event: string, handler: Handler): MockSocket;
  off(event: string, handler?: Handler): MockSocket;
  emit(event: string, ...args: unknown[]): MockSocket;
  connect(): MockSocket;
  disconnect(): MockSocket;
  connected: boolean;
  id: string;

  // Test helpers
  simulateEvent(event: string, ...args: unknown[]): void;
  getEmittedEvents(): EmittedEvent[];
  getLastEmit(event: string): unknown[] | undefined;
  clearEmittedEvents(): void;
  simulateDisconnect(): void;
  simulateReconnect(): void;
}

export function createMockSocket(socketId?: string): MockSocket {
  const handlers = new Map<string, Set<Handler>>();
  const emittedEvents: EmittedEvent[] = [];
  let connected = false;
  const id = socketId ?? 'mock-socket-id';

  function addHandler(event: string, handler: Handler) {
    if (!handlers.has(event)) {
      handlers.set(event, new Set());
    }
    handlers.get(event)!.add(handler);
  }

  function removeHandler(event: string, handler?: Handler) {
    if (!handler) {
      handlers.delete(event);
      return;
    }
    const set = handlers.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) handlers.delete(event);
    }
  }

  function triggerHandlers(event: string, ...args: unknown[]) {
    const set = handlers.get(event);
    if (set) {
      for (const handler of set) {
        handler(...args);
      }
    }
  }

  const mockSocket: MockSocket = {
    get connected() {
      return connected;
    },
    get id() {
      return id;
    },

    on(event: string, handler: Handler) {
      addHandler(event, handler);
      return mockSocket;
    },

    off(event: string, handler?: Handler) {
      removeHandler(event, handler);
      return mockSocket;
    },

    emit(event: string, ...args: unknown[]) {
      emittedEvents.push({ event, args });
      return mockSocket;
    },

    connect() {
      connected = true;
      triggerHandlers('connect');
      return mockSocket;
    },

    disconnect() {
      connected = false;
      triggerHandlers('disconnect');
      return mockSocket;
    },

    // Test helpers
    simulateEvent(event: string, ...args: unknown[]) {
      triggerHandlers(event, ...args);
    },

    getEmittedEvents() {
      return [...emittedEvents];
    },

    getLastEmit(event: string) {
      for (let i = emittedEvents.length - 1; i >= 0; i--) {
        if (emittedEvents[i].event === event) {
          return emittedEvents[i].args;
        }
      }
      return undefined;
    },

    clearEmittedEvents() {
      emittedEvents.length = 0;
    },

    simulateDisconnect() {
      connected = false;
      triggerHandlers('disconnect');
    },

    simulateReconnect() {
      connected = true;
      triggerHandlers('connect');
    },
  };

  return mockSocket;
}
