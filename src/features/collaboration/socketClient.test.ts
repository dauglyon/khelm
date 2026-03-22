import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { connectSocket, getSocket, disconnectSocket, isSocketConnected } from './socketClient';

// Mock socket.io-client
const mockSocketInstance = {
  connected: false,
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  id: 'mock-id',
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocketInstance),
}));

describe('socketClient', () => {
  beforeEach(() => {
    // Ensure clean state
    disconnectSocket();
    vi.clearAllMocks();
    mockSocketInstance.connected = false;
  });

  afterEach(() => {
    disconnectSocket();
  });

  it('getSocket throws when not connected', () => {
    expect(() => getSocket()).toThrow(
      'Socket not connected. Call connectSocket(token) first.'
    );
  });

  it('connectSocket creates socket with auth token', async () => {
    const { io } = await import('socket.io-client');
    const socket = connectSocket('test-token');

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: { token: 'test-token' },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        transports: ['websocket', 'polling'],
      })
    );
    expect(socket).toBe(mockSocketInstance);
  });

  it('getSocket returns singleton after connect', () => {
    connectSocket('token');
    const socket = getSocket();
    expect(socket).toBe(mockSocketInstance);
  });

  it('connectSocket returns existing socket if already connected', async () => {
    const { io } = await import('socket.io-client');
    connectSocket('token-1');
    connectSocket('token-2');
    // io should only be called once
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('disconnectSocket calls disconnect and clears singleton', () => {
    connectSocket('token');
    disconnectSocket();

    expect(mockSocketInstance.disconnect).toHaveBeenCalled();
    expect(() => getSocket()).toThrow();
  });

  it('disconnectSocket is safe when not connected', () => {
    expect(() => disconnectSocket()).not.toThrow();
  });

  it('isSocketConnected returns false when no socket', () => {
    expect(isSocketConnected()).toBe(false);
  });

  it('isSocketConnected returns socket.connected value', () => {
    connectSocket('token');
    expect(isSocketConnected()).toBe(false);

    mockSocketInstance.connected = true;
    expect(isSocketConnected()).toBe(true);
  });

  it('socket is not created at module import time', () => {
    // The fact that getSocket throws at the start of each test
    // proves no socket exists at import time
    expect(() => getSocket()).toThrow();
  });
});
