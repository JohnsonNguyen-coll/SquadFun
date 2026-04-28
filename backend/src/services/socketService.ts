import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe', (address) => {
      const lowerAddress = address.toLowerCase();
      console.log(`Subscribing to ${lowerAddress}`);
      socket.join(lowerAddress);
    });

    socket.on('unsubscribe', (address) => {
      const lowerAddress = address.toLowerCase();
      console.log(`Unsubscribing from ${lowerAddress}`);
      socket.leave(lowerAddress);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

export const broadcast = (address: string, type: string, data: any) => {
  if (!io) {
    console.warn('Socket.io not initialized, cannot broadcast');
    return;
  }
  const lowerAddress = address.toLowerCase();
  // Emit to specific token room
  io.to(lowerAddress).emit(type, data);
  // Also emit to global feed
  io.emit('global_update', { address: lowerAddress, type, data });
};
