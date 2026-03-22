/**
 * Singleton Socket.IO client manager.
 * Handles connection, authentication, and reconnection.
 * No room-joining or business logic — just the transport layer.
 *
 * Architecture reference: collaboration.md sections 1 and 10.
 */

import { io } from 'socket.io-client';
import type { TypedSocket } from './types';

let socket: TypedSocket | null = null;

/**
 * Creates and connects the Socket.IO client with the given auth token.
 * The socket is pointed at VITE_WS_URL with exponential backoff reconnection.
 */
export function connectSocket(token: string): TypedSocket {
  if (socket) {
    return socket;
  }

  const url = import.meta.env.VITE_WS_URL as string;

  socket = io(url, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling'],
  }) as TypedSocket;

  return socket;
}

/**
 * Returns the singleton Socket.IO instance.
 * Throws if the socket has not been connected yet.
 */
export function getSocket(): TypedSocket {
  if (!socket) {
    throw new Error(
      'Socket not connected. Call connectSocket(token) first.'
    );
  }
  return socket;
}

/**
 * Disconnects the socket and clears the singleton reference.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Returns whether the socket is currently connected.
 * Does not throw if no socket exists (returns false).
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
