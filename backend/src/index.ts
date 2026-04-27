import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';
import { startIndexer } from './services/indexer.js';
import { connectRedis } from './services/redis.js';

dotenv.config();

// BigInt serialization fix
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Routes
app.use('/api', apiRoutes);

// Socket.io logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', (address) => {
    console.log(`Subscribing to ${address}`);
    socket.join(address);
  });

  socket.on('unsubscribe', (address) => {
    console.log(`Unsubscribing from ${address}`);
    socket.leave(address);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Broadcast function
export const broadcast = (address: string, type: string, data: any) => {
  // Emit to specific token room
  io.to(address).emit(type, data);
  // Also emit to global feed for ticker/market
  io.emit('global_update', { address, type, data });
};

httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Connect to Redis
  try {
    await connectRedis();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }

  // Start the blockchain indexer
  try {
    await startIndexer();
  } catch (error) {
    console.error('Failed to start indexer:', error);
  }
});
