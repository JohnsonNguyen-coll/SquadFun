import { io } from 'socket.io-client';
import { API_BASE_URL } from './config/constants';

// Replace /api from URL to get base URL for socket
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.io server:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket.io connection error:', error);
});
