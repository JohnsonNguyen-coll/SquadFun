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
import { initSocket } from './services/socketService.js';
import { connectRedis } from './services/redis.js';

dotenv.config();

// BigInt serialization fix
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
app.set('trust proxy', 1); // Trust Railway proxy
const httpServer = createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000 // 1000 requests per minute
});
app.use('/api/', limiter);

// Routes
app.use('/api', apiRoutes);

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
