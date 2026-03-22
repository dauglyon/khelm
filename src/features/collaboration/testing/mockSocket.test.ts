import { describe, it, expect } from 'vitest';
import { createMockSocket } from './mockSocket';

describe('MockSocket', () => {
  it('starts disconnected', () => {
    const socket = createMockSocket();
    expect(socket.connected).toBe(false);
  });

  it('has a socket id', () => {
    const socket = createMockSocket('test-123');
    expect(socket.id).toBe('test-123');
  });

  it('uses default id when none provided', () => {
    const socket = createMockSocket();
    expect(socket.id).toBe('mock-socket-id');
  });

  it('connect() sets connected to true and triggers connect event', () => {
    const socket = createMockSocket();
    let connectFired = false;
    socket.on('connect', () => {
      connectFired = true;
    });
    socket.connect();
    expect(socket.connected).toBe(true);
    expect(connectFired).toBe(true);
  });

  it('disconnect() sets connected to false and triggers disconnect event', () => {
    const socket = createMockSocket();
    socket.connect();
    let disconnectFired = false;
    socket.on('disconnect', () => {
      disconnectFired = true;
    });
    socket.disconnect();
    expect(socket.connected).toBe(false);
    expect(disconnectFired).toBe(true);
  });

  it('records emitted events', () => {
    const socket = createMockSocket();
    socket.emit('card:lock:request', { cardId: 'c1' });
    socket.emit('session:join', { sessionId: 's1' });
    const events = socket.getEmittedEvents();
    expect(events).toHaveLength(2);
    expect(events[0].event).toBe('card:lock:request');
    expect(events[0].args).toEqual([{ cardId: 'c1' }]);
    expect(events[1].event).toBe('session:join');
  });

  it('getLastEmit returns last payload for an event', () => {
    const socket = createMockSocket();
    socket.emit('card:lock:request', { cardId: 'c1' });
    socket.emit('card:lock:request', { cardId: 'c2' });
    const last = socket.getLastEmit('card:lock:request');
    expect(last).toEqual([{ cardId: 'c2' }]);
  });

  it('getLastEmit returns undefined for unrecorded event', () => {
    const socket = createMockSocket();
    expect(socket.getLastEmit('nonexistent')).toBeUndefined();
  });

  it('clearEmittedEvents removes all recorded events', () => {
    const socket = createMockSocket();
    socket.emit('test', 'data');
    socket.clearEmittedEvents();
    expect(socket.getEmittedEvents()).toHaveLength(0);
  });

  it('simulateEvent triggers registered handlers', () => {
    const socket = createMockSocket();
    const received: unknown[] = [];
    socket.on('card:lock:granted', (payload: unknown) => {
      received.push(payload);
    });
    socket.simulateEvent('card:lock:granted', {
      cardId: 'c1',
      holder: { holderId: 'u1' },
    });
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({
      cardId: 'c1',
      holder: { holderId: 'u1' },
    });
  });

  it('off removes specific handler', () => {
    const socket = createMockSocket();
    const calls: number[] = [];
    const handler = () => calls.push(1);
    socket.on('test', handler);
    socket.simulateEvent('test');
    expect(calls).toHaveLength(1);

    socket.off('test', handler);
    socket.simulateEvent('test');
    expect(calls).toHaveLength(1); // still 1, handler removed
  });

  it('off without handler removes all handlers for event', () => {
    const socket = createMockSocket();
    const calls: number[] = [];
    socket.on('test', () => calls.push(1));
    socket.on('test', () => calls.push(2));
    socket.simulateEvent('test');
    expect(calls).toHaveLength(2);

    socket.off('test');
    socket.simulateEvent('test');
    expect(calls).toHaveLength(2); // still 2
  });

  it('simulateDisconnect triggers disconnect event', () => {
    const socket = createMockSocket();
    socket.connect();
    let disconnected = false;
    socket.on('disconnect', () => {
      disconnected = true;
    });
    socket.simulateDisconnect();
    expect(socket.connected).toBe(false);
    expect(disconnected).toBe(true);
  });

  it('simulateReconnect triggers connect event', () => {
    const socket = createMockSocket();
    let connected = false;
    socket.on('connect', () => {
      connected = true;
    });
    socket.simulateReconnect();
    expect(socket.connected).toBe(true);
    expect(connected).toBe(true);
  });

  it('supports multiple handlers for the same event', () => {
    const socket = createMockSocket();
    const results: string[] = [];
    socket.on('test', () => results.push('a'));
    socket.on('test', () => results.push('b'));
    socket.simulateEvent('test');
    expect(results).toEqual(['a', 'b']);
  });

  it('on/off/emit are chainable', () => {
    const socket = createMockSocket();
    const handler = () => {};
    const result = socket
      .on('test', handler)
      .emit('test', 'data')
      .off('test', handler);
    expect(result).toBe(socket);
  });
});
